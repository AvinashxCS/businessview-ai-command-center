import React from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function RevenueForecast({ mockData }) {
  const { pipeline } = mockData.sales;

  const scenarios = [
    {
      name: 'Best Case Scenario',
      revenue: 520000,
      confidence: 'High',
      likelihood: 'Low (30%)',
      assumptions: 'All stalled deals (D-201, D-188) close; SEA Logistics bottleneck resolved before end of week; API timeout hotfix deployed immediately to salvage accounts A-882 and A-901.',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      name: 'Likely Case Scenario',
      revenue: 390000,
      confidence: 'Medium',
      likelihood: 'High (60%)',
      assumptions: 'Partial closure of stalled deals; logistics delays mitigated with some air freight costs; API timeout resolved but with minor CSAT impact and slow deal pipeline velocity (34 days).',
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    },
    {
      name: 'Worst Case Scenario',
      revenue: 260000,
      confidence: 'Low',
      likelihood: 'Low (10%)',
      assumptions: 'Stalled deals lost to competitors; stockouts occur on SKUs 441, 382, and 517 causing Q4 logistics penalties; account churn of $83,000 ARR manifests.',
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forecast Chart Panel */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-bold text-white">Q3 Financial Projections</h4>
              <p className="text-sm text-slate-400">Comparing past performance with worst, likely, and best-case Q3 forecasts</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Confidence: Medium
            </span>
          </div>

          {/* SVG Bar Chart for Scenarios */}
          <div className="h-64 w-full relative mt-6">
            <svg className="w-full h-full" viewBox="0 0 600 230" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="75" x2="580" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="185" x2="580" y2="185" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Y Labels */}
              <text x="10" y="25" fill="#64748b" className="text-[10px] font-medium">$600k</text>
              <text x="10" y="80" fill="#64748b" className="text-[10px] font-medium">$400k</text>
              <text x="10" y="135" fill="#64748b" className="text-[10px] font-medium">$200k</text>
              <text x="10" y="190" fill="#64748b" className="text-[10px] font-medium">$0</text>

              {/* Chart Bars */}
              {/* Scale: height = 185 - (value * 165 / 600000) */}
              
              {/* Q1: 310k (height: 99) */}
              <rect x="75" y="99" width="36" height="86" rx="4" fill="#334155" />
              <text x="93" y="90" fill="#94a3b8" className="text-[9px]" textAnchor="middle">$310k</text>

              {/* Q2: 352k (height: 88) */}
              <rect x="165" y="88" width="36" height="97" rx="4" fill="#475569" />
              <text x="183" y="79" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">$352k</text>

              {/* Spacer / Divider */}
              <line x1="245" y1="20" x2="245" y2="185" stroke="#334155" strokeDasharray="2 2" />

              {/* Q3 Worst: 260k (height: 113) */}
              <rect x="290" y="113" width="36" height="72" rx="4" fill="#ef4444" fillOpacity="0.4" stroke="#f87171" strokeWidth="1" />
              <text x="308" y="104" fill="#f87171" className="text-[9px] font-semibold" textAnchor="middle">$260k</text>

              {/* Q3 Likely: 390k (height: 77) */}
              <rect x="380" y="77" width="36" height="108" rx="4" fill="#a855f7" fillOpacity="0.6" stroke="#c084fc" strokeWidth="1.5" />
              <text x="398" y="68" fill="#c084fc" className="text-[10px] font-bold" textAnchor="middle">$390k</text>

              {/* Q3 Best: 520k (height: 42) */}
              <rect x="470" y="42" width="36" height="143" rx="4" fill="#10b981" fillOpacity="0.4" stroke="#34d399" strokeWidth="1" />
              <text x="488" y="33" fill="#34d399" className="text-[9px] font-semibold" textAnchor="middle">$520k</text>

              {/* X Axis Labels */}
              <text x="93" y="205" fill="#94a3b8" className="text-[10px] font-semibold" textAnchor="middle">Q1 Actual</text>
              <text x="183" y="205" fill="#94a3b8" className="text-[10px] font-semibold" textAnchor="middle">Q2 Actual</text>
              <text x="308" y="205" fill="#ef4444" className="text-[10px] font-semibold" textAnchor="middle">Worst (Q3)</text>
              <text x="398" y="205" fill="#c084fc" className="text-[11px] font-bold" textAnchor="middle">Likely (Q3)</text>
              <text x="488" y="205" fill="#34d399" className="text-[10px] font-semibold" textAnchor="middle">Best (Q3)</text>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 mt-4 text-xs text-slate-300">
          <FileSpreadsheet className="w-5 h-5 text-purple-400 shrink-0" />
          <p>
            Forecast logic uses pipeline win rate ({pipeline.win_rate_pct}%) and deal velocity ({pipeline.velocity_days} days) overlaid with supplier delays and customer retention ratios.
          </p>
        </div>
      </div>

      {/* Scenario Descriptions */}
      <div className="lg:col-span-1 space-y-4">
        <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">Forecast Assumptions</h5>
        {scenarios.map((sc, idx) => (
          <div key={idx} className={`glass-panel p-4.5 rounded-2xl border ${sc.color} transition-all duration-300 hover:scale-[1.01]`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white text-sm">{sc.name}</span>
              <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest px-2 py-0.5 bg-slate-950/40 rounded border border-slate-800">
                {sc.likelihood}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-3 tracking-tight">${sc.revenue.toLocaleString()}</h4>
            <p className="text-xs opacity-90 leading-relaxed text-slate-300">
              {sc.assumptions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
