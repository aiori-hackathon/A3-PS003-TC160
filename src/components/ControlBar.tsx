import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  FastForward,
  Activity, 
  Wifi, 
  Compass,
  Gauge
} from 'lucide-react';
import { RoundMetrics } from '../types/federated';

interface ControlBarProps {
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
  speed: number;
  currentSeed: number;
  latestMetrics: RoundMetrics | null;
  unit: string;
  onTogglePlay: () => void;
  onStepRound: () => void;
  onFastForward: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeSeed: (seed: number) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  currentRound,
  totalRounds,
  isRunning,
  speed,
  currentSeed,
  latestMetrics,
  unit,
  onTogglePlay,
  onStepRound,
  onFastForward,
  onReset,
  onChangeSpeed,
  onChangeSeed
}) => {
  const [isFading, setIsFading] = React.useState(false);
  const prevMae = React.useRef(latestMetrics?.globalMAE);

  React.useEffect(() => {
    if (latestMetrics && prevMae.current !== undefined && latestMetrics.globalMAE !== prevMae.current) {
      setIsFading(true);
      const timer = setTimeout(() => setIsFading(false), 700);
      prevMae.current = latestMetrics.globalMAE;
      return () => clearTimeout(timer);
    }
    prevMae.current = latestMetrics?.globalMAE;
  }, [latestMetrics?.globalMAE, currentRound]);

  const progressPercent = Math.min(100, Math.round((currentRound / totalRounds) * 100));
  const cumulativeMB = latestMetrics ? Math.round((latestMetrics.cumulativeBytes / (1024 * 1024)) * 100) / 100 : 0;

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Playback Controls & Progress */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isRunning 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentRound === 0 ? 'Start FedAvg' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              onClick={onStepRound}
              disabled={isRunning || currentRound >= totalRounds}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Step Single Round"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={onFastForward}
              disabled={isRunning || currentRound >= totalRounds}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Fast Forward to Round 50"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-white cursor-pointer transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold px-2 uppercase tracking-wider">Speed</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-white text-cyan-800 border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Seed Selector (C8 Constraint) */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold px-2 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-600" />
              Seed
            </span>
            {[42, 101, 777].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSeed(s)}
                disabled={isRunning}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  currentSeed === s
                    ? 'bg-white text-indigo-800 border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                #{s}
              </button>
            ))}
          </div>

          {/* Round Indicator & Progress Bar */}
          <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-slate-600">
              Round <strong className="text-cyan-800 font-bold">{currentRound}</strong> / {totalRounds}
            </span>
            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">{progressPercent}%</span>
          </div>
        </div>

        {/* Live Key Performance Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Current FedAvg MAE */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-2xs transition-colors duration-700 ease-out ${
            isFading
              ? 'bg-cyan-100 border-cyan-400 text-cyan-950'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs text-slate-500 font-medium">Global MAE:</span>
            <span className="font-mono text-xs font-bold text-slate-900">
              {latestMetrics ? latestMetrics.globalMAE.toFixed(2) : '--'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{unit}</span>
          </div>

          {/* Centralised Oracle Gap */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Oracle Gap:</span>
            <span className="font-mono text-xs font-bold text-emerald-700">
              {latestMetrics ? `+${(latestMetrics.globalMAE - latestMetrics.centralisedMAE).toFixed(2)}` : '--'}
            </span>
          </div>

          {/* Client Drift Index */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs text-slate-500 font-medium">Drift ||Δw||:</span>
            <span className="font-mono text-xs font-bold text-amber-700">
              {latestMetrics ? latestMetrics.avgClientDrift.toFixed(3) : '--'}
            </span>
          </div>

          {/* Cumulative Comm Bytes */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Wifi className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs text-slate-500 font-medium">Total Comm:</span>
            <span className="font-mono text-xs font-bold text-indigo-800">
              {cumulativeMB} MB
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
