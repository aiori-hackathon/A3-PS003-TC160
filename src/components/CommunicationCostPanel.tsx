import React, { useState } from 'react';
import { 
  Wifi, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Database, 
  Zap, 
  HardDrive,
  Download,
  Check
} from 'lucide-react';
import { RoundMetrics, ModelStats, QuantizationType } from '../types/federated';
import { calculateCommunicationCosts } from '../services/trafficDataService';
import { exportCommunicationCostCsv } from '../utils/exportCsv';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface CommunicationCostPanelProps {
  latestMetrics: RoundMetrics | null;
  modelStats: ModelStats;
  clientCount: number;
  quantization: QuantizationType;
  totalRounds: number;
  history?: RoundMetrics[];
  currentLanguage?: SupportedLanguage;
}

export const CommunicationCostPanel: React.FC<CommunicationCostPanelProps> = ({
  latestMetrics,
  modelStats,
  clientCount,
  quantization,
  totalRounds,
  history,
  currentLanguage = 'en'
}) => {
  const [isExported, setIsExported] = useState<boolean>(false);
  const comm = calculateCommunicationCosts(modelStats.parameterCount, quantization, clientCount);

  const currentRound = latestMetrics?.round || (history && history.length > 0 ? history[history.length - 1].round : 0);
  const cumulativeBytes = latestMetrics?.cumulativeBytes || (history && history.length > 0 ? history[history.length - 1].cumulativeBytes : 0);
  const cumulativeMB = Math.round((cumulativeBytes / (1024 * 1024)) * 100) / 100;
  
  const projectedTotalMB = Math.round((comm.totalRoundBytes * totalRounds) / (1024 * 1024) * 100) / 100;

  // Cellular Telemetry Operational Cost Estimator:
  const inrCostPerGB = 18.5; // ~₹18.5 per GB for enterprise IoT pool
  const usdCostPerGB = 0.22;
  const currentGB = cumulativeMB / 1024;
  const inrTotal = (currentGB * inrCostPerGB).toFixed(3);
  const usdTotal = (currentGB * usdCostPerGB).toFixed(4);

  // Communication ROI: Accuracy gained per MB
  const initialMAE = 16.0;
  const currentMAE = latestMetrics?.globalMAE || (history && history.length > 0 ? history[history.length - 1].globalMAE : initialMAE);
  const maeImprovement = Math.max(0, initialMAE - currentMAE);
  const accuracyPerMB = cumulativeMB > 0 ? (maeImprovement / cumulativeMB).toFixed(2) : '0.00';

  const handleExportCSV = () => {
    exportCommunicationCostCsv({
      latestMetrics,
      modelStats,
      clientCount,
      quantization,
      totalRounds,
      history
    });
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Communication-Cost & Byte Accounting (C6)
            </h3>
            <p className="text-[11px] text-slate-500">
              Uplink / downlink payload volume, cumulative MB, and cellular expense
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
            {quantization.toUpperCase()} Encoded
          </span>

          <button
            onClick={handleExportCSV}
            title="Export communication cost ledger, telemetry budget, and quantization comparison as CSV"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
              isExported
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {isExported ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-150" />
            ) : (
              <Download className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>
              {isExported
                ? getTranslation(currentLanguage, 'exportSuccess')
                : getTranslation(currentLanguage, 'exportCsv')}
            </span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Key Byte Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        
        {/* Downlink Broadcast */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1 text-cyan-700 font-bold">
              <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-600" />
              Downlink / Rnd
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">{clientCount} RSUs</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {(comm.downlinkBytesPerRound / 1024).toFixed(1)} <span className="text-xs text-slate-500 font-normal">KB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Server broadcast w_t
          </div>
        </div>

        {/* Uplink Upload */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Uplink / Rnd
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">Σ Δw_k</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {(comm.uplinkBytesPerRound / 1024).toFixed(1)} <span className="text-xs text-slate-500 font-normal">KB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            RSU local delta updates
          </div>
        </div>

        {/* Total Per Round */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1 text-indigo-700 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              Per Round Total
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {(comm.totalRoundBytes / 1024).toFixed(1)} <span className="text-xs text-slate-500 font-normal">KB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {comm.totalRoundBytes.toLocaleString()} bytes
          </div>
        </div>

        {/* Cumulative Network Transferred */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              Cumulative Comm
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">R{currentRound}</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {cumulativeMB} <span className="text-xs text-slate-500 font-normal">MB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Proj: ~{projectedTotalMB} MB
          </div>
        </div>

      </div>

      {/* Network ROI & Cellular Operational Cost Breakdown */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3 text-xs">
        
        {/* Comm ROI Bar */}
        <div>
          <div className="flex justify-between items-center text-slate-700 mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Communication ROI (Accuracy Gain per MB Transmitted)
            </span>
            <span className="font-mono text-cyan-800 font-bold">
              +{accuracyPerMB} ΔMAE / MB
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, parseFloat(accuracyPerMB) * 20)}%` }}
            />
          </div>
        </div>

        {/* Cellular SIM Tariff Estimator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-medium text-slate-600 text-[11px]">Cellular Telemetry (INR):</span>
            <span className="font-mono text-emerald-800 font-bold text-xs">
              ₹{inrTotal} <span className="text-[10px] font-normal text-slate-400">(@₹18.5/GB)</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="font-medium text-slate-600 text-[11px]">Cellular Telemetry (USD):</span>
            <span className="font-mono text-emerald-800 font-bold text-xs">
              ${usdTotal} <span className="text-[10px] font-normal text-slate-400">(@$0.22/GB)</span>
            </span>
          </div>
        </div>

        {/* Quantization Note */}
        <div className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5 pt-1">
          <span className="text-slate-800 font-bold">Bandwidth Efficiency:</span>
          <span>
            {quantization === 'fp32' && 'FP32 transmits uncompressed 32-bit floating point weights (4 bytes/parameter).'}
            {quantization === 'fp16' && 'FP16 reduces transmission bytes by 50% with negligible loss in model convergence.'}
            {quantization === 'int8' && 'INT8 quantization cuts payload bytes by 75% (1 byte/parameter), saving significant edge cellular bandwidth.'}
            {quantization === 'topk-sparse' && 'Top-10% Sparsification transmits only top gradient coordinates, providing 85% bandwidth reduction for bandwidth-constrained rural RSUs.'}
          </span>
        </div>

      </div>
    </div>
  );
};
