import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Check, 
  HelpCircle,
  Play
} from 'lucide-react';

export default function AnomalyAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 'A-01',
      title: 'Operations Infrastructure Cost Spike',
      department: 'Finance & Operations',
      type: 'spike',
      category: 'compute',
      expected: 17200,
      actual: 22000,
      delta: 28.0,
      cause: 'Idle compute cluster left running after database migration cleanups.',
      impact: 'Wasting $4,200 USD monthly.',
      status: 'active',
      date: 'Flagged 2 days ago',
      severity: 'high',
    },
    {
      id: 'A-02',
      title: 'Southeast Asia Port delays & SKU Stockout Alert',
      department: 'Supply Chain',
      type: 'delay',
      category: 'logistics',
      delayDays: 11,
      affectedSKUs: ['SKU-441', 'SKU-382', 'SKU-517'],
      cause: 'Port congestion causing ocean carrier delays.',
      impact: 'Estimated $280,000 Q4 revenue risk.',
      status: 'active',
      date: 'Flagged 1 day ago',
      severity: 'critical',
    },
    {
      id: 'A-03',
      title: 'Customer CSAT Drop & Backlog Surge',
      department: 'Support',
      type: 'metrics_degradation',
      category: 'retention',
      expected: 77.0,
      actual: 71.0,
      delta: -7.8,
      cause: 'QA pipeline bottleneck blocking API timeout hotfix deployment.',
      impact: 'Support tickets backlog increased by 22% this week.',
      status: 'mitigating',
      date: 'Flagged 3 days ago',
      severity: 'high',
    },
    {
      id: 'A-04',
      title: 'Customer Acquisition Cost (CAC) Inflation',
      department: 'Marketing',
      type: 'increase',
      category: 'ad_spend',
      expected: 1140,
      actual: 1240,
      delta: 8.77,
      cause: 'Competitor bids rising organic cost per click (CPC up 12%).',
      impact: 'Reduces net customer lifetime value (LTV) margin efficiency.',
      status: 'monitoring',
      date: 'Flagged 4 days ago',
      severity: 'medium',
    },
  ]);

  const handleResolve = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
      case 'high':
        return 'border-orange-500/30 bg-orange-500/5 text-orange-400';
      case 'medium':
      default:
        return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-lg font-bold text-white">Live Anomaly Feed</h4>
          <p className="text-sm text-slate-400">Unexpected data signals flagged in the last 30 days</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl">
          {alerts.filter(a => a.status !== 'resolved').length} Active Alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => {
          const isResolved = alert.status === 'resolved';

          return (
            <div 
              key={alert.id} 
              className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border relative overflow-hidden transition-all duration-300 ${
                isResolved 
                  ? 'border-slate-800/40 opacity-50 bg-slate-950/10' 
                  : getSeverityColor(alert.severity)
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider bg-slate-950/40 border border-slate-800">
                    {alert.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.date}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isResolved 
                        ? 'bg-slate-500' 
                        : alert.status === 'mitigating' 
                        ? 'bg-amber-500 animate-pulse' 
                        : 'bg-rose-500 animate-ping'
                    }`} />
                  </div>
                </div>

                <h4 className={`text-md font-bold mt-3 leading-snug ${isResolved ? 'text-slate-500 line-through' : 'text-white'}`}>
                  {alert.title}
                </h4>

                <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Flagged Category</span>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5 capitalize">{alert.category}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Variance Signal</span>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                      {alert.delta && (
                        <span className={alert.delta > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {alert.delta > 0 ? '+' : ''}{alert.delta}%
                        </span>
                      )}
                      {alert.delayDays && <span className="text-rose-400">{alert.delayDays} days delay</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Likely Cause:</span> {alert.cause}
                  </p>
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Immediate Impact:</span> {alert.impact}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status: {alert.status}
                </span>
                {!isResolved ? (
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="text-xs font-semibold bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-slate-500" />
                    Mitigated
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
