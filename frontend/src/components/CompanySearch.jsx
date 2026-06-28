import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Percent,
  CheckCircle
} from 'lucide-react';
import { searchCompany } from '../api/client';

export default function CompanySearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testCompanies = ['NVIDIA', 'Google', 'Apple', 'Microsoft', 'Tesla'];

  const handleSearch = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await searchCompany(finalQuery);
      setResult(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch company profile from backend. Ensure server is online on port 8000.');
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 0.8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 0.7) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Search Input Panel */}
      <div className="glass-panel p-6 rounded-2xl">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" />
          Global Corporation intelligence Search
        </h4>
        <p className="text-sm text-slate-400 mb-6">
          Query financial indices, sales segment distributions, and marketing sentiments for any public corporation.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Type company name (e.g., NVIDIA, Google, Apple, Tesla)..."
            className="flex-grow bg-slate-950/60 border border-slate-800 focus:border-purple-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/40 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Search className="w-4.5 h-4.5" />}
            {loading ? 'Searching' : 'Search'}
          </button>
        </form>

        {/* Suggestion tags */}
        {!loading && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-2">Zero-Cost Cache Matches:</span>
            {testCompanies.map((tc) => (
              <button
                key={tc}
                onClick={() => {
                  setQuery(tc);
                  handleSearch(null, tc);
                }}
                className="text-xs text-slate-300 bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 hover:bg-purple-500/5 px-3 py-1 rounded-lg transition-all"
              >
                {tc}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Search Results Display */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Core Status Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Identity Header */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-slate-900/60 to-purple-950/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{result.company_details.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Ticker: <span className="font-mono text-purple-300">{result.company_details.ticker}</span> &bull; Status Verified</p>
                </div>
              </div>
            </div>

            {/* Financial Status Section */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-md font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Financial Standing
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Market Cap</span>
                  <p className="text-lg font-bold text-white mt-1">${(result.financials.market_cap / 1e12).toFixed(2)}T</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Annual Revenue</span>
                  <p className="text-lg font-bold text-white mt-1">${(result.financials.revenue / 1e9).toFixed(1)}B</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Revenue Growth</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">+{result.financials.revenue_growth_pct}%</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Net Income</span>
                  <p className="text-lg font-bold text-white mt-1">${(result.financials.net_income / 1e9).toFixed(1)}B</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gross Margin</span>
                  <p className="text-lg font-bold text-purple-400 mt-1">{result.financials.gross_margin_pct}%</p>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cash Reserves</span>
                  <p className="text-lg font-bold text-white mt-1">${(result.financials.cash_position / 1e9).toFixed(1)}B</p>
                </div>
              </div>
            </div>

            {/* Sales Status Section */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-md font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Sales Pipeline & Segments
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-xl border border-slate-900">
                    <span className="text-xs text-slate-400 font-medium">Pipeline Value</span>
                    <span className="text-sm font-bold text-white">${(result.sales.pipeline_value / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-xl border border-slate-900">
                    <span className="text-xs text-slate-400 font-medium">Active Enterprise Deals</span>
                    <span className="text-sm font-bold text-white">{result.sales.active_deals}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-xl border border-slate-900">
                    <span className="text-xs text-slate-400 font-medium">Sales Win Rate</span>
                    <span className="text-sm font-bold text-blue-400">{result.sales.win_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-xl border border-slate-900">
                    <span className="text-xs text-slate-400 font-medium">Sales Cycle Velocity</span>
                    <span className="text-sm font-bold text-white">{result.sales.velocity_days} Days</span>
                  </div>
                </div>

                {/* Custom Segment Distributions Chart */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3 block">Revenue Distribution Segment %</span>
                  <div className="space-y-3.5">
                    {Object.entries(result.sales.segments).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300 truncate max-w-[160px]">{key}</span>
                          <span className="text-purple-400 font-bold">{val}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Marketing & Threat Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Marketing standing */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-md font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Marketing & Brand
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Sentiment Score</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSentimentColor(result.marketing.brand_sentiment_score)}`}>
                    {result.marketing.brand_sentiment_score} &bull; {result.marketing.sentiment_trend}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Customer CAC</span>
                  <span className="text-xs font-semibold text-slate-200">${result.marketing.cac_usd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">LTV / CAC Ratio</span>
                  <span className="text-xs font-bold text-purple-400">{result.marketing.ltv_cac_ratio}x</span>
                </div>
                <div className="pt-3 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Campaign Theme</span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">"{result.marketing.active_campaign}"</p>
                </div>
              </div>
            </div>

            {/* Recommendations & Risks from Agent */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/20 border-purple-500/10 space-y-4">
              <h4 className="text-md font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                Threats & Next Steps
              </h4>
              
              <div className="space-y-4">
                {/* Risks */}
                <div>
                  <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider">Identified Market Risks</span>
                  <div className="space-y-2 mt-1.5">
                    {result.risks.map((risk, idx) => (
                      <div key={idx} className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[11px] text-slate-300 leading-normal">
                        {risk.description} (Est. Impact: <span className="font-semibold">${(risk.impact_usd / 1e6).toFixed(0)}M</span>)
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">Strategic Recommendations</span>
                  <div className="space-y-2 mt-1.5">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-lg text-[11px] text-slate-300 leading-normal flex gap-1.5 items-start">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
