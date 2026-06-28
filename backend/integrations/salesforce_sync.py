import os
import sys
import json
import logging
from dotenv import load_dotenv

# Load env variables from backend directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("salesforce_sync")

def run_salesforce_sync():
    sf_user = os.getenv("SF_USERNAME")
    sf_pass = os.getenv("SF_PASSWORD")
    sf_token = os.getenv("SF_SECURITY_TOKEN")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    use_mock = False
    if not sf_user or sf_user == "your_salesforce_developer_email@example.com":
        logger.warning("Salesforce credentials missing. Using local mock sync.")
        use_mock = True

    opportunities = []
    if use_mock:
        opportunities = [
            {"id": "D-201", "name": "Enterprise Deal Alpha", "amount": 62000, "stage_name": "negotiation", "stalled_days": 17},
            {"id": "D-188", "name": "MidMarket Deal Beta", "amount": 45000, "stage_name": "negotiation", "stalled_days": 15},
            {"id": "D-304", "name": "Growth Deal Gamma", "amount": 25000, "stage_name": "proposal", "stalled_days": 2},
            {"id": "D-410", "name": "SaaS Deal Delta", "amount": 18000, "stage_name": "qualified", "stalled_days": 0}
        ]
    else:
        try:
            from simple_salesforce import Salesforce
            sf = Salesforce(username=sf_user, password=sf_pass, security_token=sf_token)
            query = """
                SELECT Id, Name, Amount, StageName, LastModifiedDate 
                FROM Opportunity 
                WHERE IsClosed = false
            """
            results = sf.query_all(query)
            for row in results['records']:
                opportunities.append({
                    "id": row["Id"],
                    "name": row["Name"],
                    "amount": row["Amount"] or 0,
                    "stage_name": row["StageName"],
                    "stalled_days": 0
                })
        except Exception as e:
            logger.error(f"Error fetching from Salesforce API: {e}. Falling back to mock data.")
            opportunities = [
                {"id": "D-201", "name": "Enterprise Deal Alpha", "amount": 62000, "stage_name": "negotiation", "stalled_days": 17},
                {"id": "D-188", "name": "MidMarket Deal Beta", "amount": 45000, "stage_name": "negotiation", "stalled_days": 15}
            ]

    # Write to database if keys exist
    if not supabase_url or supabase_url == "your_supabase_project_url" or not supabase_key:
        logger.warning("Supabase URL or Key missing. Sync complete (Local Dry-run output):")
        print(json.dumps(opportunities, indent=2))
        return
        
    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        for opp in opportunities:
            supabase.table("salesforce_opportunities").upsert(opp).execute()
        logger.info(f"Successfully synced {len(opportunities)} opportunities to Supabase.")
    except Exception as e:
        logger.error(f"Failed to write to Supabase: {e}. Printing dataset below:")
        print(json.dumps(opportunities, indent=2))

if __name__ == "__main__":
    run_salesforce_sync()
