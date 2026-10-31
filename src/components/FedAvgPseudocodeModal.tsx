import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  FileCode2,
  Terminal
} from 'lucide-react';
import { SimulationConfig } from '../types/federated';
import { MODEL_SPECS } from '../services/trafficDataService';

interface FedAvgPseudocodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
}

export const FedAvgPseudocodeModal: React.FC<FedAvgPseudocodeModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'algorithm' | 'client' | 'aggregation'>('algorithm');

  if (!isOpen) return null;

  const currentModel = MODEL_SPECS[config.modelArchitecture];

  const fullPseudocode = `# PS-003: Federated Averaging (FedAvg) for Traffic Flow Forecasting
# Chronological Zero-Leakage Split (70% Train, 15% Val, 15% Test)
# Dataset: METR-LA (Los Angeles County Freeway Network)

Algorithm: FederatedAveraging(METR_LA, Clients K=${config.clientCount}, Rounds T=${config.totalRounds})
  Input:
    - K simulated edge RSUs (Roadside Units)
    - Chronologically partitioned speed matrices X_k with multi-horizon lags
    - Compact neural architecture: ${currentModel.name} (|w| = ${currentModel.parameterCount.toLocaleString()} params)
    - Local epochs E = ${config.localEpochs}, mini-batch size B = ${config.batchSize}, learning rate η = ${config.learningRate}
    - Quantization mode: ${config.quantization.toUpperCase()}

1. Server Initialization:
     Initialize global model weights w_0 randomly with seed ${config.randomSeed}
     Total training sample size n = sum(n_k for k in 1..K)

2. For each communication round t = 0, 1, ..., T-1 do:
     # Server broadcasts current global model to all K edge RSUs
     Downlink Payload: Size(w_t) * K bytes

     For each client k in 1..K in parallel do:
       # Local Client Update on edge RSU k
       w_{t+1}^k <- ClientUpdate(k, w_t)
       
       # Uplink transmission: quantized model weights
       Δw_k = Quantize(w_{t+1}^k, mode="${config.quantization}")
       Send Δw_k to Central Traffic Aggregation Server

     # Server-side Federated Aggregation:
     # Weights proportional to local sample partition sizes n_k
     w_{t+1} <- sum_{k=1}^K (n_k / n) * w_{t+1}^k

     # Chronological Out-of-Sample Evaluation:
     MAE_{t+1}, RMSE_{t+1} <- Evaluate(w_{t+1}, X_test_unseen)
  
  Return final global model w_T

Function ClientUpdate(k, w):
  # k: client index, w: initial weights for this round
  B_k <- mini-batches of size ${config.batchSize} from local chronological shard D_k
  For each local epoch e from 1 to ${config.localEpochs} do:
    For batch b in B_k do:
      # Feature vector: [Speed_t, Lags(1,3,6,12), Sin/Cos(Hour), RushHourFlags]
      y_pred <- ForwardPass(b.features, w)
      loss <- SmoothL1Loss(y_pred, b.ground_truth)
      w <- w - η * ∇loss
  Return w
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPseudocode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-2xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>FedAvg Algorithmic Deliverable</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  PS-003 Core Deliverable
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Federated Averaging pseudocode snippet & local RSU client update specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable Specifications Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 bg-slate-100/50 border-b border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
            <span>Model: <strong className="text-slate-900">{config.modelArchitecture.toUpperCase()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>RSUs: <strong className="text-slate-900">{config.clientCount} Clients</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Wifi className="w-3.5 h-3.5 text-amber-600" />
            <span>Quant: <strong className="text-slate-900">{config.quantization.toUpperCase()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Split: <strong className="text-slate-900">70/15/15 Chrono</strong></span>
          </div>
        </div>

        {/* Code Viewport with Syntax-styled Snippet */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>ps003_fedavg_traffic_forecast.py</span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pseudocode</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto whitespace-pre font-mono text-[11.5px] leading-5 text-slate-300">
            {fullPseudocode}
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Theoretical Aggregation:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-cyan-800 font-bold">
              w_(t+1) = Σ (n_k / n) * w_(t+1)^k
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
