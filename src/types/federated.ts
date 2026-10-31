export type DatasetId = 'metr-la' | 'pems-bay' | 'pems-d4' | 'pune-intersections' | 'bengaluru-orr';

export type ModelArchitecture = 'gru' | 'tcn-cnn' | 'compact-mlp' | 'st-gnn';

export type AggregationAlgorithm = 'fedavg' | 'fedprox' | 'fedcm' | 'scaffold';

export type DistributionType = 'iid' | 'non-iid-dirichlet' | 'non-iid-spatial';

export type QuantizationType = 'fp32' | 'fp16' | 'int8' | 'topk-sparse';

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  location: string;
  sensorsCount: number;
  samplingInterval: string;
  metricUnit: 'km/h' | 'vehicles/5min' | 'flow_index';
  description: string;
  characteristics: string;
  totalTimeSteps: number;
}

export interface ClientNode {
  id: string;
  name: string;
  zoneType: string;
  sensorsAssigned: number[];
  sampleCount: number;
  dataRatio: number;
  localDrift: number; // ||w_k - w||
  currentLocalLoss: number;
  currentLocalMAE: number;
  status: 'idle' | 'downloading' | 'training' | 'uploading' | 'converged';
  uplinkBytesThisRound: number;
  color: string;
}

export interface ModelStats {
  architecture: ModelArchitecture;
  name: string;
  parameterCount: number;
  baseSizeKb: number; // in FP32
  flopsPerInference: string;
  description: string;
}

export interface RoundMetrics {
  round: number;
  globalMAE: number;
  globalRMSE: number;
  globalLoss: number;
  centralisedMAE: number; // Baseline comparator
  localOnlyMAE: number;   // Baseline comparator
  roundUplinkBytes: number;
  roundDownlinkBytes: number;
  roundTotalBytes: number;
  cumulativeBytes: number;
  avgClientDrift: number;
  clientDrifts: { [clientId: string]: number };
  timestamp: number;
  isDropoutRound?: boolean;
  droppedClientIds?: string[];
  activeClientsCount?: number;
  dropoutResilienceScore?: number; // 0-100% resilience stability under client dropout
}

export interface SimulationConfig {
  datasetId: DatasetId;
  clientCount: number; // 3 to 5
  distribution: DistributionType;
  dirichletAlpha: number; // 0.1 to 2.0
  modelArchitecture: ModelArchitecture;
  algorithm: AggregationAlgorithm;
  proximalMu: number; // for FedProx
  localEpochs: number; // E = 1 to 5
  batchSize: number;
  learningRate: number;
  quantization: QuantizationType;
  randomSeed: number; // Seed 42, 101, 777
  totalRounds: number; // e.g. 50
  trainSplitRatio: number; // 0.70
  valSplitRatio: number;   // 0.15
  testSplitRatio: number;  // 0.15
  simulateDropout?: boolean; // Periodic RSU connectivity failure toggle
  dropoutRate?: number;      // Probability / frequency of RSU disconnect
  splitStrategy?: 'chronological' | 'overlapping' | 'random-shuffled';
  simulateLeakageOverlap?: boolean; // User toggle to test data leakage audit
  overlapMinutes?: number; // e.g. 240 min (48 steps of 5-min intervals)
}

export interface DataLeakageAuditResult {
  hasLeakage: boolean;
  severity: 'none' | 'critical' | 'warning';
  splitStrategy: 'chronological' | 'overlapping' | 'random-shuffled';
  totalSteps: number;
  trainWindow: { start: string; end: string; startStep: number; endStep: number; count: number };
  valWindow: { start: string; end: string; startStep: number; endStep: number; count: number };
  testWindow: { start: string; end: string; startStep: number; endStep: number; count: number };
  overlapSteps: number;
  overlapMinutes: number;
  overlapSlice?: { startStep: number; endStep: number; startTime: string; endTime: string };
  reason: string;
  recommendation: string;
}

export interface SeedRunResult {
  seed: number;
  finalMAE: number;
  finalRMSE: number;
  centralisedFinalMAE: number;
  localOnlyFinalMAE: number;
  totalBytesMB: number;
  roundsToTarget: number; // rounds to reach MAE < threshold
  convergenceStability: number; // variance in last 5 rounds
  history: RoundMetrics[];
}

export interface BaselineComparison {
  baselineName: string;
  type: 'centralised' | 'local-only' | 'fedavg-iid' | 'fedavg-non-iid' | 'fedprox-non-iid';
  meanMAE: number;
  stdMAE: number;
  meanRMSE: number;
  stdRMSE: number;
  meanTotalBytesMB: number;
  privacyGuarantee: string;
  communicationAdvantage: string;
}
