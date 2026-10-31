import React, { useState, useMemo } from 'react';
import { 
  Wifi, 
  Cpu, 
  Layers, 
  Zap, 
  DollarSign, 
  ArrowRight, 
  Check, 
  Copy, 
  TrendingDown, 
  Sliders, 
  HardDrive, 
  Sparkles, 
  Radio, 
  HelpCircle,
  BarChart3,
  BookmarkCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ModelArchitecture, QuantizationType, SimulationConfig } from '../types/federated';
import { MODEL_SPECS, calculateCommunicationCosts } from '../services/trafficDataService';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface BandwidthEfficiencyEstimatorProps {
  currentConfig?: SimulationConfig;
  pinnedConfig?: SimulationConfig;
  currentTotalMB?: number;
  pinnedTotalMB?: number;
  onApplyConfig?: (updates: Partial<SimulationConfig>) => void;
  currentLanguage?: SupportedLanguage;
}

export const BandwidthEfficiencyEstimator: React.FC<BandwidthEfficiencyEstimatorProps> = ({
  currentConfig,
  pinnedConfig,
  currentTotalMB,
  pinnedTotalMB,
  onApplyConfig,
  currentLanguage = 'en'
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);

  // Local interactive estimator state
  const [selectedArch, setSelectedArch] = useState<ModelArchitecture>(
    currentConfig?.modelArchitecture || 'gru'
  );
  const [selectedQuant, setSelectedQuant] = useState<QuantizationType>(
    currentConfig?.quantization || 'int8'
  );
  const [rounds, setRounds] = useState<number>(
    currentConfig?.totalRounds || 50
  );
  const [clientCount, setClientCount] = useState<number>(
    currentConfig?.clientCount || 4
  );
  const [customParams, setCustomParams] = useState<number>(
    MODEL_SPECS[currentConfig?.modelArchitecture || 'gru'].parameterCount
  );
  const [isCustomParamMode, setIsCustomParamMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  // Sync when preset model architecture changes
  const handleArchChange = (arch: ModelArchitecture) => {
    setSelectedArch(arch);
    setIsCustomParamMode(false);
    setCustomParams(MODEL_SPECS[arch].parameterCount);
  };

  const activeParamCount = isCustomParamMode ? customParams : MODEL_SPECS[selectedArch].parameterCount;

  // Bandwidth estimation calculations
  const estimation = useMemo(() => {
    // Current selected configuration
    const comm = calculateCommunicationCosts(activeParamCount, selectedQuant, clientCount);
    const totalBytes = comm.totalRoundBytes * rounds;
    const totalMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
    const totalGB = Math.round((totalMB / 1024) * 1000) / 1000;

    // Baseline uncompressed FP32 configuration
    const baseComm = calculateCommunicationCosts(activeParamCount, 'fp32', clientCount);
    const baseTotalBytes = baseComm.totalRoundBytes * rounds;
    const baseTotalMB = Math.round((baseTotalBytes / (1024 * 1024)) * 100) / 100;

    // Bandwidth savings
    const mbSaved = Math.max(0, Math.round((baseTotalMB - totalMB) * 100) / 100);
    const percentSaved = baseTotalMB > 0 ? Math.round(((baseTotalMB - totalMB) / baseTotalMB) * 1000) / 10 : 0;

    // Efficiency Multipliers & Metric
    // Cost-Efficiency Multiplier: Inverse of bandwidth ratio compared to baseline FP32
    const efficiencyMultiplier = totalMB > 0 ? Math.round((baseTotalMB / totalMB) * 100) / 100 : 1.0;

    // Accuracy retention factor based on empirical benchmark studies (METR-LA PeMS)
    const accuracyRetentionRate: Record<QuantizationType, number> = {
      'fp32': 100.0,
      'fp16': 99.8,
      'int8': 98.9,
      'topk-sparse': 97.2
    };

    const retention = accuracyRetentionRate[selectedQuant];
    // Cost-Efficiency Score (CES): (Accuracy % Preserved) / (Bandwidth Ratio %)
    // Normalized so FP32 baseline = 1.00, INT8 ≈ 3.96
    const bandwidthRatio = totalMB / (baseTotalMB || 1);
    const costEfficiencyScore = bandwidthRatio > 0 ? Math.round(((retention / 100) / bandwidthRatio) * 100) / 100 : 1.0;

    // Cellular Telemetry Operational Cost Model (Standard IoT pooling: $0.22/GB or ₹18.5/GB)
    const usdPerGB = 0.22;
    const inrPerGB = 18.50;
    const estimatedCostUSD = (totalGB * usdPerGB).toFixed(4);
    const estimatedCostINR = (totalGB * inrPerGB).toFixed(2);
    const baselineCostUSD = ((baseTotalMB / 1024) * usdPerGB).toFixed(4);

    // Uplink vs Downlink splits
    const uplinkMB = Math.round(((comm.uplinkBytesPerRound * rounds) / (1024 * 1024)) * 100) / 100;
    const downlinkMB = Math.round(((comm.downlinkBytesPerRound * rounds) / (1024 * 1024)) * 100) / 100;

    // Multi-quantization comparison table for the exact active model & rounds
    const quantTypes: QuantizationType[] = ['fp32', 'fp16', 'int8', 'topk-sparse'];
    const comparisonMatrix = quantTypes.map(q => {
      const qComm = calculateCommunicationCosts(activeParamCount, q, clientCount);
      const qMB = Math.round(((qComm.totalRoundBytes * rounds) / (1024 * 1024)) * 100) / 100;
      const qSaved = Math.round((baseTotalMB - qMB) * 10) / 10;
      const qRatio = qMB / (baseTotalMB || 1);
      const qCES = qRatio > 0 ? Math.round(((accuracyRetentionRate[q] / 100) / qRatio) * 100) / 100 : 1.0;
      const qMultiplier = qMB > 0 ? Math.round((baseTotalMB / qMB) * 100) / 100 : 1.0;

      return {
        quant: q,
        name: q === 'fp32' ? 'FP32 Full Precision' : q === 'fp16' ? 'FP16 Half Precision' : q === 'int8' ? 'INT8 Quantized' : 'Top-10% Sparse Gradient',
        bytesPerParam: qComm.bytesPerParam,
        payloadKB: qComm.modelPayloadKB,
        totalMB: qMB,
        mbSaved: qSaved,
        percentSaved: Math.round((1 - qRatio) * 100),
        cesScore: qCES,
        multiplier: qMultiplier,
        costUSD: ((qMB / 1024) * usdPerGB).toFixed(4),
        accuracyRetention: accuracyRetentionRate[q]
      };
    });

    return {
      comm,
      totalMB,
      totalGB,
      baseTotalMB,
      mbSaved,
      percentSaved,
      efficiencyMultiplier,
      costEfficiencyScore,
      retention,
      estimatedCostUSD,
      estimatedCostINR,
      baselineCostUSD,
      uplinkMB,
      downlinkMB,
      comparisonMatrix
    };
  }, [activeParamCount, selectedQuant, rounds, clientCount]);

  const handleCopyReport = () => {
    let report = `### AIORI PS-003 Bandwidth Consumption & Cost-Efficiency Estimation\n`;
    report += `**Model:** ${MODEL_SPECS[selectedArch].name} (${activeParamCount.toLocaleString()} params)\n`;
    report += `**Quantization Level:** ${selectedQuant.toUpperCase()} (${estimation.comm.bytesPerParam} bytes/weight)\n`;
    report += `**Federated Setup:** ${rounds} Rounds across ${clientCount} Edge RSUs\n\n`;
    report += `#### Estimated Telemetry Consumption:\n`;
    report += `- **Total Bandwidth Consumption:** ${estimation.totalMB} MB (${estimation.totalGB} GB)\n`;
    report += `- **Per-Round Bandwidth:** ${estimation.comm.totalRoundMB} MB/round\n`;
    report += `- **Baseline Uncompressed (FP32):** ${estimation.baseTotalMB} MB\n`;
    report += `- **Bandwidth Saved:** ${estimation.mbSaved} MB (${estimation.percentSaved}% reduction)\n`;
    report += `- **Cost-Efficiency Score (CES):** ${estimation.costEfficiencyScore}x ROI (${estimation.efficiencyMultiplier}x vs FP32)\n`;
    report += `- **Estimated Cellular Expense:** $${estimation.estimatedCostUSD} USD / ₹${estimation.estimatedCostINR} INR\n`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToSimulation = () => {
    if (onApplyConfig) {
      onApplyConfig({
        modelArchitecture: selectedArch,
        quantization: selectedQuant,
        totalRounds: rounds,
        clientCount: clientCount
      });
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                Bandwidth Consumption & Cost-Efficiency Estimator
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-300">
                Interactive Model
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Estimate cumulative edge-to-cloud transmission payload (MB), cellular expense, and compression ROI across federated rounds
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onApplyConfig && (
            <button
              onClick={handleApplyToSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
              title="Apply selected quantization and rounds to active simulation"
            >
              {appliedNotice ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{appliedNotice ? 'Applied to Config!' : 'Apply to Active Run'}</span>
            </button>
          )}

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Copy estimation calculation to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-xs">
        
        {/* 1. Quantization Level Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quantization Level:</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {estimation.comm.bytesPerParam} B / param
            </span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'fp32', label: 'FP32', sub: '4 Bytes', badge: '100% Size' },
              { id: 'fp16', label: 'FP16', sub: '2 Bytes', badge: '-50%' },
              { id: 'int8', label: 'INT8', sub: '1 Byte', badge: '-75%' },
              { id: 'topk-sparse', label: 'Top-K', sub: '0.6 B', badge: '-85%' }
            ].map(q => (
              <button
                key={q.id}
                onClick={() => setSelectedQuant(q.id as QuantizationType)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedQuant === q.id
                    ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>{q.label}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    selectedQuant === q.id ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {q.badge}
                  </span>
                </div>
                <div className={`text-[10px] mt-0.5 ${selectedQuant === q.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {q.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Model Architecture & Parameter Count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Model Architecture:</span>
            </label>
            <button
              onClick={() => setIsCustomParamMode(!isCustomParamMode)}
              className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              {isCustomParamMode ? 'Presets' : 'Custom'}
            </button>
          </div>

          {!isCustomParamMode ? (
            <select
              value={selectedArch}
              onChange={(e) => handleArchChange(e.target.value as ModelArchitecture)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-2xs"
            >
              <option value="gru">Compact GRU ({MODEL_SPECS.gru.parameterCount.toLocaleString()} params)</option>
              <option value="tcn-cnn">Dilated Causal 1D-TCN ({MODEL_SPECS['tcn-cnn'].parameterCount.toLocaleString()} params)</option>
              <option value="compact-mlp">Lightweight MLP ({MODEL_SPECS['compact-mlp'].parameterCount.toLocaleString()} params)</option>
              <option value="st-gnn">Spatial-Temporal GNN ({MODEL_SPECS['st-gnn'].parameterCount.toLocaleString()} params)</option>
            </select>
          ) : (
            <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-300">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Parameters:</span>
                <span className="font-bold text-indigo-700">{customParams.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={customParams}
                onChange={(e) => setCustomParams(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>Model Payload:</span>
            <span className="font-bold text-slate-700">{estimation.comm.modelPayloadKB} KB</span>
          </div>
        </div>

        {/* 3. Communication Rounds Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Total Rounds:</span>
            </label>
            <span className="font-mono font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-xs">
              {rounds} Rounds
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1 pt-0.5">
            {[10, 25, 50, 100, 150].map(r => (
              <button
                key={r}
                onClick={() => setRounds(r)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  rounds === r
                    ? 'bg-purple-600 text-white border-purple-700 font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Active Edge Clients (RSUs) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              <span>Edge Clients:</span>
            </label>
            <span className="font-mono font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded text-xs">
              {clientCount} RSUs
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[2, 4, 6, 8].map(k => (
              <button
                key={k}
                onClick={() => setClientCount(k)}
                className={`p-2 rounded-xl text-center border font-mono font-bold text-xs transition-all cursor-pointer ${
                  clientCount === k
                    ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {k} RSU
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center pt-0.5">
            METR-LA: 4 Highway RSUs standard
          </div>
        </div>

      </div>

      {/* Key Estimated Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Bandwidth Consumption (MB) */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50/50 p-4 rounded-2xl border border-cyan-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-cyan-700" />
              <span>Estimated Bandwidth:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-200/80 text-cyan-900 font-bold">
              {rounds} Rounds
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {estimation.totalMB}
            </span>
            <span className="text-sm font-bold text-slate-500 font-mono">MB</span>
            <span className="text-xs text-slate-400 font-mono ml-auto">
              ({estimation.totalGB} GB)
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-cyan-100">
            <span>Per-round rate:</span>
            <span className="font-mono font-bold text-cyan-800">{estimation.comm.totalRoundMB} MB/round</span>
          </div>
        </div>

        {/* Metric 2: Bandwidth Savings vs FP32 Baseline */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-700" />
              <span>Bandwidth Preserved:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
              vs FP32 Base
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-900 font-mono tracking-tight">
              {estimation.percentSaved > 0 ? `-${estimation.percentSaved}%` : 'Baseline'}
            </span>
            <span className="text-xs font-bold text-emerald-700 font-mono ml-auto">
              {estimation.mbSaved > 0 ? `${estimation.mbSaved} MB Saved` : '0 MB'}
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-emerald-100">
            <span>FP32 Uncompressed:</span>
            <span className="font-mono font-bold text-slate-700">{estimation.baseTotalMB} MB</span>
          </div>
        </div>

        {/* Metric 3: Cost-Efficiency Metric & ROI */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50/50 p-4 rounded-2xl border border-indigo-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <span>Cost-Efficiency Metric:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 font-bold">
              CES Score
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-indigo-950 font-mono tracking-tight">
              {estimation.costEfficiencyScore.toFixed(2)}x
            </span>
            <span className="text-xs font-bold text-indigo-700 font-mono">ROI Index</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 ml-auto font-bold">
              {estimation.efficiencyMultiplier}x Compression
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-indigo-100">
            <span>Accuracy Retained:</span>
            <span className="font-mono font-bold text-emerald-700">{estimation.retention}%</span>
          </div>
        </div>

        {/* Metric 4: Estimated Cellular IoT Operational Cost */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-700" />
              <span>Cellular 5G Data Cost:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
              IoT Tariff
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              ${estimation.estimatedCostUSD}
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">USD</span>
            <span className="text-xs font-mono font-bold text-amber-900 ml-auto">
              (₹{estimation.estimatedCostINR} INR)
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-amber-100">
            <span>FP32 Uncompressed Cost:</span>
            <span className="font-mono font-bold text-slate-500">${estimation.baselineCostUSD}</span>
          </div>
        </div>

      </div>

      {/* Cross-Simulation Comparison Context (Run A Pinned vs Run B Current vs Estimator) */}
      {(pinnedConfig || currentConfig) && (
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">Simulation Comparison Context:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            {pinnedConfig && (
              <div className="flex items-center gap-1.5 bg-amber-100/70 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300">
                <span className="font-bold">Run A (Pinned):</span>
                <span>{pinnedConfig.quantization.toUpperCase()} • {pinnedTotalMB ? `${pinnedTotalMB} MB` : 'N/A'}</span>
              </div>
            )}

            {currentConfig && (
              <div className="flex items-center gap-1.5 bg-cyan-100/70 text-cyan-900 px-2.5 py-1 rounded-lg border border-cyan-300">
                <span className="font-bold">Run B (Current):</span>
                <span>{currentConfig.quantization.toUpperCase()} • {currentTotalMB ? `${currentTotalMB} MB` : 'N/A'}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-300 font-bold">
              <span>Estimator Target:</span>
              <span>{selectedQuant.toUpperCase()} • {estimation.totalMB} MB</span>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Quantization Comparative Matrix */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-600" />
            <span>Quantization Level Bandwidth & Cost-Efficiency Matrix:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Model: {MODEL_SPECS[selectedArch].name.split(' ')[1]} ({activeParamCount.toLocaleString()} params, {rounds} rounds, {clientCount} RSUs)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-2.5 px-3">Quantization Mode</th>
                <th className="py-2.5 px-3">Bits / Param</th>
                <th className="py-2.5 px-3">Payload (Per Client)</th>
                <th className="py-2.5 px-3">Cumulative MB</th>
                <th className="py-2.5 px-3">Bandwidth Saved</th>
                <th className="py-2.5 px-3">Cost-Efficiency (CES)</th>
                <th className="py-2.5 px-3">Cellular Cost</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {estimation.comparisonMatrix.map(row => {
                const isSelected = selectedQuant === row.quant;
                const isCurrentRunQuant = currentConfig?.quantization === row.quant;
                const isPinnedQuant = pinnedConfig?.quantization === row.quant;

                return (
                  <tr 
                    key={row.quant}
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-cyan-50/70 font-semibold' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        row.quant === 'int8' ? 'bg-emerald-500' :
                        row.quant === 'topk-sparse' ? 'bg-purple-500' :
                        row.quant === 'fp16' ? 'bg-cyan-500' : 'bg-slate-400'
                      }`} />
                      <span>{row.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-600 text-white font-mono font-bold">
                          Selected
                        </span>
                      )}
                      {isCurrentRunQuant && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-mono">
                          Run B
                        </span>
                      )}
                      {isPinnedQuant && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                          Run A
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.bytesPerParam * 8} bits ({row.bytesPerParam} B)
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {row.payloadKB} KB
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {row.totalMB} MB
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {row.percentSaved > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          -{row.percentSaved}% ({row.mbSaved} MB)
                        </span>
                      ) : (
                        <span className="text-slate-400">Baseline (0%)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                        row.cesScore >= 3.5 ? 'bg-emerald-100 text-emerald-800' :
                        row.cesScore >= 2.0 ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {row.cesScore.toFixed(2)}x Score ({row.multiplier}x)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      ${row.costUSD}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedQuant(row.quant)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Relative Bandwidth Distribution Bar */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-semibold">Relative Cumulative Bandwidth Footprint:</span>
          <span className="font-mono text-slate-500">
            {estimation.totalMB} MB of {estimation.baseTotalMB} MB Baseline ({Math.round((estimation.totalMB / (estimation.baseTotalMB || 1)) * 100)}% consumed)
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200">
          <div 
            className="bg-cyan-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((estimation.uplinkMB / (estimation.baseTotalMB || 1)) * 100))}%` }}
            title={`Uplink: ${estimation.uplinkMB} MB`}
          />
          <div 
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((estimation.downlinkMB / (estimation.baseTotalMB || 1)) * 100))}%` }}
            title={`Downlink: ${estimation.downlinkMB} MB`}
          />
          <div 
            className="bg-emerald-200/60 h-full flex-1"
            title={`Saved: ${estimation.mbSaved} MB (${estimation.percentSaved}%)`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Uplink ({estimation.uplinkMB} MB)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Downlink ({estimation.downlinkMB} MB)</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bandwidth Preserved ({estimation.mbSaved} MB)</span>
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-700">INT8 Telemetry Ratio: 25%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
