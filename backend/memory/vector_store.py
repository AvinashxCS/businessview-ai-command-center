import os
import json
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vector_store")

# Check credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GITHUB_API_KEY = os.getenv("GITHUB_MODELS_API_KEY")
GITHUB_ENDPOINT = os.getenv("GITHUB_MODELS_ENDPOINT", "https://models.inference.ai.azure.com")

USE_MOCK = False

if not SUPABASE_URL or not SUPABASE_KEY or not GITHUB_API_KEY:
    logger.warning("Supabase URL, Key or GitHub Models API Key is missing. Vector Store will run in Mock Mode.")
    USE_MOCK = True

# Mock Vector Store database
_mock_db = [
    {
        "agent_name": "operations",
        "content": "Previous infrastructure cost spike identified in compute resources due to data migration idle clusters.",
        "metadata": {"type": "cost_spike", "service": "compute"},
        "created_at": "2026-05-27T12:00:00Z"
    },
    {
        "agent_name": "support",
        "content": "API timeouts have historically caused CSAT drops and customer complaints during onboarding.",
        "metadata": {"type": "csat_drop"},
        "created_at": "2026-05-15T10:30:00Z"
    }
]

# Initialize clients if not in mock mode
supabase = None
embedder = None

if not USE_MOCK:
    try:
        from supabase import create_client
        from openai import OpenAI
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        embedder = OpenAI(
            base_url=GITHUB_ENDPOINT,
            api_key=GITHUB_API_KEY
        )
    except Exception as e:
        logger.error(f"Error initializing Supabase or OpenAI client: {e}. Switching to Mock Mode.")
        USE_MOCK = True

def store_anomaly(agent_name: str, content: str, metadata: dict):
    if USE_MOCK:
        logger.info(f"[MOCK STORE] Storing anomaly for agent {agent_name}: {content}")
        _mock_db.append({
            "agent_name": agent_name,
            "content": content,
            "metadata": metadata,
            "created_at": "2026-06-27T12:00:00Z"
        })
        return
        
    try:
        embedding = embedder.embeddings.create(
            model="text-embedding-3-small",
            input=content
        ).data[0].embedding
        supabase.table("business_context").insert({
            "agent_name": agent_name,
            "content": content,
            "embedding": embedding,
            "metadata": metadata
        }).execute()
    except Exception as e:
        logger.error(f"Failed to store anomaly in Supabase: {e}. Falling back to mock store.")
        _mock_db.append({
            "agent_name": agent_name,
            "content": content,
            "metadata": metadata,
            "created_at": "2026-06-27T12:00:00Z"
        })

def retrieve_similar(query: str, top_k: int = 5) -> list:
    if USE_MOCK:
        logger.info(f"[MOCK RETRIEVE] Retrieving similar context for query: {query}")
        # Return mock records with dummy similarity score
        results = []
        for idx, item in enumerate(_mock_db[:top_k]):
            results.append({
                "id": f"mock-uuid-{idx}",
                "agent_name": item["agent_name"],
                "content": item["content"],
                "metadata": item["metadata"],
                "created_at": item["created_at"],
                "similarity": 0.85 - (idx * 0.05)
            })
        return results

    try:
        embedding = embedder.embeddings.create(
            model="text-embedding-3-small",
            input=query
        ).data[0].embedding
        result = supabase.rpc("match_business_context", {
            "query_embedding": embedding,
            "match_count": top_k
        }).execute()
        return result.data
    except Exception as e:
        logger.error(f"Failed to retrieve from Supabase: {e}. Falling back to mock retrieve.")
        results = []
        for idx, item in enumerate(_mock_db[:top_k]):
            results.append({
                "id": f"mock-uuid-{idx}",
                "agent_name": item["agent_name"],
                "content": item["content"],
                "metadata": item["metadata"],
                "created_at": item["created_at"],
                "similarity": 0.85 - (idx * 0.05)
            })
        return results
