import React from 'react';
import { 
  Sliders, 
  Database, 
  Users, 
  Cpu, 
  Share2, 
  Minimize2, 
  Info,
  Clock,
  Shuffle,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';
import { 
  SimulationConfig, 
  DatasetId, 
  ModelArchitecture, 
  AggregationAlgorithm, 
  DistributionType, 
  QuantizationType 
} from '../types/federated';
import { DATASETS, MODEL_SPECS } from '../services/trafficDataService';

interface ConfigurationPanelProps {
  config: SimulationConfig;
  disabled: boolean;
  onChangeConfig: (newConfig: Partial<SimulationConfig>) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  disabled,
  onChangeConfig
}) => {
  // Preset handler for fast exploration
  const applyPreset = (preset: 'standard' | 'severe-drift' | 'bandwidth-saver' | 'pune') => {
    if (disabled) return;
    if (preset === 'standard') {
      onChangeConfig({
        datasetId: 'metr-la',
        clientCount: 4,
        distribution: 'iid',
        modelArchitecture: 'gru',
        algorithm: 'fedavg',
        quantization: 'fp32',
        localEpochs: 2
      });
    } else if (preset === 'severe-drift') {
      onChangeConfig({
        datasetId: 'metr-la',
        clientCount: 5,
        distribution: 'non-iid-dirichlet',
        dirichletAlpha: 0.2,
        modelArchitecture: 'gru',
        algorithm: 'fedprox',
        proximalMu: 0.15,
        quantization: 'fp16',
        localEpochs: 3
      });
    } else if (preset === 'bandwidth-saver') {
      onChangeConfig({
        datasetId: 'pems-d4',
        clientCount: 3,
        distribution: 'non-iid-dirichlet',
        dirichletAlpha: 0.5,
        modelArchitecture: 'tcn-cnn',
        algorithm: 'fedavg',
        quantization: 'int8',
        localEpochs: 1
      });
    } else if (preset === 'pune') {
      onChangeConfig({
        datasetId: 'pune-intersections',
        clientCount: 3,
        distribution: 'non-iid-dirichlet',
        dirichletAlpha: 0.4,
        modelArchitecture: 'compact-mlp',
        algorithm: 'fedavg',
        quantization: 'fp32',
        localEpochs: 2
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Federated Hyperparameters & Presets
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure partition rules, edge models, and communication parameters
            </p>
          </div>
        </div>

        {/* Quick Presets for User-Friendliness */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          <button
            onClick={() => applyPreset('standard')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer disabled:opacity-50 transition-colors"
          >
            IID Standard
          </button>
          <button
            onClick={() => applyPreset('severe-drift')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-medium text-[11px] cursor-pointer disabled:opacity-50 transition-colors"
          >
            Severe Drift (α=0.2)
          </button>
          <button
            onClick={() => applyPreset('bandwidth-saver')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-medium text-[11px] cursor-pointer disabled:opacity-50 transition-colors"
          >
            Bandwidth Saver (INT8)
          </button>
          <button
            onClick={() => applyPreset('pune')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-medium text-[11px] cursor-pointer disabled:opacity-50 transition-colors"
          >
            Pune Smart City
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        
        {/* 1. Dataset Selection (C1) */}
        <div className="space-y-1.5">
          <label className="text-slate-800 font-bold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>Public Traffic Dataset (C1)</span>
          </label>
          <select
            value={config.datasetId}
            disabled={disabled}
            onChange={(e) => onChangeConfig({ datasetId: e.target.value as DatasetId })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:opacity-50 font-semibold"
          >
            {Object.values(DATASETS).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.sensorsCount} sensors, {d.metricUnit})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {DATASETS[config.datasetId].description}
          </p>
        </div>

        {/* 2. Client Count & Partitioning (C1 & C4) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-800 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Edge RSUs (C1)</span>
            </label>
            <span className="font-mono text-cyan-800 font-bold bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              {config.clientCount} Clients
            </span>
          </div>
          <div className="flex gap-2">
            {[3, 4, 5].map((cnt) => (
              <button
                key={cnt}
                disabled={disabled}
                onClick={() => onChangeConfig({ clientCount: cnt })}
                className={`flex-1 py-1.5 rounded-lg border font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  config.clientCount === cnt
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cnt} Nodes
              </button>
            ))}
          </div>

          {/* Distribution Mode (IID vs Non-IID) */}
          <div className="pt-1.5">
            <label className="text-slate-800 font-bold flex items-center gap-1.5 mb-1.5">
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>Data Heterogeneity (C4)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={disabled}
                onClick={() => onChangeConfig({ distribution: 'iid' })}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold text-center transition-all cursor-pointer disabled:opacity-50 ${
                  config.distribution === 'iid'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                IID (Uniform)
              </button>
              <button
                disabled={disabled}
                onClick={() => onChangeConfig({ distribution: 'non-iid-dirichlet' })}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold text-center transition-all cursor-pointer disabled:opacity-50 ${
                  config.distribution !== 'iid'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Non-IID (Skewed)
              </button>
            </div>
            {config.distribution !== 'iid' && (
              <div className="mt-2 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 font-medium">Dirichlet α (lower = higher drift):</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  disabled={disabled}
                  value={config.dirichletAlpha}
                  onChange={(e) => onChangeConfig({ dirichletAlpha: parseFloat(e.target.value) })}
                  className="w-24 accent-amber-600 cursor-pointer"
                />
                <span className="font-mono text-amber-800 font-bold text-xs">{config.dirichletAlpha.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Compact Forecasting Model (C2) */}
        <div className="space-y-1.5">
          <label className="text-slate-800 font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Compact Edge Architecture (C2)</span>
          </label>
          <select
            value={config.modelArchitecture}
            disabled={disabled}
            onChange={(e) => onChangeConfig({ modelArchitecture: e.target.value as ModelArchitecture })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50 font-semibold"
          >
            {Object.values(MODEL_SPECS).map((m) => (
              <option key={m.architecture} value={m.architecture}>
                {m.name} ({m.parameterCount.toLocaleString()} params, {m.baseSizeKb.toFixed(1)} KB)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {MODEL_SPECS[config.modelArchitecture].description}
          </p>
        </div>

        {/* 4. Aggregation Strategy */}
        <div className="space-y-1.5">
          <label className="text-slate-800 font-bold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>Aggregation Algorithm</span>
          </label>
          <select
            value={config.algorithm}
            disabled={disabled}
            onChange={(e) => onChangeConfig({ algorithm: e.target.value as AggregationAlgorithm })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:opacity-50 font-semibold"
          >
            <option value="fedavg">FedAvg (McMahan 2017) - Baseline</option>
            <option value="fedprox">FedProx (Proximal Regularizer for Drift)</option>
            <option value="fedcm">FedCM (Client-level Momentum)</option>
            <option value="scaffold">SCAFFOLD (Control Variates against Drift)</option>
          </select>
          {config.algorithm === 'fedprox' && (
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-600 font-medium">Proximal Regularizer μ:</span>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                disabled={disabled}
                value={config.proximalMu}
                onChange={(e) => onChangeConfig({ proximalMu: parseFloat(e.target.value) })}
                className="w-24 accent-cyan-600 cursor-pointer"
              />
              <span className="font-mono text-cyan-800 font-bold text-xs">{config.proximalMu.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* 5. Quantization / Bandwidth Saver (C6) */}
        <div className="space-y-1.5">
          <label className="text-slate-800 font-bold flex items-center gap-1.5">
            <Minimize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bandwidth Quantization (C6)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fp32', label: 'FP32 (4 B/p)', desc: '100% Size' },
              { id: 'fp16', label: 'FP16 (2 B/p)', desc: '50% Bandwidth' },
              { id: 'int8', label: 'INT8 (1 B/p)', desc: '75% Savings' },
              { id: 'topk-sparse', label: 'Top-10% Sparse', desc: '85% Savings' },
            ].map((q) => (
              <button
                key={q.id}
                disabled={disabled}
                onClick={() => onChangeConfig({ quantization: q.id as QuantizationType })}
                className={`py-1.5 px-2 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 ${
                  config.quantization === q.id
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px]">{q.label}</div>
                <div className="text-[10px] text-slate-500 font-medium">{q.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Chronological Data Split & Local Epochs (C3) */}
        <div className="space-y-1.5">
          <label className="text-slate-800 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chronological Split & Local Epochs (C3)</span>
          </label>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">Chronological Ratio:</span>
              <span className="font-mono text-emerald-700 font-bold">70% Train / 15% Val / 15% Test</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-200">
              <div className="bg-emerald-500 w-[70%]" title="Train (Past 5 days)" />
              <div className="bg-amber-400 w-[15%]" title="Validation (Day 6)" />
              <div className="bg-cyan-500 w-[15%]" title="Test (Day 7 Out-of-Sample)" />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600 text-[11px] font-medium">Local Epochs (E):</span>
              <div className="flex gap-1">
                {[1, 2, 3, 5].map((ep) => (
                  <button
                    key={ep}
                    disabled={disabled}
                    onClick={() => onChangeConfig({ localEpochs: ep })}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer disabled:opacity-50 transition-colors ${
                      config.localEpochs === ep
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    E={ep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
