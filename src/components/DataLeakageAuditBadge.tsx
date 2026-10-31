import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Layers, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { SimulationConfig, DataLeakageAuditResult } from '../types/federated';
import { auditDataLeakage } from '../services/trafficDataService';

interface DataLeakageAuditBadgeProps {
  config: SimulationConfig;
  onUpdateConfig?: (partial: Partial<SimulationConfig>) => void;
  variant?: 'compact' | 'full';
}

export const DataLeakageAuditBadge: React.FC<DataLeakageAuditBadgeProps> = ({
  config,
  onUpdateConfig,
  variant = 'compact'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audit: DataLeakageAuditResult = auditDataLeakage(config);

  const handleToggleSimulation = (strategy: 'chronological' | 'overlapping' | 'random-shuffled') => {
    if (!onUpdateConfig) return;
    if (strategy === 'chronological') {
      onUpdateConfig({
        splitStrategy: 'chronological',
        simulateLeakageOverlap: false,
        trainSplitRatio: 0.70,
        valSplitRatio: 0.15,
        testSplitRatio: 0.15
      });
    } else if (strategy === 'overlapping') {
      onUpdateConfig({
        splitStrategy: 'overlapping',
        simulateLeakageOverlap: true,
        overlapMinutes: 240
      });
    } else {
      onUpdateConfig({
        splitStrategy: 'random-shuffled',
        simulateLeakageOverlap: true
      });
    }
  };

  return (
    <>
      {/* Interactive Badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold border transition-all duration-200 cursor-pointer shadow-2xs ${
          audit.hasLeakage
            ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800 ring-2 ring-rose-400/30'
            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
        }`}
        title="PS-003 Data Leakage & Chronological Partition Audit"
      >
        {audit.hasLeakage ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-bounce" />
            <span className="font-bold">
              Leakage Warning: {audit.overlapSteps} Steps Overlap
            </span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Audit: Zero Leakage (70/15/15)</span>
          </>
        )}
      </button>

      {/* Detailed Modal: Timeline, Overlap Analysis & Simulation Toggle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  audit.hasLeakage ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {audit.hasLeakage ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Data Leakage & Chronological Audit</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      audit.hasLeakage ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {audit.hasLeakage ? 'Leakage Detected' : 'Verified Zero Leakage'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    PS-003 Constraint C3: Chronological Forward-Chaining Verification (METR-LA 7-Day Horizon)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Status Alert Banner */}
            <div className="my-4">
              {audit.hasLeakage ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Methodological Violation: Temporal Leakage Active</span>
                  </div>
                  <p className="text-xs font-mono leading-relaxed">
                    {audit.reason}
                  </p>
                  <div className="text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-200 text-rose-950 font-sans font-medium">
                    <strong className="font-bold">Recommendation:</strong> {audit.recommendation}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Audit Status: 100% Compliant</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {audit.reason}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Strict temporal separation ensures models only train on past speed states and evaluate purely on future unseen timesteps.
                  </p>
                </div>
              )}
            </div>

            {/* 7-Day Timeline Visualization */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" /> METR-LA 7-Day Continuous Timeline (2,016 Timesteps):
                </span>
                <span className="font-mono text-[11px] text-slate-500">5-min intervals</span>
              </div>

              {/* Progress bar timeline with colored slices */}
              <div className="relative h-8 bg-slate-200 rounded-xl overflow-hidden flex font-mono text-[10px] font-bold text-white shadow-inner">
                {/* Train Window */}
                <div 
                  className="bg-cyan-600 h-full flex items-center justify-center transition-all duration-300 relative"
                  style={{ width: `${(audit.trainWindow.count / audit.totalSteps) * 100}%` }}
                  title={`Train: Steps ${audit.trainWindow.startStep}–${audit.trainWindow.endStep}`}
                >
                  <span className="truncate px-1">Train ({Math.round((audit.trainWindow.count / audit.totalSteps) * 100)}%)</span>
                  {/* Flashing Overlap stripe if leakage exists */}
                  {audit.hasLeakage && audit.overlapSteps > 0 && (
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/90 border-l border-white animate-pulse flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ width: `${(audit.overlapSteps / audit.trainWindow.count) * 100}%` }}
                      title={`Leakage Overlap: ${audit.overlapSteps} steps leaked into Validation`}
                    >
                      Overlap!
                    </div>
                  )}
                </div>

                {/* Val Window */}
                <div 
                  className="bg-amber-500 h-full flex items-center justify-center transition-all duration-300"
                  style={{ width: `${(audit.valWindow.count / audit.totalSteps) * 100}%` }}
                  title={`Val: Steps ${audit.valWindow.startStep}–${audit.valWindow.endStep}`}
                >
                  <span className="truncate px-1">Val ({Math.round((audit.valWindow.count / audit.totalSteps) * 100)}%)</span>
                </div>

                {/* Test Window */}
                <div 
                  className="bg-emerald-600 h-full flex items-center justify-center transition-all duration-300"
                  style={{ width: `${(audit.testWindow.count / audit.totalSteps) * 100}%` }}
                  title={`Test: Steps ${audit.testWindow.startStep}–${audit.testWindow.endStep}`}
                >
                  <span className="truncate px-1">Test ({Math.round((audit.testWindow.count / audit.totalSteps) * 100)}%)</span>
                </div>
              </div>

              {/* Time slice specifications table */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-cyan-800 font-bold mb-0.5">1. Training Slice</div>
                  <div className="text-[11px] text-slate-500">{audit.trainWindow.start.slice(5, 16)}</div>
                  <div className="text-[11px] text-slate-500">to {audit.trainWindow.end.slice(5, 16)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{audit.trainWindow.count} timesteps</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-amber-800 font-bold mb-0.5">2. Validation Slice</div>
                  <div className="text-[11px] text-slate-500">{audit.valWindow.start.slice(5, 16)}</div>
                  <div className="text-[11px] text-slate-500">to {audit.valWindow.end.slice(5, 16)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{audit.valWindow.count} timesteps</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-emerald-800 font-bold mb-0.5">3. Test Slice (Day 7)</div>
                  <div className="text-[11px] text-slate-500">{audit.testWindow.start.slice(5, 16)}</div>
                  <div className="text-[11px] text-slate-500">to {audit.testWindow.end.slice(5, 16)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{audit.testWindow.count} timesteps</div>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Controls: Test & Demonstrate Audit Failure */}
            {onUpdateConfig && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Simulate & Test Audit Behavior:
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Verify badge response</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleSimulation('chronological')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      !audit.hasLeakage && audit.splitStrategy === 'chronological'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>Strict Chronological</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-normal text-slate-500">
                      Standard PS-003 (70/15/15) Zero Overlap
                    </p>
                  </button>

                  <button
                    onClick={() => handleToggleSimulation('overlapping')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      audit.hasLeakage && audit.splitStrategy === 'overlapping'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>Simulate Overlap</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <p className="text-[10px] font-normal text-slate-500">
                      4.0h Overlap between Train & Val
                    </p>
                  </button>

                  <button
                    onClick={() => handleToggleSimulation('random-shuffled')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      audit.hasLeakage && audit.splitStrategy === 'random-shuffled'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>Random Shuffling</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <p className="text-[10px] font-normal text-slate-500">
                      Temporal lookahead bias across all sensors
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Close footer */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
