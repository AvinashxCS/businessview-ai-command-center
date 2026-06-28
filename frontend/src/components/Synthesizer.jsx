import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Cpu, 
  Layers, 
  CheckCircle, 
  Network,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { runQuery } from '../api/client';

export default function Synthesizer() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0: idle, 1: routing, 2: parallel_agents, 3: synthesizing, 4: done
  const [consultedAgents, setConsultedAgents] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  // Suggestions for executive queries
  const suggestions = [
    "Assess current logistics delay risks and high-churn client exposure.",
    "Detail monthly runway safety limits and compute infrastructure anomalies.",
    "Outline Q3 sales pipeline velocity bottlenecks and stalled negotiations.",
    "Synthesize complete cross-department operations and financial burn briefs."
  ];

  // Pipeline simulation timings
  useEffect(() => {
    let timer1, timer2, timer3;
    if (loading) {
      setPipelineStep(1);
      // Move to agent execution after 1.5s
      timer1 = setTimeout(() => {
        setPipelineStep(2);
      }, 1500);
      
      // Move to synthesizing after 4s
      timer2 = setTimeout(() => {
        setPipelineStep(3);
      }, 4000);
    } else {
      setPipelineStep(0);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [loading]);

  const handleSubmit = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setReport(null);
    setError(null);
    setConsultedAgents([]);

    try {
      const response = await runQuery(finalQuery);
      // Wait a little bit to let the animation feel smooth
      setTimeout(() => {
        setConsultedAgents(response.agents_consulted || []);
        setReport(response.report);
        setPipelineStep(4);
        setLoading(false);
      }, 4500);
    } catch (err) {
      console.error(err);
      setError('Failed to communicate with Command Center backend. Please ensure the server is running on port 8000.');
      setLoading(false);
      setPipelineStep(0);
    }
  };

  // Helper function to parse executive report sections into HTML cards
  const parseReport = (text) => {
    if (!text) return null;
    
    const sections = {
      summary: '',
      risks: [],
      forecast: '',
      anomalies: [],
      actions: []
    };

    // Simple markdown division parser
    const parts = text.split('\n');
    let currentSection = '';

    parts.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      if (cleanLine.toUpperCase().startsWith('EXECUTIVE SUMMARY')) {
        currentSection = 'summary';
      } else if (cleanLine.toUpperCase().startsWith('RISK MATRIX')) {
        currentSection = 'risks';
      } else if (cleanLine.toUpperCase().startsWith('REVENUE FORECAST')) {
        currentSection = 'forecast';
      } else if (cleanLine.toUpperCase().startsWith('ANOMALY ALERTS')) {
        currentSection = 'anomalies';
      } else if (cleanLine.toUpperCase().startsWith('RECOMMENDED ACTIONS')) {
        currentSection = 'actions';
      } else {
        if (currentSection === 'summary') {
          sections.summary += cleanLine + ' ';
        } else if (currentSection === 'forecast') {
          sections.forecast += cleanLine + ' ';
        } else if (currentSection === 'risks') {
          sections.risks.push(cleanLine.replace(/^[-*•\d.]\s*/, ''));
        } else if (currentSection === 'anomalies') {
          sections.anomalies.push(cleanLine.replace(/^[-*•\d.]\s*/, ''));
        } else if (currentSection === 'actions') {
          sections.actions.push(cleanLine.replace(/^[-*•\d.]\s*/, ''));
        }
      }
    });

    return sections;
  };

  const reportSections = parseReport(report);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel p-6 rounded-2xl">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Chief of Staff AI Orchestrator
        </h4>
        <p className="text-sm text-slate-400 mb-6">
          Query the command center to run parallel routing pipelines across department specialist agents.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="e.g., Assess logistics bottlenecks and monthly runway burn trends..."
            className="flex-grow bg-slate-950/60 border border-slate-800 focus:border-purple-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/40 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
            {loading ? 'Synthesizing' : 'Query'}
          </button>
        </form>

        {/* Suggestion list */}
        {!loading && !report && (
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Suggested Queries</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(s);
                    handleSubmit(null, s);
                  }}
                  className="text-left text-xs text-slate-300 bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/20 hover:bg-purple-500/5 p-2.5 rounded-xl transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animation Pipeline */}
      {loading && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-8 py-10 transition-all duration-500">
          <div className="text-center">
            <h5 className="text-md font-bold text-white tracking-wide">
              {pipelineStep === 1 && '1. Initializing Chief of Staff Router Node...'}
              {pipelineStep === 2 && '2. Consulting Relevant Department Specialist Agents in Parallel...'}
              {pipelineStep === 3 && '3. Merging Payloads & Synthesizing Final Executive Brief...'}
            </h5>
            <p className="text-xs text-slate-400 mt-1">Multi-agent LangGraph execution pipeline in progress</p>
          </div>

          {/* Visual Routing Map */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl gap-4 md:gap-2 relative pt-2">
            {/* Router Node */}
            <div className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center w-28 text-center relative z-10 ${
              pipelineStep === 1 
                ? 'bg-purple-600/10 border-purple-500/80 animate-pulse-ring' 
                : pipelineStep > 1 
                ? 'bg-slate-900 border-purple-500/40 text-purple-300' 
                : 'bg-slate-950/20 border-slate-800 text-slate-500'
            }`}>
              <Network className="w-6 h-6 mb-1 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Router</span>
            </div>

            {/* Connecting line spacer (hidden on mobile) */}
            <div className="hidden md:block flex-grow h-0.5 border-t-2 border-dashed border-slate-800 relative">
              {pipelineStep >= 2 && (
                <div className="absolute top-[-2px] left-0 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Department Nodes (Grid on Mobile, Row on Desktop) */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full md:w-auto relative z-10">
              {['sales', 'finance', 'marketing', 'supply_chain', 'support', 'operations'].map((node) => {
                const isActive = pipelineStep === 2;
                return (
                  <div 
                    key={node} 
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-500 ${
                      isActive 
                        ? 'bg-purple-500/10 border-purple-400/80 shadow-lg shadow-purple-500/5 animate-pulse' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mb-1.5 bg-purple-400"></div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold">{node.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>

            {/* Connecting line spacer (hidden on mobile) */}
            <div className="hidden md:block flex-grow h-0.5 border-t-2 border-dashed border-slate-800 relative">
              {pipelineStep >= 3 && (
                <div className="absolute top-[-2px] right-0 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Orchestrator Synthesizer Node */}
            <div className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center w-28 text-center relative z-10 ${
              pipelineStep === 3 
                ? 'bg-purple-600/10 border-purple-500/80 animate-pulse-ring' 
                : 'bg-slate-950/20 border-slate-800 text-slate-500'
            }`}>
              <Sparkles className="w-6 h-6 mb-1 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Synthesizer</span>
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm leading-relaxed">
          {error}
        </div>
      )}

      {/* Render Synthesized Report */}
      {report && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Executive Report Compiled Successfully</span>
            </div>
            <div className="flex gap-2">
              {consultedAgents.map(a => (
                <span key={a} className="text-[9px] uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {reportSections ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Executive Summary & Revenue Forecast */}
              <div className="lg:col-span-2 space-y-6">
                {/* Executive Summary */}
                <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-900/10">
                  <h4 className="text-md font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase tracking-wider text-purple-400">
                    Executive Summary
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-light">
                    {reportSections.summary || 'Summary not parsed properly.'}
                  </p>
                </div>

                {/* Revenue Forecast */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase tracking-wider text-purple-400">
                    Revenue Forecast
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    {reportSections.forecast || 'Forecast assumptions not parsed properly.'}
                  </p>
                </div>

                {/* Action Items List */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase tracking-wider text-purple-400">
                    Recommended Actions
                  </h4>
                  <div className="space-y-3">
                    {reportSections.actions.map((act, index) => (
                      <div key={index} className="flex gap-3 items-start p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                        <span className="font-mono text-[10px] bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 rounded shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-normal">{act}</p>
                      </div>
                    ))}
                    {reportSections.actions.length === 0 && (
                      <p className="text-xs text-slate-500">No specific action items listed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Matrix/Anomalies */}
              <div className="lg:col-span-1 space-y-6">
                {/* Risk Matrix Section */}
                <div className="glass-panel p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/20 border-purple-500/10">
                  <h4 className="text-md font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase tracking-wider text-purple-400">
                    Risk Matrix
                  </h4>
                  <div className="space-y-3.5">
                    {reportSections.risks.map((risk, index) => (
                      <div key={index} className="text-xs border-b border-slate-900 pb-3 last:border-b-0 last:pb-0">
                        <p className="font-medium text-slate-200 leading-snug">{risk}</p>
                      </div>
                    ))}
                    {reportSections.risks.length === 0 && (
                      <p className="text-xs text-slate-500">No key risks flagged.</p>
                    )}
                  </div>
                </div>

                {/* Anomalies List */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase tracking-wider text-purple-400">
                    Anomaly Alerts
                  </h4>
                  <div className="space-y-3">
                    {reportSections.anomalies.map((anom, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs border-b border-slate-900 pb-2.5 last:border-b-0 last:pb-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></div>
                        <p className="text-slate-300 leading-normal">{anom}</p>
                      </div>
                    ))}
                    {reportSections.anomalies.length === 0 && (
                      <p className="text-xs text-slate-500">No anomalous signals reported.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback raw text viewer
            <div className="glass-panel p-6 rounded-2xl text-left">
              <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                {report}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
