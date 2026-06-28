import React, { useState } from 'react';
import { 
  Terminal, 
  Layers, 
  Cpu, 
  Play, 
  FileJson,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AgentPanel({ mockData }) {
  const [selectedAgent, setSelectedAgent] = useState('sales');

  const agents = {
    sales: {
      name: 'Sales Intelligence Agent',
      status: 'online',
      file: 'sales_data.json',
      responsibilities: 'Tracks and forecasts pipeline metrics, deal closure velocity, stage distribution, and stalled negotiations.',
      prompt: `Analyze sales pipeline metrics (total value, average deal size, win rate, velocity).
Track distribution across stages and identify bottlenecks.
Evaluate stalled deals and potential risks.
Forecast performance for the current quarter and compare with historical patterns.`,
      schema: mockData.sales,
    },
    finance: {
      name: 'Finance intelligence Agent',
      status: 'warning',
      file: 'finance_data.json',
      responsibilities: 'Analyzes monthly burn rates, cash runways, expense spikes, growth margins, and historical cash flows.',
      prompt: `Analyze monthly burn rate and flag acceleration trends.
Calculate runway given current cash position and burn trajectory.
Identify expense anomalies (spikes >15% above 3-month average).
Cross-reference revenue growth against expense growth.`,
      schema: mockData.finance,
    },
    marketing: {
      name: 'Marketing Analytics Agent',
      status: 'online',
      file: 'marketing_data.json',
      responsibilities: 'Measures lead acquisition cost (CAC), LTV ratios, active campaign ROIs, organic vs paid split, and social sentiment indexing.',
      prompt: `Analyze customer acquisition cost (CAC) trends and compare against historical rates.
Compute lifetime value (LTV) to CAC ratio and assess efficiency.
Monitor active campaigns (spend, leads generated, target leads, ROI).
Assess channel mix and brand sentiment changes.`,
      schema: mockData.marketing,
    },
    supply_chain: {
      name: 'Supply Chain Operations Agent',
      status: 'alert',
      file: 'supply_chain_data.json',
      responsibilities: 'Tracks inventory levels, vendor lead times, regional delay alerts, shipping delays, and Q4 margin impacts.',
      prompt: `Monitor inventory health (SKUs at risk, stockout probability).
Track vendor performance, delays, and regions of impact.
Identify geopolitical risks and logistics cost variances.
Analyze specific alerts and flag critical revenue impacts.`,
      schema: mockData.supplyChain,
    },
    support: {
      name: 'Customer Support intelligence Agent',
      status: 'warning',
      file: 'support_data.json',
      responsibilities: 'Monitors ticket backlog volumes, customer retention metrics (CSAT/NPS), account-specific churn signals, and pipeline blockers.',
      prompt: `Monitor open ticket volume and backlog growth trends.
Evaluate customer satisfaction metrics (CSAT, NPS).
Analyze customer churn signals (high-risk accounts and ARR values).
Identify top issues and backlog root causes.`,
      schema: mockData.support,
    },
    operations: {
      name: 'Systems & Engineering Operations Agent',
      status: 'degraded',
      file: 'operations_data.json',
      responsibilities: 'Measures cloud service uptimes, developer and resource utilizations, deployment pipelines, and active infrastructure cost alerts.',
      prompt: `Monitor system performance (uptime percentage, incidents, MTTR).
Evaluate resource utilization (engineering utilization, process bottlenecks).
Identify infrastructure cost spikes or anomalies.
Analyze productivity indexes and process health.`,
      schema: mockData.operations,
    },
  };

  const current = agents[selectedAgent];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar List */}
      <div className="space-y-3 lg:col-span-1">
        <h4 className="text-sm font-semibold text-slate-400 px-2 uppercase tracking-wider mb-2">Agent Registry</h4>
        {Object.entries(agents).map(([key, agent]) => {
          const isSelected = selectedAgent === key;
          let statusColor = 'bg-emerald-500';
          if (agent.status === 'warning') statusColor = 'bg-amber-500';
          if (agent.status === 'alert' || agent.status === 'degraded') statusColor = 'bg-rose-500';

          return (
            <button
              key={key}
              onClick={() => setSelectedAgent(key)}
              className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border transition-all ${
                isSelected 
                  ? 'bg-purple-500/10 border-purple-500/30 text-white font-medium' 
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-400 hover:text-slate-300 hover:bg-slate-900/50 hover:border-slate-700/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColor} ${agent.status !== 'online' ? 'animate-pulse' : ''}`} />
                <span className="text-xs uppercase tracking-wider font-semibold">{key.replace('_', ' ')}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                agent.status === 'online' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : agent.status === 'warning' 
                  ? 'bg-amber-500/10 text-amber-400' 
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                {agent.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Details Container */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-3 space-y-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{current.name}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Specialist Scope &bull; Read source: <span className="font-mono text-slate-300 bg-slate-900/50 px-1 py-0.5 rounded">{current.file}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                LangGraph Node
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsibilities</h5>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{current.responsibilities}</p>
          </div>

          {/* System Prompt */}
          <div className="mt-5">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Internal Prompt Parameters</h5>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <p className="text-xs text-slate-400 font-mono whitespace-pre-line leading-relaxed">{current.prompt}</p>
            </div>
          </div>
        </div>

        {/* JSON Schema viewer */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileJson className="w-4 h-4 text-purple-400" />
              Source Mock Schema Data
            </h5>
            <span className="text-[10px] text-slate-500 font-mono">JSON structure</span>
          </div>
          <pre className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 overflow-x-auto font-mono max-h-60 leading-normal">
            {JSON.stringify(current.schema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
