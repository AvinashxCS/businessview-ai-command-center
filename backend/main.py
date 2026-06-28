import os
import re
from dotenv import load_dotenv

# Load env variables before other imports so they are available in graph/vector_store
load_dotenv()

from fastapi import FastAPI, Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import build_graph, call_llm
import json
from apscheduler.schedulers.background import BackgroundScheduler
from integrations.salesforce_sync import run_salesforce_sync
from integrations.razorpay_sync import run_razorpay_sync

app = FastAPI(title="BusinessView AI Command Center API")

# Define API Key security middleware
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(api_key: str = Depends(api_key_header)):
    expected_key = os.getenv("APP_API_KEY")
    if not expected_key:
        return
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate API key"
        )

# Add CORS Middleware to allow requests from specific React frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()

# Setup Scheduler for 4-hour background sync (Cost-control recommendation)
scheduler = BackgroundScheduler()
scheduler.add_job(run_salesforce_sync, 'interval', hours=4)
scheduler.add_job(run_razorpay_sync, 'interval', hours=4)
scheduler.start()

# Run an immediate dry-run sync in the background at startup to populate database
try:
    scheduler.add_job(run_salesforce_sync, 'date')
    scheduler.add_job(run_razorpay_sync, 'date')
except Exception as e:
    print(f"Startup sync job run failed: {e}")

class QueryRequest(BaseModel):
    query: str


class CompanySearchRequest(BaseModel):
    company_name: str

@app.post("/query", dependencies=[Depends(verify_api_key)])
async def run_query(request: QueryRequest):
    result = graph.invoke({
        "query": request.query,
        "relevant_agents": [],
        "sales_output": {},
        "finance_output": {},
        "marketing_output": {},
        "supply_chain_output": {},
        "support_output": {},
        "operations_output": {},
        "memory_context": [],
        "final_report": ""
    })
    return {
        "query": request.query,
        "agents_consulted": result["relevant_agents"],
        "report": result["final_report"],
        "raw_outputs": {
            "sales": result.get("sales_output"),
            "finance": result.get("finance_output"),
            "marketing": result.get("marketing_output"),
            "supply_chain": result.get("supply_chain_output"),
            "support": result.get("support_output"),
            "operations": result.get("operations_output")
        }
    }

@app.post("/search_company", dependencies=[Depends(verify_api_key)])
async def search_company(request: CompanySearchRequest):
    # Sanitize input to prevent prompt injection
    clean_name = re.sub(r"[^a-zA-Z0-9\s.,-]", "", request.company_name)[:100].strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Invalid company name")

    # 1. Load companies database cache (Zero-cost recommendation)
    cache_path = os.path.join(os.path.dirname(__file__), "data", "companies_data.json")
    with open(cache_path) as f:
        companies = json.load(f)
    
    company_key = clean_name.lower().strip()
    
    # 2. Lookup data
    company_data = companies.get(company_key)
    if not company_data:
        # Try case-insensitive prefix matching
        for k, val in companies.items():
            if company_key in k or k in company_key:
                company_data = val
                break
                
    if not company_data:
        # Return fallback mock company if not in cache (Zero-cost fallback)
        company_data = {
            "name": clean_name,
            "ticker": "UNKNOWN",
            "financials": { "market_cap": 0, "revenue": 0, "revenue_growth_pct": 0, "net_income": 0, "gross_margin_pct": 0, "cash_position": 0 },
            "sales": { "pipeline_value": 0, "active_deals": 0, "win_rate_pct": 0, "velocity_days": 0, "segments": {} },
            "marketing": { "brand_sentiment_score": 0.5, "sentiment_trend": "stable", "cac_usd": 0, "ltv_cac_ratio": 0, "channel_mix_pct": {}, "active_campaign": "None" }
        }

    # 3. Call Market Intelligence Agent LLM
    from agents.market_intelligence import MARKET_INTELLIGENCE_AGENT_SYSTEM_PROMPT
    prompt = f"Analyze this company profile and provide structured intelligence report: {clean_name}\n\nData: {json.dumps(company_data)}"
    response_raw = call_llm(MARKET_INTELLIGENCE_AGENT_SYSTEM_PROMPT, prompt)
    
    try:
        if "```json" in response_raw:
            response_raw = response_raw.split("```json")[1].split("```")[0].strip()
        elif "```" in response_raw:
            response_raw = response_raw.split("```")[1].split("```")[0].strip()
        result = json.loads(response_raw)
    except Exception as e:
        print(f"Failed to parse intelligence JSON: {e}. Returning raw data.")
        result = company_data
        
    return {
        "company": clean_name,
        "data": result
    }

@app.get("/health", dependencies=[Depends(verify_api_key)])
async def health():
    return {"status": "online", "agents": 6}

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    dev_mode = os.getenv("DEV_MODE", "true").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0" if dev_mode else "127.0.0.1", port=8000, reload=dev_mode)
