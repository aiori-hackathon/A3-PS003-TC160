import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  MapPin, 
  Info, 
  Eye, 
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ClientNode, DatasetId, DistributionType } from '../types/federated';
import { getClientSensorDensityHeatmap, HeatmapCell, DATASETS } from '../services/trafficDataService';

import { DirichletShardDistribution } from './DirichletShardDistribution';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface TrafficDensityHeatmapProps {
  clients: ClientNode[];
  datasetId: DatasetId;
  distribution: DistributionType;
  dirichletAlpha: number;
  seed: number;
  currentMAE: number;
  currentLanguage?: SupportedLanguage;
}

export const TrafficDensityHeatmap: React.FC<TrafficDensityHeatmapProps> = ({
  clients,
  datasetId,
  distribution,
  dirichletAlpha,
  seed,
  currentMAE,
  currentLanguage = 'en'
}) => {
  const [displayMode, setDisplayMode] = useState<'congestion' | 'metric' | 'residual'>('congestion');
  const t = (key: string) => getTranslation(currentLanguage, key);
  const [hoveredCell, setHoveredCell] = useState<{
    clientName: string;
    zone: string;
    sensorId: number;
    cell: HeatmapCell;
  } | null>(null);

  const dataset = DATASETS[datasetId];
  const isSpeed = dataset.metricUnit === 'km/h';

  const { timeSlots, rows } = useMemo(() => {
    return getClientSensorDensityHeatmap(
      clients,
      datasetId,
      distribution,
      dirichletAlpha,
      seed,
      currentMAE
    );
  }, [clients, datasetId, distribution, dirichletAlpha, seed, currentMAE]);

  // Color generator based on metric or congestion
  const getCellBg = (cell: HeatmapCell) => {
    if (displayMode === 'residual') {
      const err = cell.residualError;
      if (err < 1.5) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      if (err < 3.5) return 'bg-amber-50 text-amber-900 border-amber-200';
      return 'bg-rose-100 text-rose-900 border-rose-300 font-semibold';
    }

    const cong = cell.congestionPercent;
    if (cong < 32) return 'bg-emerald-100/80 text-emerald-900 border-emerald-200/90';
    if (cong < 55) return 'bg-amber-100/80 text-amber-900 border-amber-200/90';
    if (cong < 75) return 'bg-orange-200/80 text-orange-950 border-orange-300 font-medium';
    return 'bg-rose-300 text-rose-950 border-rose-400 font-bold';
  };

  const getCellLabel = (cell: HeatmapCell) => {
    if (displayMode === 'residual') return `±${cell.residualError.toFixed(1)}`;
    if (displayMode === 'metric') return Math.round(cell.gtVal).toString();
    return `${cell.congestionPercent}%`;
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Spatial Traffic Density Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        {/* Top Filter Controls */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-1 gap-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-900">Spatial Traffic Density Matrix (Heatmap):</span>
            <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {clients.length} RSUs × 12 Time Slots
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setDisplayMode('congestion')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                displayMode === 'congestion'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Congestion %
            </button>
            <button
              onClick={() => setDisplayMode('metric')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                displayMode === 'metric'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSpeed ? 'Speed (km/h)' : 'Flow (Vehicles)'}
            </button>
            <button
              onClick={() => setDisplayMode('residual')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                displayMode === 'residual'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Residual Error (|y - ŷ|)
            </button>
          </div>
        </div>

        {/* Heatmap Table Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner p-2 my-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-1.5 px-2 min-w-[140px]">
                  Edge RSU & Zone
                </th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="text-[10px] font-mono font-medium text-slate-500 px-1 py-1 min-w-[38px]">
                    {slot}
                  </th>
                ))}
                <th className="text-[11px] font-semibold text-slate-500 py-1.5 px-2 min-w-[70px]">
                  Peak
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.clientId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="text-left py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                          <span>{row.clientName}</span>
                          <span className="text-[10px] font-mono text-slate-400">#S{row.sensorId}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                          {row.zoneType}
                        </div>
                      </div>
                    </div>
                  </td>

                  {row.cells.map((cell) => (
                    <td key={cell.hour} className="p-0.5">
                      <div
                        onMouseEnter={() => setHoveredCell({
                          clientName: row.clientName,
                          zone: row.zoneType,
                          sensorId: row.sensorId,
                          cell
                        })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-7 rounded-md border flex items-center justify-center font-mono text-[10px] cursor-pointer transition-transform hover:scale-110 hover:shadow-md ${getCellBg(cell)}`}
                      >
                        {getCellLabel(cell)}
                      </div>
                    </td>
                  ))}

                  <td className="py-2 px-2 text-right">
                    <div className="font-mono text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-center">
                      {row.peakHour}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Floating Hover Cell Telemetry Inspector */}
        {hoveredCell ? (
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg mt-2 flex flex-wrap items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{hoveredCell.clientName}</span>
              <span className="text-slate-400">({hoveredCell.zone})</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-300">Sensor #{hoveredCell.sensorId} at {hoveredCell.cell.timeLabel}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>Congestion: <strong className="text-amber-400">{hoveredCell.cell.congestionPercent}%</strong></span>
              <span>Ground Truth: <strong className="text-emerald-400">{hoveredCell.cell.gtVal} {dataset.metricUnit}</strong></span>
              <span>FedAvg Forecast: <strong className="text-cyan-300">{hoveredCell.cell.predictedVal}</strong></span>
              <span>Residual: <strong className="text-rose-400">±{hoveredCell.cell.residualError}</strong></span>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Density Scale:</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[10px]">
                &lt;32% Free
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px]">
                32-55% Moderate
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-200 text-orange-950 border border-orange-300 font-mono text-[10px]">
                55-75% Heavy
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-300 text-rose-950 border border-rose-400 font-mono text-[10px] font-bold">
                &gt;75% Gridlock
              </span>
            </div>

            <div className="text-slate-400 font-mono">
              {distribution === 'iid' ? 'IID: Uniform Regional Distributions' : `Non-IID Drift: α=${dirichletAlpha.toFixed(1)} Spatial Skew`}
            </div>
          </div>
        )}
      </div>

      {/* 2. Non-IID Dirichlet Shard & Sensor Volume Bar Chart Distribution Section */}
      <DirichletShardDistribution
        clients={clients}
        distribution={distribution}
        dirichletAlpha={dirichletAlpha}
        totalSensors={dataset.sensorsCount}
      />
    </div>
  );
};

