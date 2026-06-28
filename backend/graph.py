from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator
import json
import os
import logging
from openai import OpenAI
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("graph")

# --- State Definition ---
class AgentState(TypedDict):
    query: str
    relevant_agents: List[str]
    sales_output: dict
    finance_output: dict
    marketing_output: dict
    supply_chain_output: dict
    support_output: dict
    operations_output: dict
    memory_context: List[dict]
    final_report: str

# --- LLM Clients Initialization ---
GITHUB_API_KEY = os.getenv("GITHUB_MODELS_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

primary_llm = None
fallback_llm = None

# Smart check for mock mode
IS_LLM_MOCK = False
if not GITHUB_API_KEY and not GROQ_API_KEY:
    logger.warning("No LLM API keys provided (GITHUB_MODELS_API_KEY or GROQ_API_KEY). Running Graph in Mock LLM mode.")
    IS_LLM_MOCK = True

if not IS_LLM_MOCK:
    try:
        if GITHUB_API_KEY:
            primary_llm = OpenAI(
                base_url=os.getenv("GITHUB_MODELS_ENDPOINT", "https://models.inference.ai.azure.com"),
                api_key=GITHUB_API_KEY
            )
        if GROQ_API_KEY:
            fallback_llm = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.error(f"Error initializing LLM clients: {e}. Graph will fallback to Mock LLM mode.")
        IS_LLM_MOCK = True

# --- LLM Call Wrapper with Mock Engine ---
def call_llm(system: str, user: str, use_fallback=False) -> str:
    if IS_LLM_MOCK:
        return call_llm_mock(system, user)
        
    try:
        if use_fallback or not primary_llm:
            raise Exception("Force fallback to Groq")
            
        resp = primary_llm.chat.completions.create(
            model=os.getenv("PRIMARY_MODEL", "gpt-4o"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            response_format={"type": "json_object"} if "json" in system.lower() or "json" in user.lower() else None
        )
        return resp.choices[0].message.content
    except Exception as e:
        logger.warning(f"Primary LLM failed: {e}. Trying fallback LLM...")
        if fallback_llm:
            try:
                resp = fallback_llm.chat.completions.create(
                    model=os.getenv("FALLBACK_MODEL", "llama-3.3-70b-versatile"),
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user}
                    ]
                )
                return resp.choices[0].message.content
            except Exception as e2:
                logger.error(f"Fallback LLM also failed: {e2}. Defaulting to Mock response.")
                return call_llm_mock(system, user)
        else:
            logger.error("Fallback LLM client is not configured. Defaulting to Mock response.")
            return call_llm_mock(system, user)

