import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  ShieldAlert, 
  AlertOctagon, 
  Sparkles,
  Layers,
  LineChart,
  HelpCircle,
  Network,
  Globe,
  Building2
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import AgentPanel from './components/AgentPanel';
import RiskMatrix from './components/RiskMatrix';
import AnomalyAlerts from './components/AnomalyAlerts';
import RevenueForecast from './components/RevenueForecast';
import Synthesizer from './components/Synthesizer';
import CompanySearch from './components/CompanySearch';
import { checkHealth } from './api/client';

const initialMockData = {
  sales: {
    pipeline: { total_value: 1820000, total_deals: 47, avg_deal_size: 38723, win_rate_pct: 42, velocity_days: 34 },
    stages: { lead: 18, qualified: 12, proposal: 9, negotiation: 5, closed_won: 3 },
    stalled_deals: [
      { id: "D-201", value: 62000, stage: "negotiation", stalled_days: 17 },
      { id: "D-188", value: 45000, stage: "negotiation", stalled_days: 15 }
    ],
    q3_forecast: { best_case: 520000, likely: 390000, worst_case: 260000 },
    loss_reasons: [ "pricing", "competitor", "timing", "no_budget" ],
    quarterly_revenue: { Q1: 310000, Q2: 352000, Q3_actual_to_date: 198000 }
  },
  finance: {
    cash_position: 4140000,
    monthly_burn: 218000,
    prev_monthly_burn: 190000,
    runway_months: 19,
    revenue: { mrr: 352000, arr: 4224000, growth_pct: 11 },
    expenses: { payroll: 148000, infrastructure: 22000, marketing: 31000, other: 17000 },
    anomalies: [
      { type: "spike", category: "infrastructure", expected: 17200, actual: 22000, delta_pct: 28, flagged: true, likely_cause: "idle compute cluster post data migration" }
    ],
    historical_burn: [ 172000, 178000, 183000, 190000, 218000 ]
  },
  marketing: {
    cac: 1240,
    prev_cac: 1140,
    ltv: 8900,
    ltv_cac_ratio: 7.2,
    campaigns: [
      { name: "Summer outbound", spend: 18000, leads_generated: 142, target_leads: 162, roi_pct: 210 }
    ],
    channel_mix_pct: { organic: 38, paid_search: 29, social: 18, referral: 15 },
    sentiment: { score: 0.64, prev_score: 0.71, trend: "declining", sources: [ "twitter", "g2", "capterra" ] },
    cpc_change_pct: 12
  },
  supplyChain: {
    inventory: { total_skus: 84, at_risk_skus: 3, stockout_probability_pct: 31 },
    vendors: [
      { id: "V-041", name: "SEA Logistics Co", lead_time_days: 28, delay_days: 11, region: "Southeast Asia", cause: "port congestion" }
    ],
    logistics_cost_usd: 42000,
    geopolitical_risk_level: "medium",
    alerts: [
      { type: "delay", vendor_id: "V-041", affected_skus: [ "SKU-441", "SKU-382", "SKU-517" ], q4_revenue_impact_usd: 280000, severity: "critical", reorder_deadline: "end_of_week" }
    ]
  },
  support: {
    tickets: { open: 143, avg_resolution_hrs: 9.4, prev_avg_resolution_hrs: 7.1, backlog_growth_pct: 22 },
    scores: { csat_pct: 71, prev_csat_pct: 77, nps: 28 },
    churn_signals: [
      { account_id: "A-882", arr: 48000, risk_level: "high", sentiment_score: -0.72 },
      { account_id: "A-901", arr: 35000, risk_level: "high", sentiment_score: -0.61 }
    ],
    top_issues: [ "onboarding", "billing", "api_timeouts", "missing_feature" ],
    backlog_root_cause: "QA pipeline bottleneck blocking API timeout fix deployment"
  },
  operations: {
    uptime_pct: 97.2,
    incidents_mtd: 2,
    mttr_hrs: 1.4,
    resources: { eng_utilization_pct: 84, bottlenecks: [ "QA pipeline", "data migration cleanup" ] },
    productivity_index: 0.81,
    process_health: "green",
    infra_alerts: [
      { type: "cost_spike", service: "compute", delta_pct: 28, cause: "idle cluster not terminated post data migration", monthly_waste_usd: 4200 }
    ]
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connecting' | 'online' | 'offline'

  // Poll backend health check
  useEffect(() => {
    const fetchHealth = async () => {
      const health = await checkHealth();
      if (health.status === 'online') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Check health every 15s
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Executive View', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecasts', icon: LineChart },
    { id: 'agents', label: 'Agent Registry', icon: Bot },
    { id: 'risks', label: 'Risk Matrix', icon: ShieldAlert },
    { id: 'anomalies', label: 'Live Anomalies', icon: AlertOctagon },
    { id: 'search', label: 'Global Search', icon: Globe },
    { id: 'synthesizer', label: 'COS Orchestrator', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen text-slate-100 bg-[#0b0f19]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#090d16] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-white m-0 leading-tight">BusinessView AI</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Command Center</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-600/15 border-l-4 border-l-purple-500 text-purple-300 font-bold border-y border-r border-purple-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-400' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Health / Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">System State</span>
            <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              backendStatus === 'online' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : backendStatus === 'offline' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500' : backendStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              {backendStatus}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 text-center font-medium">
            Multi-Agent Chief of Staff Platform
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header Row */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white capitalize m-0">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'dashboard' && 'Unified executive intelligence dashboard and departmental snapshots.'}
              {activeTab === 'forecast' && 'Scenario assumptions and projections for revenue growth.'}
              {activeTab === 'agents' && 'Specialist personas registry and raw data sources.'}
              {activeTab === 'risks' && 'Departmental threat registry and mitigation tactics.'}
              {activeTab === 'anomalies' && 'Live operational variance triggers and cost alerts.'}
              {activeTab === 'search' && 'Search and analyze financial, sales, and marketing standing of global public corporations.'}
              {activeTab === 'synthesizer' && 'LangGraph orchestration pipeline and executive synthesizers.'}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl font-medium">
            Database Sync: <span className="text-purple-400 font-semibold font-mono">100% Mock Safe</span>
          </div>
        </header>

        {/* Tab Renderers */}
        <div className="pt-2">
          {activeTab === 'dashboard' && <Dashboard mockData={initialMockData} />}
          {activeTab === 'forecast' && <RevenueForecast mockData={initialMockData} />}
          {activeTab === 'agents' && <AgentPanel mockData={initialMockData} />}
          {activeTab === 'risks' && <RiskMatrix />}
          {activeTab === 'anomalies' && <AnomalyAlerts />}
          {activeTab === 'search' && <CompanySearch />}
          {activeTab === 'synthesizer' && <Synthesizer />}
        </div>
      </main>

    </div>
  );
}

export default App;
