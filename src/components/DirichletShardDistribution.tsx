import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  HelpCircle, 
  Activity, 
  Scale, 
  TrendingDown, 
  Info,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ClientNode, DistributionType } from '../types/federated';

interface DirichletShardDistributionProps {
  clients: ClientNode[];
  distribution: DistributionType;
  dirichletAlpha: number;
  totalSensors?: number;
}

interface ClientShardStat {
  clientId: string;
  clientName: string;
  zoneType: string;
  corridor: string;
  color: string;
  sensorCount: number;
  sensorPercent: number;
  sampleCount: number;
  shardSharePercent: number;
  earthMoversDistance: number; // Client drift EMD from global distribution
  speedRegimes: {
    freeFlow: number;     // > 60 km/h %
    moderate: number;     // 40 - 60 km/h %
    congested: number;    // 25 - 40 km/h %
    severeGridlock: number; // < 25 km/h %
  };
}

export const DirichletShardDistribution: React.FC<DirichletShardDistributionProps> = ({
  clients,
  distribution,
  dirichletAlpha,
  totalSensors = 207
}) => {
  const [viewMetric, setViewMetric] = useState<'shards' | 'regimes' | 'sensors'>('shards');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Compute Dirichlet shard statistics based on alpha and client distribution
  const shardStats: ClientShardStat[] = useMemo(() => {
    const isIID = distribution === 'iid';
    const clientCount = clients.length;
    const totalSamples = 34272; // METR-LA 4 months x 288 steps/day sample volume per sensor

    // Skew multipliers based on Dirichlet concentration alpha (Efthymiadis et al., 2024)
    // alpha -> 0.1: extreme skew; alpha -> 0.5: typical non-IID; alpha -> 10.0: near IID
    const alphaFactor = isIID ? 100 : Math.max(0.1, dirichletAlpha);

    // Calculate synthetic proportions approximating Dirichlet drawing
    let rawWeights = clients.map((_, idx) => {
      if (isIID) return 1.0;
      // Synthesize Dirichlet variance based on alpha
      const offset = (idx * 0.73 + 0.41) % 1.0;
      const skew = Math.pow(offset + 0.2, 1.0 / alphaFactor);
      return skew;
    });

    const sumWeights = rawWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = rawWeights.map(w => w / sumWeights);

    return clients.map((client, idx) => {
      const weight = normalizedWeights[idx];
      const sensorAlloc = isIID 
        ? Math.floor(totalSensors / clientCount) + (idx < totalSensors % clientCount ? 1 : 0)
        : Math.max(12, Math.round(totalSensors * weight));
      
      const sensorPercent = Math.round((sensorAlloc / totalSensors) * 1000) / 10;
      const shardSharePercent = Math.round(weight * 1000) / 10;
      const sampleCount = Math.round((totalSamples * totalSensors * weight) / 100);

      // Quantify Earth Mover's Distance (EMD) client drift ||P_k - P_global||
      const uniformShare = 100 / clientCount;
      const emd = Math.abs(shardSharePercent - uniformShare) * (isIID ? 0.05 : 1.4 / Math.sqrt(alphaFactor));

      // Speed regime distribution per client under spatial heterogeneity
      let freeFlow = 42;
      let moderate = 32;
      let congested = 18;
      let severeGridlock = 8;

      if (!isIID) {
        if (idx === 0) {
          // I-405 West LA: High bottleneck corridor, severe morning gridlock
          freeFlow = Math.max(15, Math.round(30 - 15 / alphaFactor));
          moderate = 26;
          congested = 26;
          severeGridlock = 100 - (freeFlow + moderate + congested);
        } else if (idx === 1) {
          // I-10 Santa Monica: Heavy midday and weekend traffic
          freeFlow = 36;
          moderate = 34;
          congested = 20;
          severeGridlock = 10;
        } else if (idx === 2) {
          // US-101 Hollywood Pass: Evening commuter bottleneck
          freeFlow = Math.max(18, Math.round(28 - 12 / alphaFactor));
          moderate = 28;
          congested = 28;
          severeGridlock = 100 - (freeFlow + moderate + congested);
        } else if (idx === 3) {
          // I-110 Harbor Fwy: Night freight and port transit, high speed off-peak
          freeFlow = Math.min(65, Math.round(48 + 14 / alphaFactor));
          moderate = 28;
          congested = 16;
          severeGridlock = 100 - (freeFlow + moderate + congested);
        } else {
          // I-210 Foothill: Suburban corridor
          freeFlow = 45;
          moderate = 33;
          congested = 16;
          severeGridlock = 6;
        }
      }

      const clientName = client.name.split(':')[0];
      const corridor = idx === 0 ? 'I-405 San Diego Fwy' :
                       idx === 1 ? 'I-10 Santa Monica Fwy' :
                       idx === 2 ? 'US-101 Hollywood Pass' :
                       idx === 3 ? 'I-110 Harbor Transit' : 'I-210 Foothill Fwy';

      return {
        clientId: client.id,
        clientName,
        zoneType: client.zoneType,
        corridor,
        color: client.color,
        sensorCount: sensorAlloc,
        sensorPercent,
        sampleCount,
        shardSharePercent,
        earthMoversDistance: Math.round(emd * 10) / 10,
        speedRegimes: {
          freeFlow,
          moderate,
          congested,
          severeGridlock
        }
      };
    });
  }, [clients, distribution, dirichletAlpha, totalSensors]);

  // Overall Dirichlet skew rating
  const skewRating = useMemo(() => {
    if (distribution === 'iid') return { label: 'IID Uniform (α → ∞)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'No client drift; clients receive identical sample distributions.' };
    if (dirichletAlpha <= 0.2) return { label: 'Extreme Non-IID Skew (α ≤ 0.2)', color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold', desc: 'Severe client drift; local gradients conflict heavily, causing FedAvg weight divergence.' };
    if (dirichletAlpha <= 0.5) return { label: 'Moderate Non-IID Skew (α = 0.5)', color: 'text-amber-800 bg-amber-50 border-amber-300 font-semibold', desc: 'Significant regional imbalance across highway corridors as documented in PS-003.' };
    return { label: `Mild Skew (α = ${dirichletAlpha.toFixed(1)})`, color: 'text-sky-800 bg-sky-50 border-sky-200', desc: 'Controlled spatial heterogeneity across urban and suburban RSUs.' };
  }, [distribution, dirichletAlpha]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Non-IID Dirichlet Shard & Sensor Volume Distribution</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${skewRating.color}`}>
                {skewRating.label}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Partitioning of METR-LA 207 sensors and traffic regimes across simulated RSU edge clients (Efthymiadis et al., 2024)
          </p>
        </div>

        {/* View Metric Mode Switch */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMetric('shards')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewMetric === 'shards'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Shards (%)
          </button>
          <button
            onClick={() => setViewMetric('regimes')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewMetric === 'regimes'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Speed Regimes
          </button>
          <button
            onClick={() => setViewMetric('sensors')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewMetric === 'sensors'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sensor Nodes (#)
          </button>
        </div>
      </div>

      {/* Shard Bar Chart Visualization */}
      <div className="space-y-3.5 pt-1">
        {shardStats.map((stat) => {
          const isSelected = selectedClient === stat.clientId;
          return (
            <div 
              key={stat.clientId}
              onClick={() => setSelectedClient(isSelected ? null : stat.clientId)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-indigo-400 bg-indigo-50/30 shadow-xs' 
                  : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* Row Label Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: stat.color }} />
                  <span className="font-bold text-slate-900">{stat.clientName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{stat.corridor}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({stat.zoneType})</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-600">
                    Sensors: <strong className="text-slate-900">{stat.sensorCount} / {totalSensors}</strong> ({stat.sensorPercent}%)
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-indigo-700 font-bold">
                    Shard Share: {stat.shardSharePercent}%
                  </span>
                  {distribution !== 'iid' && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      EMD Drift: {stat.earthMoversDistance}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar Metric Representation */}
              {viewMetric === 'shards' && (
                <div className="space-y-1">
                  <div className="w-full h-4 bg-slate-200 rounded-lg overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-1.5 text-[9px] font-mono font-bold text-white"
                      style={{ 
                        width: `${Math.max(6, stat.shardSharePercent)}%`,
                        backgroundColor: stat.color 
                      }}
                    >
                      {stat.shardSharePercent >= 10 ? `${stat.shardSharePercent}%` : ''}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20% (IID Baseline for 5 RSUs)</span>
                    <span>30%</span>
                    <span>40%+ (Severe Bottleneck Shard)</span>
                  </div>
                </div>
              )}

              {viewMetric === 'regimes' && (
                <div className="space-y-1">
                  {/* Stacked speed regime distribution bar */}
                  <div className="w-full h-4 bg-slate-200 rounded-lg overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-emerald-500 hover:bg-emerald-600 transition-all text-[9px] font-mono font-bold text-white flex items-center justify-center"
                      style={{ width: `${stat.speedRegimes.freeFlow}%` }}
                      title={`Free-Flow (>60 km/h): ${stat.speedRegimes.freeFlow}%`}
                    >
                      {stat.speedRegimes.freeFlow >= 15 ? `${stat.speedRegimes.freeFlow}%` : ''}
                    </div>
                    <div 
                      className="h-full bg-amber-400 hover:bg-amber-500 transition-all text-[9px] font-mono font-bold text-slate-900 flex items-center justify-center"
                      style={{ width: `${stat.speedRegimes.moderate}%` }}
                      title={`Moderate (40-60 km/h): ${stat.speedRegimes.moderate}%`}
                    >
                      {stat.speedRegimes.moderate >= 15 ? `${stat.speedRegimes.moderate}%` : ''}
                    </div>
                    <div 
                      className="h-full bg-orange-500 hover:bg-orange-600 transition-all text-[9px] font-mono font-bold text-white flex items-center justify-center"
                      style={{ width: `${stat.speedRegimes.congested}%` }}
                      title={`Congested (25-40 km/h): ${stat.speedRegimes.congested}%`}
                    >
                      {stat.speedRegimes.congested >= 12 ? `${stat.speedRegimes.congested}%` : ''}
                    </div>
                    <div 
                      className="h-full bg-rose-600 hover:bg-rose-700 transition-all text-[9px] font-mono font-bold text-white flex items-center justify-center"
                      style={{ width: `${stat.speedRegimes.severeGridlock}%` }}
                      title={`Severe Gridlock (<25 km/h): ${stat.speedRegimes.severeGridlock}%`}
                    >
                      {stat.speedRegimes.severeGridlock >= 8 ? `${stat.speedRegimes.severeGridlock}%` : ''}
                    </div>
                  </div>
                </div>
              )}

              {viewMetric === 'sensors' && (
                <div className="space-y-1">
                  <div className="w-full h-4 bg-slate-200 rounded-lg overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-cyan-600 transition-all duration-500 rounded-lg flex items-center justify-end pr-1.5 text-[9px] font-mono font-bold text-white"
                      style={{ width: `${(stat.sensorCount / (totalSensors * 0.45)) * 100}%` }}
                    >
                      {stat.sensorCount} sensors
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                    <span>0</span>
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80+ sensors allocated</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Regimes Legend & Dirichlet Non-IID Insights */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-semibold text-slate-700">Regime Legend:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Free-Flow (&gt;60 km/h)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Moderate (40–60 km/h)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Congested (25–40 km/h)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Gridlock (&lt;25 km/h)
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Non-IID Earth Mover's Distance EMD = <strong>{distribution === 'iid' ? '0.00 (Uniform)' : `${(1.2 / Math.sqrt(dirichletAlpha)).toFixed(2)} km/h`}</strong></span>
        </div>
      </div>
    </div>
  );
};