# --- Mock LLM Implementation ---
def call_llm_mock(system: str, user: str) -> str:
    system_lower = system.lower()
    
    # 1. Router Agent Mock
    if "routing agent" in system_lower or "router" in system_lower:
        agents = []
        user_lower = user.lower()
        if any(w in user_lower for w in ["sale", "deal", "pipeline", "forecast", "win rate"]):
            agents.append("sales")
        if any(w in user_lower for w in ["finance", "burn", "runway", "cash", "expense", "mrr", "arr"]):
            agents.append("finance")
        if any(w in user_lower for w in ["marketing", "cac", "ltv", "campaign", "cpc", "sentiment"]):
            agents.append("marketing")
        if any(w in user_lower for w in ["supply", "inventory", "vendor", "sku", "delay", "logistics"]):
            agents.append("supply_chain")
        if any(w in user_lower for w in ["support", "ticket", "csat", "nps", "churn"]):
            agents.append("support")
        if any(w in user_lower for w in ["operations", "uptime", "incident", "mttr", "utilization", "bottleneck"]):
            agents.append("operations")
            
        if not agents:
            agents = ["sales", "finance", "marketing", "supply_chain", "support", "operations"]
        return json.dumps({"agents": agents})

    # 1.5. Market Intelligence Agent Mock
    if "market intelligence agent" in system_lower:
        user_lower = user.lower()
        company_name = "NVIDIA Corporation"
        ticker = "NVDA"
        financials = {"market_cap": 3150000000000, "revenue": 96310000000, "revenue_growth_pct": 122.0, "net_income": 53000000000, "gross_margin_pct": 75.3, "cash_position": 34800000000}
        sales = {"pipeline_value": 24000000000, "active_deals": 340, "win_rate_pct": 68.0, "velocity_days": 45, "segments": {"Data Center": 83.0, "Gaming": 11.0, "Professional Visualization": 3.0, "Automotive": 3.0}}
        marketing = {"brand_sentiment_score": 0.88, "sentiment_trend": "improving", "cac_usd": 48000, "ltv_cac_ratio": 12.4, "channel_mix_pct": {"Developer Outreach": 45.0, "Events & Conferences": 25.0, "Paid Search": 15.0, "Direct Enterprise": 15.0}, "active_campaign": "Blackwell Enterprise AI Adoption"}

        if "tesla" in user_lower:
            company_name = "Tesla, Inc."
            ticker = "TSLA"
            financials = {"market_cap": 620000000000, "revenue": 96770000000, "revenue_growth_pct": 3.0, "net_income": 15000000000, "gross_margin_pct": 18.2, "cash_position": 29000000000}
            sales = {"pipeline_value": 6800000000, "active_deals": 185, "win_rate_pct": 45.0, "velocity_days": 24, "segments": {"Automotive sales": 81.0, "Energy generation & storage": 11.0, "Services & Other": 8.0}}
            marketing = {"brand_sentiment_score": 0.61, "sentiment_trend": "declining", "cac_usd": 150, "ltv_cac_ratio": 24.5, "channel_mix_pct": {"Referrals & Word of Mouth": 60.0, "Digital & PR Events": 20.0, "Social Media Ads": 10.0, "Direct Email": 10.0}, "active_campaign": "Full Self-Driving FSD Supervised V12"}
        elif "google" in user_lower or "alphabet" in user_lower:
            company_name = "Alphabet Inc."
            ticker = "GOOGL"
            financials = {"market_cap": 2180000000000, "revenue": 307390000000, "revenue_growth_pct": 14.0, "net_income": 73790000000, "gross_margin_pct": 56.8, "cash_position": 110900000000}
            sales = {"pipeline_value": 18200000000, "active_deals": 512, "win_rate_pct": 54.0, "velocity_days": 52, "segments": {"Google Search & Ads": 71.0, "Google Cloud": 12.0, "YouTube Ads": 10.0, "Other Bets & Subscriptions": 7.0}}
            marketing = {"brand_sentiment_score": 0.76, "sentiment_trend": "stable", "cac_usd": 120, "ltv_cac_ratio": 9.8, "channel_mix_pct": {"Organic Search": 55.0, "YouTube Campaigns": 20.0, "Partner Ecosystem": 15.0, "Paid Social": 10.0}, "active_campaign": "Gemini AI Workspace Integration"}
        elif "apple" in user_lower:
            company_name = "Apple Inc."
            ticker = "AAPL"
            financials = {"market_cap": 3320000000000, "revenue": 385600000000, "revenue_growth_pct": 6.0, "net_income": 97000000000, "gross_margin_pct": 46.2, "cash_position": 67000000000}
            sales = {"pipeline_value": 12500000000, "active_deals": 210, "win_rate_pct": 62.0, "velocity_days": 30, "segments": {"iPhone": 51.0, "Services": 24.0, "Wearables & Accessories": 10.0, "Mac": 8.0, "iPad": 7.0}}
            marketing = {"brand_sentiment_score": 0.91, "sentiment_trend": "improving", "cac_usd": 850, "ltv_cac_ratio": 15.2, "channel_mix_pct": {"Direct Apple Store": 50.0, "Brand Ads & Keynotes": 25.0, "Search Ads": 15.0, "Affiliate Networks": 10.0}, "active_campaign": "Apple Intelligence Privacy-First AI"}
        elif "microsoft" in user_lower:
            company_name = "Microsoft Corporation"
            ticker = "MSFT"
            financials = {"market_cap": 3210000000000, "revenue": 245120000000, "revenue_growth_pct": 16.0, "net_income": 88100000000, "gross_margin_pct": 70.1, "cash_position": 75500000000}
            sales = {"pipeline_value": 29800000000, "active_deals": 880, "win_rate_pct": 59.0, "velocity_days": 58, "segments": {"Intelligent Cloud (Azure)": 43.0, "Productivity (Office/SaaS)": 32.0, "More Personal Computing (Windows/Xbox)": 25.0}}
            marketing = {"brand_sentiment_score": 0.82, "sentiment_trend": "improving", "cac_usd": 4200, "ltv_cac_ratio": 8.4, "channel_mix_pct": {"Enterprise Sales Field": 40.0, "Partner Networks": 30.0, "Digital Ads": 15.0, "Community Outreach": 15.0}, "active_campaign": "Copilot Studio Enterprise Platform"}

        return json.dumps({
            "company_details": {"name": company_name, "ticker": ticker},
            "financials": financials,
            "sales": sales,
            "marketing": marketing,
            "risks": [
                {"description": f"Competitive pressures in core product sectors for {company_name}.", "severity": "medium", "impact_usd": 50000000}
            ],
            "recommendations": [
                f"Expand R&D investments in next-generation AI and system optimization for {company_name}."
            ]
        })

    # 2. Finance Agent Mock
    if "finance agent" in system_lower:
        return json.dumps({
          "burn_analysis": { "current": 218000, "trend": "accelerating", "delta_pct_mom": 14.74 },
          "runway": { "months": 19, "risk_level": "medium" },
          "anomalies": [ { "category": "infrastructure", "delta_pct": 28.0, "likely_cause": "idle compute cluster post data migration" } ],
          "revenue_health": { "mrr": 352000, "growth_pct": 11.0, "assessment": "stable growth" },
          "risks": [ { "description": "Burn rate accelerated from 190k to 218k MoM", "severity": "medium", "impact_usd": 28000 } ],
          "recommendations": [ "Audit and terminate idle compute clusters immediately to curb infrastructure burn." ]
        })

    # 3. Sales Agent Mock
    if "sales agent" in system_lower:
        return json.dumps({
          "pipeline_summary": {
            "total_value": 1820000,
            "total_deals": 47,
            "avg_deal_size": 38723,
            "win_rate_pct": 42,
            "velocity_days": 34
          },
          "stage_analysis": {
            "stages": { "lead": 18, "qualified": 12, "proposal": 9, "negotiation": 5, "closed_won": 3 },
            "bottlenecks": [ "Negotiation stage deals stalled" ]
          },
          "stalled_deals": [
            { "id": "D-201", "value": 62000, "stage": "negotiation", "stalled_days": 17 },
            { "id": "D-188", "value": 45000, "stage": "negotiation", "stalled_days": 15 }
          ],
          "forecast": {
            "best_case": 520000,
            "likely": 390000,
            "worst_case": 260000,
            "confidence": "medium"
          },
          "risks": [
            { "description": "Two high-value deals (D-201, D-188) stalled in negotiation for over 15 days.", "severity": "medium", "impact_usd": 107000 }
          ],
          "recommendations": [ "Assign executive sponsors to stalled negotiation deals D-201 and D-188." ]
        })

    # 4. Marketing Agent Mock
    if "marketing agent" in system_lower:
        return json.dumps({
          "cac_metrics": {
            "cac": 1240,
            "prev_cac": 1140,
            "growth_pct": 8.77
          },
          "ltv_efficiency": {
            "ltv": 8900,
            "ltv_cac_ratio": 7.2,
            "assessment": "excellent"
          },
          "campaigns": [
            { "name": "Summer outbound", "spend": 18000, "leads_generated": 142, "target_leads": 162, "roi_pct": 210 }
          ],
          "sentiment": {
            "score": 0.64,
            "prev_score": 0.71,
            "trend": "declining",
            "sources": ["twitter", "g2", "capterra"]
          },
          "risks": [
            { "description": "Brand sentiment declined from 0.71 to 0.64, primarily on Twitter and G2.", "severity": "medium", "impact_usd": 50000 },
            { "description": "CAC increased 8.77% mom from $1140 to $1240.", "severity": "low", "impact_usd": 15000 }
          ],
          "recommendations": [ "Analyze recent sentiment trends on G2/Twitter to identify customer friction points." ]
        })

    # 5. Supply Chain Agent Mock
    if "supply chain agent" in system_lower:
        return json.dumps({
          "inventory_health": {
            "total_skus": 84,
            "at_risk_skus": 3,
            "stockout_probability_pct": 31
          },
          "vendor_performance": [
            { "id": "V-041", "name": "SEA Logistics Co", "lead_time_days": 28, "delay_days": 11, "region": "Southeast Asia", "cause": "port congestion" }
          ],
          "logistics": {
            "cost_usd": 42000,
            "geopolitical_risk_level": "medium"
          },
          "alerts": [
            { "type": "delay", "vendor_id": "V-041", "affected_skus": ["SKU-441", "SKU-382", "SKU-517"], "revenue_impact_usd": 280000, "severity": "critical", "reorder_deadline": "end_of_week" }
          ],
          "risks": [
            { "description": "Critical logistics delay with SEA Logistics Co affecting SKUs 441, 382, and 517.", "severity": "critical", "impact_usd": 280000 }
          ],
          "recommendations": [ "Initiate secondary vendor backup for critical SKUs prior to the end of week deadline." ]
        })

    # 6. Support Agent Mock
    if "support agent" in system_lower:
        return json.dumps({
          "ticket_metrics": {
            "open": 143,
            "avg_resolution_hrs": 9.4,
            "prev_avg_resolution_hrs": 7.1,
            "backlog_growth_pct": 22.0
          },
          "scores": {
            "csat_pct": 71,
            "prev_csat_pct": 77,
            "nps": 28
          },
          "churn_risks": [
            { "account_id": "A-882", "arr": 48000, "risk_level": "high", "sentiment_score": -0.72 },
            { "account_id": "A-901", "arr": 35000, "risk_level": "high", "sentiment_score": -0.61 }
          ],
          "top_issues": [ "onboarding", "billing", "api_timeouts", "missing_feature" ],
          "backlog_root_cause": "QA pipeline bottleneck blocking API timeout fix deployment",
          "risks": [
            { "description": "ARR at risk from high-churn signals in accounts A-882 and A-901.", "severity": "high", "impact_usd": 83000 }
          ],
          "recommendations": [ "Deploy engineering resources to unblock the QA pipeline and resolve API timeouts." ]
        })

    # 7. Operations Agent Mock
    if "operations agent" in system_lower:
        return json.dumps({
          "system_performance": {
            "uptime_pct": 97.2,
            "incidents_mtd": 2,
            "mttr_hrs": 1.4
          },
          "resource_utilization": {
            "eng_utilization_pct": 84,
            "bottlenecks": [ "QA pipeline", "data migration cleanup" ]
          },
          "productivity_index": 0.81,
          "process_health": "green",
          "infra_alerts": [
            { "type": "cost_spike", "service": "compute", "delta_pct": 28.0, "cause": "idle cluster not terminated post data migration", "monthly_waste_usd": 4200 }
          ],
          "risks": [
            { "description": "System uptime at 97.2% due to data migration incidents.", "severity": "high", "impact_usd": 45000 },
            { "description": "QA pipeline bottleneck causing engineering resource utilization to spike to 84%.", "severity": "medium", "impact_usd": 20000 }
          ],
          "recommendations": [ "Decommission idle data migration compute clusters to save $4,200 monthly waste." ]
        })

    # 8. Chief of Staff Synthesizer Mock
    if "chief of staff" in system_lower or "synthesizer" in system_lower:
        return """EXECUTIVE SUMMARY
The company is facing mixed performance metrics this month. While MRR is stable at $352,000 with 11% growth, severe operational and supply chain risks threaten overall margins. The primary risks involve a critical $280,000 Q4 revenue impact due to vendor shipping delays from SEA Logistics Co, and customer CSAT has slipped to 71% alongside high-risk churn signals for accounts A-882 and A-901 totaling $83,000 ARR. Engineering resources are constrained (84% utilization) by a QA pipeline bottleneck that is blocking the deployment of crucial API timeout fixes.

RISK MATRIX
- Severity: Critical | Departments: Supply Chain | Impact: $280,000 | Description: Critical logistics delay with SEA Logistics Co affecting SKUs 441, 382, and 517.
- Severity: High | Departments: Support | Impact: $83,000 | Description: ARR at risk from high-churn signals in accounts A-882 and A-901.
- Severity: High | Departments: Operations | Impact: $45,000 | Description: Degraded server uptime at 97.2% due to unresolved API timeouts and QA bottlenecks.
- Severity: Medium | Departments: Finance | Impact: $28,000 | Description: Burn rate accelerated from 190k to 218k MoM.
- Severity: Medium | Departments: Sales | Impact: $107,000 | Description: Stalled negotiation stage deals (D-201 and D-188) past velocity limits.

REVENUE FORECAST
Q3 forecast indicates a likely scenario of $390,000, with a best-case of $520,000 and worst-case of $260,000. LTV/CAC ratio remains strong at 7.2x, but sales pipeline velocity stands at 34 days, and overall lead acquisition cost (CAC) has risen 8.77% to $1,240. Given the pending shipping bottlenecks and churn risks, our confidence level in achieving the Q3 target is Medium.

ANOMALY ALERTS
- Infrastructure cost spike: Compute expense rose by 28% MoM (actual $22,000 vs expected $17,200) due to an idle cluster left running after data migration.
- CSAT drop: CSAT declined from 77% to 71% due to unresolved API timeouts.
- Backlog growth: Support ticket backlog grew by 22% due to the QA bottleneck.

RECOMMENDED ACTIONS
[Priority 1] Terminate idle data migration compute cluster — Operations — 2 days — Saves $4,200 monthly waste.
[Priority 2] Resolve QA pipeline bottleneck and deploy API timeout fix — Operations & Support — 5 days — Mitigates $83,000 ARR churn risk and restores CSAT.
[Priority 3] Order inventory replacements from backup vendors — Supply Chain — End of Week — Protects $280,000 Q4 revenue impact.
[Priority 4] Deploy executive sponsors to stalled negotiation deals D-201 and D-188 — Sales — 7 days — Secures $107,000 in pipeline value.
"""
    return "Mock Response"

