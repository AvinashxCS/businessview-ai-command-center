import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ChevronRight, 
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RiskMatrix() {
  const [activeRisk, setActiveRisk] = useState(0);

  const risks = [
    {
      id: 'R-01',
      title: 'Vendor shipping delays (SEA Logistics Co)',
      severity: 'critical',
      likelihood: 'high',
      dept: 'Supply Chain',
      impact: 280000,
      description: 'Port congestion in Southeast Asia has delayed vendor V-041 shipments by 11 days, raising stockout probability to 31% on critical SKUs: SKU-441, SKU-382, and SKU-517.',
      mitigation: 'Place reorders with secondary backup logistics vendors before the end-of-week deadline.',
    },
    {
      id: 'R-02',
      title: 'High-value customer churn warning (Accounts A-882, A-901)',
      severity: 'high',
      likelihood: 'medium',
      dept: 'Support',
      impact: 83000,
      description: 'Persistent API timeouts and onboarding issues have driven CSAT down to 71% (from 77%). Churn warning signals flagged on A-882 ($48k ARR) and A-901 ($35k ARR).',
      mitigation: 'Engage account management for active outreach; deploy engineering hotfix to resolve API timeouts.',
    },
    {
      id: 'R-03',
      title: 'QA Pipeline Bottleneck & Degrading Server Uptime',
      severity: 'high',
      likelihood: 'high',
      dept: 'Operations',
      impact: 45000,
      description: 'Systems uptime is degraded to 97.2% due to data migration anomalies. QA pipeline bottleneck is blocking API timeout hotfix deployments, stalling resolution cycles.',
      mitigation: 'Allocate additional engineering resources to clean up data migration leftovers and expand QA automated runner limits.',
    },
    {
      id: 'R-04',
      title: 'High-Value Deals Stalled in Negotiation (D-201, D-188)',
      severity: 'medium',
      likelihood: 'medium',
      dept: 'Sales',
      impact: 107000,
      description: 'Deals D-201 ($62k) and D-188 ($45k) have been stalled in the final negotiation stage for over 15 days, dragging average pipeline velocity to 34 days.',
      mitigation: 'Initiate executive sponsor alignment meetings to resolve pricing or contracting speedbumps.',
    },
    {
      id: 'R-05',
      title: 'Monthly Cash Burn Acceleration Trend',
      severity: 'medium',
      likelihood: 'low',
      dept: 'Finance',
      impact: 28000,
      description: 'Monthly cash burn rose from $190k to $218k (+14.7% MoM) due to uncurbed infrastructure cost spikes and payroll expansions, reducing runway safety margin.',
      mitigation: 'Enforce infrastructure cost ceilings and suspend non-essential SaaS tool renewals.',
    },
    {
      id: 'R-06',
      title: 'Declining Brand Sentiment Indices',
      severity: 'low',
      likelihood: 'medium',
      dept: 'Marketing',
      impact: 15000,
      description: 'Customer brand sentiment dipped from 0.71 to 0.64 across G2, Twitter, and Capterra, primarily driven by onboarding complaints and response times.',
      mitigation: 'Coordinate with Customer Success to launch a structured feedback collection campaign and address G2 reviews.',
    },
  ];

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'low':
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-700/50';
    }
  };

  const current = risks[activeRisk];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Risk Table List */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
        <div>
          <h4 className="text-lg font-bold text-white">Prioritized Threat Register</h4>
          <p className="text-sm text-slate-400">Cross-department risks compiled by Chief of Staff Orchestrator</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="p-3.5">Risk ID</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-right">Est. Impact</th>
                <th className="p-3.5 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {risks.map((risk, index) => (
                <tr 
                  key={risk.id}
                  onClick={() => setActiveRisk(index)}
                  className={`cursor-pointer transition-all hover:bg-slate-900/40 ${
                    activeRisk === index ? 'bg-purple-500/5 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  <td className="p-3.5 font-mono text-slate-400 font-semibold">{risk.id}</td>
                  <td className="p-3.5 font-medium text-white">{risk.title}</td>
                  <td className="p-3.5 text-slate-400">{risk.dept}</td>
                  <td className="p-3.5 text-right font-semibold text-slate-300">${risk.impact.toLocaleString()}</td>
                  <td className="p-3.5 text-center">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getSeverityBadgeClass(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Heatmap / Detail Panel */}
      <div className="space-y-6 lg:col-span-1">
        {/* Visual Matrix Map */}
        <div className="glass-panel p-5 rounded-2xl">
          <h5 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Severity vs. Likelihood Heatmap</h5>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold text-slate-500">
            {/* Row 4 (Critical) */}
            <div className="text-left text-slate-400 flex items-center pr-2 font-mono">Crit</div>
            <div className="aspect-square bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center"></div>
            <div className="aspect-square bg-orange-500/20 border border-orange-500/35 rounded flex items-center justify-center"></div>
            <div className="aspect-square bg-rose-500/30 border border-rose-500/40 rounded flex items-center justify-center text-rose-400 font-bold relative">
              R-01
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>

            {/* Row 3 (High) */}
            <div className="text-left text-slate-400 flex items-center pr-2 font-mono">High</div>
            <div className="aspect-square bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center"></div>
            <div className="aspect-square bg-orange-500/20 border border-orange-500/35 rounded flex items-center justify-center text-orange-400 font-bold">R-02</div>
            <div className="aspect-square bg-orange-500/30 border border-orange-500/40 rounded flex items-center justify-center text-orange-400 font-bold">R-03</div>

            {/* Row 2 (Med) */}
            <div className="text-left text-slate-400 flex items-center pr-2 font-mono">Med</div>
            <div className="aspect-square bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-center"></div>
            <div className="aspect-square bg-amber-500/20 border border-amber-500/30 rounded flex items-center justify-center text-amber-400 font-bold">R-04</div>
            <div className="aspect-square bg-amber-500/20 border border-amber-500/30 rounded flex items-center justify-center text-amber-400 font-bold">R-05</div>

            {/* Row 1 (Low) */}
            <div className="text-left text-slate-400 flex items-center pr-2 font-mono">Low</div>
            <div className="aspect-square bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-center"></div>
            <div className="aspect-square bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-center text-emerald-400 font-bold">R-06</div>
            <div className="aspect-square bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-center"></div>

            {/* X Labels */}
            <div></div>
            <div className="pt-2 font-mono">Low</div>
            <div className="pt-2 font-mono">Med</div>
            <div className="pt-2 font-mono">High</div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-wider">Likelihood &rarr;</div>
        </div>

        {/* Selected Risk Detail Card */}
        <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-purple-950/20 border-purple-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="w-24 h-24 text-purple-400" />
          </div>

          <div className="flex justify-between items-start">
            <span className="font-mono text-purple-400 text-xs font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              {current.id}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getSeverityBadgeClass(current.severity)}`}>
              {current.severity} Severity
            </span>
          </div>

          <h4 className="text-md font-bold text-white mt-3 leading-snug">{current.title}</h4>
          
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Impact</span>
              <p className="text-lg font-bold text-rose-400 mt-0.5">${current.impact.toLocaleString()} USD</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Impact Description</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{current.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-purple-400" />
                Recommended Action
              </span>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed italic bg-purple-500/5 p-2 rounded border border-purple-500/10">
                "{current.mitigation}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
