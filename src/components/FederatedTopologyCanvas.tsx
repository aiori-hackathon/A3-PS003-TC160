import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Radio, 
  ArrowDownUp, 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  Layers,
  Sparkles,
  Flame,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import { ClientNode, RoundMetrics, ModelStats, DatasetId, DistributionType } from '../types/federated';
import { TrafficDensityHeatmap } from './TrafficDensityHeatmap';

interface FederatedTopologyCanvasProps {
  clients: ClientNode[];
  modelStats: ModelStats;
  currentRound: number;
  isRunning: boolean;
  latestMetrics: RoundMetrics | null;
  unit: string;
  datasetId: DatasetId;
  distribution: DistributionType;
  dirichletAlpha: number;
  seed: number;
}

export const FederatedTopologyCanvas: React.FC<FederatedTopologyCanvasProps> = ({
  clients,
  modelStats,
  currentRound,
  isRunning,
  latestMetrics,
  unit,
  datasetId,
  distribution,
  dirichletAlpha,
  seed
}) => {
  const [viewMode, setViewMode] = useState<'topology' | 'heatmap'>('topology');
  const [selectedClient, setSelectedClient] = useState<ClientNode | null>(null);

  // Position nodes radially around the central server
  const clientCount = clients.length;
  const radius = 140;
  const centerX = 200;
  const centerY = 185;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Header with View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center">
            {viewMode === 'topology' ? (
              <Radio className="w-4 h-4 text-cyan-600" />
            ) : (
              <Flame className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              {viewMode === 'topology' ? 'Edge RSU Topology & Aggregation' : 'Traffic Density Heatmap across Sensor Nodes'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {viewMode === 'topology'
                ? 'Radial parameter server and wireless edge nodes'
                : 'Spatial congestion distribution across client channels'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Stitch Style) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('topology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'topology'
                ? 'bg-white text-cyan-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Topology Graph</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Density Heatmap</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'topology' ? (
        <>
          <div className="relative w-full aspect-[4/3] max-h-[350px] flex items-center justify-center overflow-hidden bg-slate-50/70 rounded-xl border border-slate-200/80">
            <svg viewBox="0 0 400 370" className="w-full h-full select-none">
              <defs>
                <radialGradient id="serverGlowLight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Concentric Radar Rings */}
              <circle cx={centerX} cy={centerY} r={radius * 1.15} fill="none" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r={radius * 0.7} fill="none" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r={80} fill="url(#serverGlowLight)" />

              {/* Connecting Links and Transmission Animation */}
              {clients.map((client, i) => {
                const angle = (i * 2 * Math.PI) / clientCount - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const isDriftHigh = client.localDrift > 0.4;

                return (
                  <g key={client.id} className="cursor-pointer" onClick={() => setSelectedClient(client)}>
                    {/* Link Line */}
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke={isDriftHigh ? '#f59e0b' : '#0284c7'}
                      strokeWidth={isDriftHigh ? '2' : '1.5'}
                      strokeOpacity={isRunning ? '0.9' : '0.4'}
                      strokeDasharray={isRunning ? '5 4' : undefined}
                    />

                    {/* Animated Transmission Packet */}
                    {isRunning && (
                      <circle
                        r="4"
                        fill={currentRound % 2 === 0 ? '#10b981' : '#0284c7'}
                        className="filter drop-shadow-[0_0_4px_rgba(2,132,199,0.8)]"
                      >
                        <animate
                          attributeName="cx"
                          values={currentRound % 2 === 0 ? `${x};${centerX}` : `${centerX};${x}`}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values={currentRound % 2 === 0 ? `${y};${centerY}` : `${centerY};${y}`}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Node Outer Halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r="25"
                      fill="#ffffff"
                      stroke={client.color}
                      strokeWidth={selectedClient?.id === client.id ? '3' : '2'}
                      className="filter drop-shadow-sm transition-all hover:scale-110"
                    />

                    {/* Drift indicator ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r="29"
                      fill="none"
                      stroke={isDriftHigh ? '#f59e0b' : '#10b981'}
                      strokeWidth="1.5"
                      strokeDasharray="2 4"
                      opacity={Math.min(1, client.localDrift * 1.8)}
                    />

                    {/* Node Text Label */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      RSU-{i + 1}
                    </text>

                    {/* Drift Tag */}
                    <rect
                      x={x - 30}
                      y={y + 33}
                      width="60"
                      height="16"
                      rx="4"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={y + 44}
                      textAnchor="middle"
                      fill={isDriftHigh ? '#b45309' : '#047857'}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Δw: {client.localDrift.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Central Parameter Server */}
              <g className="cursor-pointer">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="42"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  className="filter drop-shadow-md"
                />
                <circle cx={centerX} cy={centerY} r="34" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />
                <text
                  x={centerX}
                  y={centerY - 8}
                  textAnchor="middle"
                  fill="#0369a1"
                  fontSize="8.5"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                >
                  FEDAVG SERVER
                </text>
                <text
                  x={centerX}
                  y={centerY + 6}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  w_t (R{currentRound})
                </text>
                <text
                  x={centerX}
                  y={centerY + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {modelStats.parameterCount.toLocaleString()} params
                </text>
              </g>
            </svg>

            {/* Selected Client Popover */}
            {selectedClient && (
              <div className="absolute top-2 right-2 max-w-[220px] bg-white/95 border border-slate-300 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedClient.color }} />
                    {selectedClient.name.split(':')[0]}
                  </span>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="text-slate-700 font-medium truncate">{selectedClient.zoneType}</div>
                  <div className="flex justify-between text-slate-500">
                    <span>Samples:</span>
                    <span className="font-mono text-slate-900 font-medium">{selectedClient.sampleCount} ({selectedClient.dataRatio}%)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Local Drift ||Δw||:</span>
                    <span className={`font-mono font-bold ${selectedClient.localDrift > 0.4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {selectedClient.localDrift.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Local MAE:</span>
                    <span className="font-mono text-cyan-700 font-semibold">
                      {selectedClient.currentLocalMAE.toFixed(2)} {unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sensors:</span>
                    <span className="font-mono text-slate-700">#{selectedClient.sensorsAssigned.slice(0, 3).join(', ')}...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edge RSU Summary Bar */}
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
            {clients.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedClient?.id === c.id
                    ? 'bg-cyan-50/70 border-cyan-500 ring-1 ring-cyan-500/50 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    RSU-{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-1 rounded ${c.localDrift > 0.4 ? 'text-amber-800 bg-amber-100' : 'text-emerald-800 bg-emerald-100'}`}>
                    {c.localDrift.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate font-medium">{c.zoneType}</div>
                <div className="text-[10px] font-mono text-cyan-700 font-semibold mt-0.5">
                  MAE: {c.currentLocalMAE.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Heatmap Mode */
        <div className="min-h-[350px] flex flex-col justify-between">
          <TrafficDensityHeatmap
            clients={clients}
            datasetId={datasetId}
            distribution={distribution}
            dirichletAlpha={dirichletAlpha}
            seed={seed}
            currentMAE={latestMetrics ? latestMetrics.globalMAE : 4.2}
          />
        </div>
      )}
    </div>
  );
};