# --- Router Node ---
def router(state: AgentState) -> dict:
    """Synthesizer decides which agents to query based on the question."""
    routing_prompt = """
    Given this executive query, return a JSON object with key "agents" 
    containing a list of relevant agents to consult. Choose from: 
    ["sales", "finance", "marketing", "supply_chain", "support", "operations"].
    Only include agents whose domain is relevant to the query.
    Query: """ + state["query"]
    agents = []
    try:
        result_raw = call_llm("You are a routing agent.", routing_prompt)
        # Handle cleanup of code blocks if returned
        if "```json" in result_raw:
            result_raw = result_raw.split("```json")[1].split("```")[0].strip()
        elif "```" in result_raw:
            result_raw = result_raw.split("```")[1].split("```")[0].strip()
        result = json.loads(result_raw)
        agents = result.get("agents", [])
    except Exception as e:
        logger.error(f"Router failed to parse JSON: {e}. Consulting all agents.")
        agents = ["sales", "finance", "marketing", "supply_chain", "support", "operations"]
    return {"relevant_agents": agents}

# --- Specialist Agent Nodes ---
def load_data(filename: str) -> dict:
    path = os.path.join(os.path.dirname(__file__), "data", filename)
    with open(path) as f:
        return json.load(f)

def sales_node(state: AgentState) -> dict:
    if "sales" not in state.get("relevant_agents", []):
        return {"sales_output": {}}
    data = load_data("sales_data.json")
    from agents.sales import SALES_AGENT_SYSTEM_PROMPT
    result = call_llm(SALES_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    sales_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        sales_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Sales node failed to parse JSON: {e}")
    return {"sales_output": sales_output}

def finance_node(state: AgentState) -> dict:
    if "finance" not in state.get("relevant_agents", []):
        return {"finance_output": {}}
    data = load_data("finance_data.json")
    from agents.finance import FINANCE_AGENT_SYSTEM_PROMPT
    result = call_llm(FINANCE_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    finance_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        finance_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Finance node failed to parse JSON: {e}")
    return {"finance_output": finance_output}

def marketing_node(state: AgentState) -> dict:
    if "marketing" not in state.get("relevant_agents", []):
        return {"marketing_output": {}}
    data = load_data("marketing_data.json")
    from agents.marketing import MARKETING_AGENT_SYSTEM_PROMPT
    result = call_llm(MARKETING_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    marketing_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        marketing_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Marketing node failed to parse JSON: {e}")
    return {"marketing_output": marketing_output}

def supply_chain_node(state: AgentState) -> dict:
    if "supply_chain" not in state.get("relevant_agents", []):
        return {"supply_chain_output": {}}
    data = load_data("supply_chain_data.json")
    from agents.supply_chain import SUPPLY_CHAIN_AGENT_SYSTEM_PROMPT
    result = call_llm(SUPPLY_CHAIN_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    supply_chain_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        supply_chain_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Supply chain node failed to parse JSON: {e}")
    return {"supply_chain_output": supply_chain_output}

def support_node(state: AgentState) -> dict:
    if "support" not in state.get("relevant_agents", []):
        return {"support_output": {}}
    data = load_data("support_data.json")
    from agents.support import SUPPORT_AGENT_SYSTEM_PROMPT
    result = call_llm(SUPPORT_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    support_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        support_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Support node failed to parse JSON: {e}")
    return {"support_output": support_output}

def operations_node(state: AgentState) -> dict:
    if "operations" not in state.get("relevant_agents", []):
        return {"operations_output": {}}
    data = load_data("operations_data.json")
    from agents.operations import OPERATIONS_AGENT_SYSTEM_PROMPT
    result = call_llm(OPERATIONS_AGENT_SYSTEM_PROMPT,
                      f"Analyze this data and answer: {state['query']}\n\nData: {json.dumps(data)}")
    operations_output = {}
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        operations_output = json.loads(result) if result else {}
    except Exception as e:
        logger.error(f"Operations node failed to parse JSON: {e}")
    return {"operations_output": operations_output}

# --- Synthesizer Node ---
def synthesizer_node(state: AgentState) -> dict:
    from agents.synthesizer import SYNTHESIZER_SYSTEM_PROMPT
    from memory.vector_store import retrieve_similar, store_anomaly
    
    # Retrieve similar past context
    memory_context = []
    try:
        memory_context = retrieve_similar(state["query"], top_k=3)
    except Exception as e:
        logger.warning(f"Failed to retrieve memory context: {e}")

    all_outputs = {
        "sales": state.get("sales_output", {}),
        "finance": state.get("finance_output", {}),
        "marketing": state.get("marketing_output", {}),
        "supply_chain": state.get("supply_chain_output", {}),
        "support": state.get("support_output", {}),
        "operations": state.get("operations_output", {}),
        "memory_context": memory_context
    }
    user_msg = f"""
    Executive query: {state['query']}
    
    Agent reports:
    {json.dumps(all_outputs, indent=2)}
    
    Generate the full executive brief with all five required sections.
    """
    report = call_llm(SYNTHESIZER_SYSTEM_PROMPT, user_msg, use_fallback=False)

    # Store any new anomalies detected in this run into vector store
    for dept, output in all_outputs.items():
        if dept in ["memory_context"] or not isinstance(output, dict):
            continue
        # Check if the agent flagged anomalies
        anomalies = output.get("anomalies", []) or output.get("infra_alerts", []) or output.get("alerts", [])
        if anomalies:
            for anomaly in anomalies:
                try:
                    anomaly_content = f"{dept.capitalize()} Alert: {json.dumps(anomaly)}"
                    store_anomaly(dept, anomaly_content, {"query": state["query"], "details": anomaly})
                except Exception as ex:
                    logger.warning(f"Could not store anomaly for {dept}: {ex}")

    return {"final_report": report, "memory_context": memory_context}

# --- Build Graph ---
def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("router", router)
    graph.add_node("sales", sales_node)
    graph.add_node("finance", finance_node)
    graph.add_node("marketing", marketing_node)
    graph.add_node("supply_chain", supply_chain_node)
    graph.add_node("support", support_node)
    graph.add_node("operations", operations_node)
    graph.add_node("synthesizer", synthesizer_node)

    graph.set_entry_point("router")
    for agent in ["sales","finance","marketing","supply_chain","support","operations"]:
        graph.add_edge("router", agent)
        graph.add_edge(agent, "synthesizer")
    graph.add_edge("synthesizer", END)
    return graph.compile()
