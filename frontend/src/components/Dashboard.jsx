import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Users, 
  Activity, 
  Truck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Dashboard({ mockData }) {
  const { sales, finance, marketing, supplyChain, support, operations } = mockData;

  const cards = [
    {
      title: 'Annual Recurring Revenue (ARR)',
      value: `$${(finance.revenue.arr / 1000000).toFixed(2)}M`,
      change: `+${finance.revenue.growth_pct}%`,
      changeType: 'up',
      detail: `MRR: $${(finance.revenue.mrr / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
    {
      title: 'Sales Pipeline Value',
      value: `$${(sales.pipeline.total_value / 1000000).toFixed(2)}M`,
      change: `${sales.pipeline.total_deals} Deals`,
      changeType: 'neutral',
      detail: `Avg Size: $${(sales.pipeline.avg_deal_size / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    },
    {
      title: 'LTV : CAC Ratio',
      value: marketing.ltv_cac_ratio.toFixed(1),
      change: '7.2x efficiency',
      changeType: 'up',
      detail: `CAC: $${marketing.cac}`,
      icon: Users,
      color: 'from-violet-500/20 to-purple-500/20 text-purple-400',
    },
    {
      title: 'Operations Uptime',
      value: `${operations.uptime_pct}%`,
      change: `${operations.incidents_mtd} Incidents`,
      changeType: 'down',
      detail: `MTTR: ${operations.mttr_hrs} hrs`,
      icon: Activity,
      color: 'from-red-500/20 to-rose-500/20 text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
                <h3 className="text-3xl font-bold mt-2 tracking-tight text-white">{card.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60">
              <span className="text-xs text-slate-400">{card.detail}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                card.changeType === 'up' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : card.changeType === 'down' 
                  ? 'bg-rose-500/10 text-rose-400' 
                  : 'bg-slate-500/10 text-slate-400'
              }`}>
                {card.changeType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {card.changeType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Department Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Burn Rate */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">Historical Burn Rate & Runway</h4>
                <p className="text-sm text-slate-400">Monthly burn trends and cash runway safety margins</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                  {finance.runway_months} Months Runway
                </span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-60 w-full relative mt-6">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="#1e293b" strokeDasharray="4 4" />

                {/* Y Axis Labels */}
                <text x="10" y="25" fill="#64748b" className="text-[10px] font-medium">$250k</text>
                <text x="10" y="75" fill="#64748b" className="text-[10px] font-medium">$200k</text>
                <text x="10" y="125" fill="#64748b" className="text-[10px] font-medium">$150k</text>
                <text x="10" y="175" fill="#64748b" className="text-[10px] font-medium">$100k</text>

                {/* Area Gradient */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Draw Area Path */}
                {/* coordinates: M1=172k(118), M2=178k(112), M3=183k(107), M4=190k(100), M5=218k(72) */}
                <path 
                  d="M 50 170 L 50 118 L 170 112 L 290 107 L 410 100 L 530 72 L 530 170 Z" 
                  fill="url(#chartGrad)" 
                />

                {/* Draw Line Path */}
                <path 
                  d="M 50 118 L 170 112 L 290 107 L 410 100 L 530 72" 
                  fill="none" 
                  stroke="#c084fc" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />

                {/* Draw Dots */}
                <circle cx="50" cy="118" r="5" fill="#c084fc" stroke="#0f172a" strokeWidth="2" />
                <circle cx="170" cy="112" r="5" fill="#c084fc" stroke="#0f172a" strokeWidth="2" />
                <circle cx="290" cy="107" r="5" fill="#c084fc" stroke="#0f172a" strokeWidth="2" />
                <circle cx="410" cy="100" r="5" fill="#c084fc" stroke="#0f172a" strokeWidth="2" />
                <circle cx="530" cy="72" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />

                {/* Labels under points */}
                <text x="50" y="195" fill="#94a3b8" className="text-[10px] font-medium text-center" textAnchor="middle">Month 1</text>
                <text x="170" y="195" fill="#94a3b8" className="text-[10px] font-medium text-center" textAnchor="middle">Month 2</text>
                <text x="290" y="195" fill="#94a3b8" className="text-[10px] font-medium text-center" textAnchor="middle">Month 3</text>
                <text x="410" y="195" fill="#94a3b8" className="text-[10px] font-medium text-center" textAnchor="middle">Prev Month</text>
                <text x="530" y="195" fill="#f3f4f6" className="text-[10px] font-semibold text-center" textAnchor="middle">Current</text>

                {/* Value tooltips inside chart */}
                <text x="50" y="98" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">$172k</text>
                <text x="170" y="92" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">$178k</text>
                <text x="290" y="87" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">$183k</text>
                <text x="410" y="80" fill="#cbd5e1" className="text-[9px]" textAnchor="middle">$190k</text>
                <text x="530" y="52" fill="#f3f4f6" className="text-[10px] font-bold" textAnchor="middle">$218k</text>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">
              <span className="font-semibold text-white">Warning:</span> Monthly burn accelerated by 14.7% MoM. Critical expense spike flagged in Operations infrastructure category (+28.0%).
            </p>
          </div>
        </div>

        {/* Department Snapshots Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Departmental Status</h4>
            <div className="space-y-4">
              {/* Sales */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Sales</h5>
                    <p className="text-[10px] text-slate-400">Win Rate: {sales.pipeline.win_rate_pct}%</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
              </div>

              {/* Finance */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Finance</h5>
                    <p className="text-[10px] text-slate-400">Burn: $218k/mo</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Warning</span>
              </div>

              {/* Marketing */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Marketing</h5>
                    <p className="text-[10px] text-slate-400">LTV/CAC: {marketing.ltv_cac_ratio}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
              </div>

              {/* Supply Chain */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Supply Chain</h5>
                    <p className="text-[10px] text-slate-400">Stockout Risk: {supplyChain.inventory.stockout_probability_pct}%</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Critical Alert</span>
              </div>

              {/* Support */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Customer Support</h5>
                    <p className="text-[10px] text-slate-400">CSAT: {support.scores.csat_pct}%</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Warning</span>
              </div>

              {/* Operations */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Operations</h5>
                    <p className="text-[10px] text-slate-400">Bottleneck: QA Pipeline</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Degraded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
