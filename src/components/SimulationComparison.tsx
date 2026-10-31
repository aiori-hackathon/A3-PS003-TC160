import React, { useState } from 'react';
import { 
  GitCompare, 
  Bookmark, 
  ArrowRightLeft, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Wifi, 
  Cpu, 
  Gauge, 
  Copy, 
  Check, 
  Download, 
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { SimulationConfig, RoundMetrics } from '../types/federated';
import { MODEL_SPECS, METR_LA_KEY_SENSORS, generateChronologicalTrafficSeries } from '../services/trafficDataService';
import { SupportedLanguage, getTranslation } from '../services/i18n';
import { BandwidthEfficiencyEstimator } from './BandwidthEfficiencyEstimator';

export interface PinnedRunState {
  id: string;
  name: string;
  timestamp: string;
  config: SimulationConfig;
  latestMetrics: RoundMetrics;
  history: RoundMetrics[];
  actualTestMAE: number;
  actualTestRMSE: number;
}

interface SimulationComparisonProps {
  currentConfig: SimulationConfig;
  currentMetrics: RoundMetrics | null;
  currentHistory: RoundMetrics[];
  pinnedRun: PinnedRunState | null;
  onPinCurrentRun: () => void;
  onClearPinned: () => void;
  onUpdateConfig?: (updates: Partial<SimulationConfig>) => void;
  currentLanguage?: SupportedLanguage;
}

export const SimulationComparison: React.FC<SimulationComparisonProps> = ({
  currentConfig,
  currentMetrics,
  currentHistory,
  pinnedRun,
  onPinCurrentRun,
  onClearPinned,
  onUpdateConfig,
  currentLanguage = 'en'
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const t = (key: string) => getTranslation(currentLanguage, key);

  // If no pinned run exists, create an initial baseline reference from IID standard FedAvg
  const effectivePinned: PinnedRunState = pinnedRun || {
    id: 'baseline-default',
    name: 'Run A: Default FedAvg (IID Baseline)',
    timestamp: 'Initial Baseline',
    config: {
      ...currentConfig,
      distribution: 'iid',
      quantization: 'fp32',
      modelArchitecture: 'gru',
      dirichletAlpha: 1.0,
      clientCount: 4
    },
    latestMetrics: {
      round: 50,
      globalMAE: 3.38,
      globalRMSE: 4.28,
      globalLoss: 0.051,
      centralisedMAE: 3.18,
      localOnlyMAE: 8.85,
      roundUplinkBytes: 1024000,
      roundDownlinkBytes: 1024000,
      roundTotalBytes: 2048000,
      cumulativeBytes: 102400000,
      avgClientDrift: 0.065,
      clientDrifts: {},
      timestamp: Date.now()
    },
    history: [],
    actualTestMAE: 3.38,
    actualTestRMSE: 4.28
  };

  const currentMAE = currentMetrics ? currentMetrics.globalMAE : 3.42;
  const currentRMSE = currentMetrics ? currentMetrics.globalRMSE : 4.38;
  const currentMB = currentMetrics ? Math.round((currentMetrics.cumulativeBytes / (1024 * 1024)) * 10) / 10 : 51.2;
  const currentDrift = currentMetrics ? currentMetrics.avgClientDrift : 0.38;

  const pinnedMAE = effectivePinned.latestMetrics.globalMAE;
  const pinnedRMSE = effectivePinned.latestMetrics.globalRMSE;
  const pinnedMB = Math.round((effectivePinned.latestMetrics.cumulativeBytes / (1024 * 1024)) * 10) / 10;
  const pinnedDrift = effectivePinned.latestMetrics.avgClientDrift;

  // Compute Diffs
  const maeDiff = Math.round((currentMAE - pinnedMAE) * 100) / 100;
  const maePercent = Math.round(((currentMAE - pinnedMAE) / pinnedMAE) * 1000) / 10;

  const rmseDiff = Math.round((currentRMSE - pinnedRMSE) * 100) / 100;
  const rmsePercent = Math.round(((currentRMSE - pinnedRMSE) / pinnedRMSE) * 1000) / 10;

  const mbDiff = Math.round((currentMB - pinnedMB) * 10) / 10;
  const mbPercent = Math.round(((currentMB - pinnedMB) / (pinnedMB || 1)) * 100);

  const driftDiff = Math.round((currentDrift - pinnedDrift) * 1000) / 1000;

  // Generate traffic series for visual prediction curve comparison
  const { timestamps, sensorProfiles } = generateChronologicalTrafficSeries('metr-la', currentConfig.randomSeed);
  const testStartIndex = 1714;
  const sensorIndex = Math.min(sensorProfiles.length - 1, selectedSensorId - 1);
  const groundTruth = (sensorProfiles[sensorIndex] || sensorProfiles[0]).slice(testStartIndex);

  // Run A (Pinned) and Run B (Current) predictions
  const predPinned = groundTruth.map((gt, i) => {
    const residual = Math.sin(i * 0.22) * (pinnedMAE * 0.72);
    return Math.round(Math.max(12, Math.min(82, gt + residual)) * 10) / 10;
  });

  const predCurrent = groundTruth.map((gt, i) => {
    const residual = Math.sin(i * 0.22) * (currentMAE * 0.72);
    return Math.round(Math.max(12, Math.min(82, gt + residual)) * 10) / 10;
  });

  // Chart rendering
  const chartW = 660;
  const chartH = 210;
  const padL = 40;
  const padR = 15;
  const padT = 15;
  const padB = 25;
  const effW = chartW - padL - padR;
  const effH = chartH - padT - padB;

  const minV = Math.max(10, Math.min(...groundTruth, ...predPinned, ...predCurrent) * 0.9);
  const maxV = Math.max(78, Math.max(...groundTruth, ...predPinned, ...predCurrent) * 1.05);
  const rng = maxV - minV || 1;

  const getX = (i: number) => padL + (i / (groundTruth.length - 1)) * effW;
  const getY = (v: number) => padT + effH - ((v - minV) / rng) * effH;

  const gtPath = groundTruth.reduce((acc, v, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`, '');
  const pinnedPath = predPinned.reduce((acc, v, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`, '');
  const currentPath = predCurrent.reduce((acc, v, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`, '');

  const copyComparisonMarkdown = () => {
    let md = `# AIORI Simulation Comparison: Run A (Pinned) vs Run B (Current)\n`;
    md += `Dataset: METR-LA (Los Angeles Highway Network)\n\n`;
    md += `| Parameter / Metric | Run A (Pinned Baseline) | Run B (Current Experiment) | Delta Diff |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| Architecture | ${MODEL_SPECS[effectivePinned.config.modelArchitecture].name} | ${MODEL_SPECS[currentConfig.modelArchitecture].name} | - |\n`;
    md += `| Edge Clients | ${effectivePinned.config.clientCount} RSUs | ${currentConfig.clientCount} RSUs | ${currentConfig.clientCount - effectivePinned.config.clientCount} |\n`;
    md += `| Distribution | ${effectivePinned.config.distribution} | ${currentConfig.distribution} (α=${currentConfig.dirichletAlpha}) | - |\n`;
    md += `| Quantization | ${effectivePinned.config.quantization.toUpperCase()} | ${currentConfig.quantization.toUpperCase()} | - |\n`;
    md += `| Global MAE | ${pinnedMAE.toFixed(2)} km/h | ${currentMAE.toFixed(2)} km/h | ${maeDiff > 0 ? '+' : ''}${maeDiff.toFixed(2)} km/h (${maePercent}%) |\n`;
    md += `| Global RMSE | ${pinnedRMSE.toFixed(2)} km/h | ${currentRMSE.toFixed(2)} km/h | ${rmseDiff > 0 ? '+' : ''}${rmseDiff.toFixed(2)} km/h (${rmsePercent}%) |\n`;
    md += `| Total Comm Bytes | ${pinnedMB.toFixed(1)} MB | ${currentMB.toFixed(1)} MB | ${mbDiff > 0 ? '+' : ''}${mbDiff.toFixed(1)} MB (${mbPercent}%) |\n`;
    md += `| Client Drift ||Δw|| | ${pinnedDrift.toFixed(3)} | ${currentDrift.toFixed(3)} | ${driftDiff > 0 ? '+' : ''}${driftDiff.toFixed(3)} |\n`;
    
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
      
      {/* Header & Pin Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
              <span>Side-by-Side Simulation Comparison</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                Run A vs Run B
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Pin current results to evaluate accuracy trade-offs, drift reduction, and communication savings
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPinCurrentRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Pin Current as Baseline</span>
          </button>

          {pinnedRun && (
            <button
              onClick={onClearPinned}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
              title="Reset pinned run to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pin</span>
            </button>
          )}

          <button
            onClick={copyComparisonMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Diff Table' : 'Copy Diff (MD)'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Hyperparameter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Run A (Pinned Run) */}
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/90 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Run A (Pinned Baseline)
            </span>
            <span className="text-[10px] font-mono text-amber-800 font-semibold">{effectivePinned.timestamp}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>Model: <strong className="text-slate-900">{MODEL_SPECS[effectivePinned.config.modelArchitecture].name.split(' ')[1]}</strong></div>
            <div>Clients: <strong className="text-slate-900">{effectivePinned.config.clientCount} RSUs</strong></div>
            <div>Distribution: <strong className="text-slate-900">{effectivePinned.config.distribution === 'iid' ? 'IID (Uniform)' : `Non-IID (α=${effectivePinned.config.dirichletAlpha})`}</strong></div>
            <div>Quantization: <strong className="text-slate-900">{effectivePinned.config.quantization.toUpperCase()}</strong></div>
          </div>
        </div>

        {/* Run B (Current Active Run) */}
        <div className="bg-cyan-50/60 rounded-xl p-4 border border-cyan-200/90 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-cyan-200">
            <span className="font-bold text-cyan-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              Run B (Current Experiment)
            </span>
            <span className="text-[10px] font-mono text-cyan-800 font-bold bg-cyan-100 px-2 py-0.5 rounded">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>Model: <strong className="text-slate-900">{MODEL_SPECS[currentConfig.modelArchitecture].name.split(' ')[1]}</strong></div>
            <div>Clients: <strong className="text-slate-900">{currentConfig.clientCount} RSUs</strong></div>
            <div>Distribution: <strong className="text-slate-900">{currentConfig.distribution === 'iid' ? 'IID (Uniform)' : `Non-IID (α=${currentConfig.dirichletAlpha})`}</strong></div>
            <div>Quantization: <strong className="text-slate-900">{currentConfig.quantization.toUpperCase()}</strong></div>
          </div>
        </div>

      </div>

      {/* 4 Differential KPI Diff Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        {/* MAE Diff */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex justify-between">
            <span>Prediction MAE:</span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${maeDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {maeDiff <= 0 ? 'Improved' : 'Higher Error'}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-lg font-bold text-slate-900">{currentMAE.toFixed(2)}</span>
            <span className="text-xs text-slate-400">vs {pinnedMAE.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {maeDiff <= 0 ? <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingUp className="w-3.5 h-3.5 text-rose-600" />}
            <span className={maeDiff <= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
              {maeDiff > 0 ? '+' : ''}{maeDiff.toFixed(2)} km/h ({maePercent}%)
            </span>
          </div>
        </div>

        {/* RMSE Diff */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex justify-between">
            <span>Prediction RMSE:</span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${rmseDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {rmseDiff <= 0 ? 'Better' : 'Worse'}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-lg font-bold text-slate-900">{currentRMSE.toFixed(2)}</span>
            <span className="text-xs text-slate-400">vs {pinnedRMSE.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {rmseDiff <= 0 ? <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingUp className="w-3.5 h-3.5 text-rose-600" />}
            <span className={rmseDiff <= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
              {rmseDiff > 0 ? '+' : ''}{rmseDiff.toFixed(2)} km/h ({rmsePercent}%)
            </span>
          </div>
        </div>

        {/* Total Communication Bytes Diff */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex justify-between">
            <span>Network Comm Cost:</span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${mbDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {mbDiff <= 0 ? `${Math.abs(mbPercent)}% Saved` : 'Higher MB'}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-lg font-bold text-slate-900">{currentMB} MB</span>
            <span className="text-xs text-slate-400">vs {pinnedMB} MB</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Wifi className="w-3.5 h-3.5 text-indigo-600" />
            <span className={mbDiff <= 0 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
              {mbDiff > 0 ? '+' : ''}{mbDiff} MB ({mbPercent > 0 ? '+' : ''}{mbPercent}%)
            </span>
          </div>
        </div>

        {/* Client Drift Diff */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex justify-between">
            <span>Client Drift ||Δw||:</span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${driftDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {driftDiff <= 0 ? 'Lower Drift' : 'Higher Skew'}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-lg font-bold text-slate-900">{currentDrift.toFixed(3)}</span>
            <span className="text-xs text-slate-400">vs {pinnedDrift.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
            <span className={driftDiff <= 0 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
              {driftDiff > 0 ? '+' : ''}{driftDiff.toFixed(3)} divergence
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Bandwidth Consumption & Cost-Efficiency Estimator */}
      <BandwidthEfficiencyEstimator
        currentConfig={currentConfig}
        pinnedConfig={effectivePinned.config}
        currentTotalMB={currentMB}
        pinnedTotalMB={pinnedMB}
        onApplyConfig={onUpdateConfig}
        currentLanguage={currentLanguage}
      />

      {/* Dual Overlay Comparison Chart */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-semibold text-slate-700 gap-2">
          <span>Highway Speed Forecast Curve Overlay (Run A vs Run B):</span>
          <div className="flex items-center gap-2">
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 text-xs font-bold"
            >
              {METR_LA_KEY_SENSORS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.highway} - {s.corridorName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full aspect-[21/8] min-h-[200px] max-h-[250px] bg-slate-50/70 rounded-xl border border-slate-200/90 p-2">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full select-none">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const y = padT + effH * r;
              const val = maxV - r * rng;
              return (
                <g key={r}>
                  <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x={padL - 6} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Time markers */}
            {[
              { label: '00:00 (Night)', idx: 0 },
              { label: '08:30 (Morning Peak)', idx: Math.floor(groundTruth.length * 0.35) },
              { label: '14:00 (Midday)', idx: Math.floor(groundTruth.length * 0.58) },
              { label: '18:15 (Evening Peak)', idx: Math.floor(groundTruth.length * 0.76) },
              { label: '23:55 (End)', idx: groundTruth.length - 1 }
            ].map(m => {
              const x = getX(m.idx);
              return (
                <g key={m.label}>
                  <line x1={x} y1={padT} x2={x} y2={chartH - padB} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text x={x} y={chartH - 6} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                    {m.label}
                  </text>
                </g>
              );
            })}

            {/* Ground Truth Actual (Emerald) */}
            <path d={gtPath} fill="none" stroke="#059669" strokeWidth="2.4" />

            {/* Run A (Pinned) Forecast (Amber dashed) */}
            <path d={pinnedPath} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" />

            {/* Run B (Current) Forecast (Cyan solid) */}
            <path d={currentPath} fill="none" stroke="#0284c7" strokeWidth="2.2" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-3.5 h-1 bg-emerald-600 rounded-full" />
              Ground Truth Actual Speed
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-3.5 h-1 bg-amber-600 border-b border-dashed" />
              Run A: Pinned ({pinnedMAE.toFixed(2)} km/h)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-cyan-800">
              <span className="w-3.5 h-1 bg-cyan-600 rounded-full" />
              Run B: Current ({currentMAE.toFixed(2)} km/h)
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            METR-LA Detector #{METR_LA_KEY_SENSORS[selectedSensorId - 1].detectorId}
          </div>
        </div>
      </div>

    </div>
  );
};
