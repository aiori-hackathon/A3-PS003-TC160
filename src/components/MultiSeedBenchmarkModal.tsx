import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Play, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  BarChart2
} from 'lucide-react';
import { SimulationConfig, SeedRunResult, BaselineComparison } from '../types/federated';
import { FederatedSimulationEngine } from '../services/federatedEngine';
import { DataLeakageAuditBadge } from './DataLeakageAuditBadge';

interface MultiSeedBenchmarkModalProps {
  config: SimulationConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const MultiSeedBenchmarkModal: React.FC<MultiSeedBenchmarkModalProps> = ({
  config,
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SeedRunResult[] | null>(null);
  const [baselines, setBaselines] = useState<BaselineComparison[] | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<'md' | 'latex' | 'json' | null>(null);

  if (!isOpen) return null;

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const seedResults = FederatedSimulationEngine.runMultiSeedExperiment(config, [42, 101, 777]);
      const baselineMatrix = FederatedSimulationEngine.generateBaselineMatrix(config);
      setResults(seedResults);
      setBaselines(baselineMatrix);
      setIsRunning(false);
    }, 150);
  };

  const copyToClipboard = (text: string, format: 'md' | 'latex' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const generateMarkdownReport = () => {
    if (!baselines) return '';
    let md = `# PS-003 Federated Traffic Forecasting Benchmark Report\n`;
    md += `Dataset: ${config.datasetId.toUpperCase()} | Clients: ${config.clientCount} | Architecture: ${config.modelArchitecture.toUpperCase()}\n`;
    md += `Seeds Evaluated: [42, 101, 777] | Evaluation Order: Chronological (70/15/15)\n\n`;
    md += `| Baseline Model | Mean MAE | Std MAE | Mean RMSE | Std RMSE | Total Comm (MB) | Privacy Level |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    baselines.forEach(b => {
      md += `| ${b.baselineName} | ${b.meanMAE.toFixed(2)} | ±${b.stdMAE.toFixed(2)} | ${b.meanRMSE.toFixed(2)} | ±${b.stdRMSE.toFixed(2)} | ${b.meanTotalBytesMB.toFixed(2)} MB | ${b.privacyGuarantee.split('(')[0]} |\n`;
    });
    return md;
  };

  const generateLatexReport = () => {
    if (!baselines) return '';
    let latex = `% PS-003 Benchmark Table (AIOROI)\n\\begin{table}[h]\n\\centering\n\\caption{Federated Learning Traffic Flow Prediction: Accuracy vs Communication Overhead across 3 Random Seeds}\n\\begin{tabular}{lcccc}\n\\hline\n\\textbf{Method} & \\textbf{MAE} & \\textbf{RMSE} & \\textbf{Comm (MB)} & \\textbf{Privacy} \\\\\n\\hline\n`;
    baselines.forEach(b => {
      latex += `${b.baselineName.split('(')[0].trim()} & $${b.meanMAE.toFixed(2)} \\pm ${b.stdMAE.toFixed(2)}$ & $${b.meanRMSE.toFixed(2)} \\pm ${b.stdRMSE.toFixed(2)}$ & ${b.meanTotalBytesMB.toFixed(1)} & ${b.type === 'centralised' ? 'None' : 'High'} \\\\\n`;
    });
    latex += `\\hline\n\\end{tabular}\n\\end{table}`;
    return latex;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>3-Seed Statistical Verification Engine</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
                  Constraints C8 & C9
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Executes reproducible trials across Seeds 42, 101, and 777 to report Mean ± Std Dev baselines
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <DataLeakageAuditBadge config={config} />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Button & Configuration Echo */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs space-y-1">
            <div className="text-slate-800 font-bold">Active Configuration for Verification:</div>
            <div className="text-slate-600 font-mono text-[11px]">
              Dataset: <span className="text-cyan-700 font-bold">{config.datasetId.toUpperCase()}</span> • 
              Clients: <span className="text-emerald-700 font-bold">{config.clientCount}</span> • 
              Architecture: <span className="text-purple-700 font-bold">{config.modelArchitecture.toUpperCase()}</span> • 
              Dirichlet α: <span className="text-amber-700 font-bold">{config.dirichletAlpha}</span>
            </div>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simulating 3 Seeds...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{results ? 'Re-run 3-Seed Benchmark' : 'Execute 3-Seed Benchmark'}</span>
              </>
            )}
          </button>
        </div>

        {/* Results Presentation */}
        {results && baselines && (
          <div className="space-y-5 text-xs">
            
            {/* Table 1: Multi-Seed Breakdown (C8) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seed Runs Breakdown (Constraint C8)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                      <th className="p-3">Random Seed</th>
                      <th className="p-3">Final MAE</th>
                      <th className="p-3">Final RMSE</th>
                      <th className="p-3">Rounds to Target</th>
                      <th className="p-3">Total Comm (MB)</th>
                      <th className="p-3">Stability (Std Dev)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {results.map(r => (
                      <tr key={r.seed} className="hover:bg-slate-50/70">
                        <td className="p-3 font-bold text-indigo-700">Seed #{r.seed}</td>
                        <td className="p-3 text-cyan-800 font-semibold">{r.finalMAE.toFixed(2)}</td>
                        <td className="p-3 text-emerald-800 font-semibold">{r.finalRMSE.toFixed(2)}</td>
                        <td className="p-3 text-slate-700">{r.roundsToTarget} rounds</td>
                        <td className="p-3 text-amber-800 font-semibold">{r.totalBytesMB.toFixed(2)} MB</td>
                        <td className="p-3 text-slate-500">±{r.convergenceStability.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Baseline Comparison Matrix (C9) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Comprehensive Baseline Comparison Matrix (Constraint C9)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                      <th className="p-3">Architecture / Strategy</th>
                      <th className="p-3">MAE (Mean ± Std)</th>
                      <th className="p-3">RMSE (Mean ± Std)</th>
                      <th className="p-3">Network Comm (MB)</th>
                      <th className="p-3">Privacy & Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {baselines.map(b => (
                      <tr key={b.type} className="hover:bg-slate-50/70">
                        <td className="p-3 font-bold text-slate-900">
                          <div>{b.baselineName}</div>
                        </td>
                        <td className="p-3 font-mono text-cyan-800 font-bold">
                          {b.meanMAE.toFixed(2)} <span className="text-slate-400 text-[10px]">±{b.stdMAE.toFixed(2)}</span>
                        </td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">
                          {b.meanRMSE.toFixed(2)} <span className="text-slate-400 text-[10px]">±{b.stdRMSE.toFixed(2)}</span>
                        </td>
                        <td className="p-3 font-mono text-amber-800 font-bold">
                          {b.meanTotalBytesMB.toFixed(1)} MB
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          <div className="text-slate-800 font-semibold">{b.privacyGuarantee}</div>
                          <div className="text-slate-400 text-[10px]">{b.communicationAdvantage}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-500 text-xs font-semibold">Export Verification Artifacts:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateMarkdownReport(), 'md')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'md' ? 'Copied Markdown' : 'Copy Markdown Table'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(generateLatexReport(), 'latex')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {copiedFormat === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'latex' ? 'Copied LaTeX' : 'Copy LaTeX Table'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(JSON.stringify({ config, results, baselines }, null, 2), 'json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'json' ? 'Copied JSON' : 'Export JSON'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
