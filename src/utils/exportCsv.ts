/**
 * Offline Analysis CSV Export Utility for AIORI METR-LA Federated Suite
 * Follows RFC 4180 standard with UTF-8 BOM for full compatibility with
 * Excel, Python pandas, R, and Google Sheets.
 */

import { RoundMetrics, ModelStats, QuantizationType } from '../types/federated';
import { calculateCommunicationCosts } from '../services/trafficDataService';

/**
 * Initiates browser download of a CSV file with UTF-8 BOM
 */
export const downloadCsvFile = (filename: string, csvContent: string): void => {
  // Prepend UTF-8 BOM (\uFEFF) to ensure correct character encoding in Excel & Calc
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Exports convergence progression across global training rounds
 */
export const exportConvergenceMetricsCsv = (
  history: RoundMetrics[],
  unit: string = 'km/h',
  datasetName: string = 'METR-LA'
): void => {
  if (!history || history.length === 0) return;

  const lines: string[] = [];

  // Metadata comments for academic reproducibility
  lines.push(`# AIORI PS-003 Research Suite - Convergence Trajectory Metrics`);
  lines.push(`# Dataset: ${datasetName} (Los Angeles Highway Traffic Sensors, 207 Loop Detectors)`);
  lines.push(`# Metric Unit: ${unit}`);
  lines.push(`# Recorded Rounds: ${history.length}`);
  lines.push(`# Export Timestamp: ${new Date().toISOString()}`);
  lines.push('');

  // CSV Columns Header
  const headers = [
    'Round',
    `Global_MAE_${unit.replace('/', '_')}`,
    `Global_RMSE_${unit.replace('/', '_')}`,
    'Global_Loss_MSE',
    `Oracle_Centralised_MAE_${unit.replace('/', '_')}`,
    `Isolated_Local_MAE_${unit.replace('/', '_')}`,
    `Oracle_Gap_${unit.replace('/', '_')}`,
    'Avg_Client_Drift_L2',
    'Round_Uplink_Bytes',
    'Round_Downlink_Bytes',
    'Round_Total_KB',
    'Cumulative_Comm_MB',
    'Timestamp_ISO'
  ];
  lines.push(headers.join(','));

  // Data rows
  history.forEach((h) => {
    const roundTotalKB = ((h.roundTotalBytes || 0) / 1024).toFixed(2);
    const cumulativeMB = ((h.cumulativeBytes || 0) / (1024 * 1024)).toFixed(2);
    const gap = (h.globalMAE - h.centralisedMAE).toFixed(3);
    const isoDate = new Date(h.timestamp || Date.now()).toISOString();

    const row = [
      h.round,
      h.globalMAE.toFixed(3),
      h.globalRMSE.toFixed(3),
      h.globalLoss.toFixed(4),
      h.centralisedMAE.toFixed(3),
      h.localOnlyMAE.toFixed(3),
      gap,
      h.avgClientDrift.toFixed(5),
      h.roundUplinkBytes || 0,
      h.roundDownlinkBytes || 0,
      roundTotalKB,
      cumulativeMB,
      `"${isoDate}"`
    ];
    lines.push(row.join(','));
  });

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `aiori_metr_la_convergence_rounds_${history.length}_${timestampStr}.csv`;
  downloadCsvFile(filename, lines.join('\r\n'));
};

export interface CommunicationExportOptions {
  latestMetrics: RoundMetrics | null;
  modelStats: ModelStats;
  clientCount: number;
  quantization: QuantizationType;
  totalRounds: number;
  history?: RoundMetrics[];
}

/**
 * Exports communication cost accounting, byte telemetry budget, and cellular operational costs
 */
export const exportCommunicationCostCsv = (options: CommunicationExportOptions): void => {
  const { latestMetrics, modelStats, clientCount, quantization, totalRounds, history } = options;
  const comm = calculateCommunicationCosts(modelStats.parameterCount, quantization, clientCount);

  const currentRound = latestMetrics?.round || (history && history.length > 0 ? history[history.length - 1].round : 0);
  const cumulativeBytes = latestMetrics?.cumulativeBytes || (history && history.length > 0 ? history[history.length - 1].cumulativeBytes : 0);
  const cumulativeMB = Math.round((cumulativeBytes / (1024 * 1024)) * 100) / 100;
  const projectedTotalMB = Math.round(((comm.totalRoundBytes * totalRounds) / (1024 * 1024)) * 100) / 100;

  const inrCostPerGB = 18.5; // ~₹18.5 per GB for enterprise IoT pool
  const usdCostPerGB = 0.22;
  const currentGB = cumulativeMB / 1024;
  const inrTotal = (currentGB * inrCostPerGB).toFixed(3);
  const usdTotal = (currentGB * usdCostPerGB).toFixed(4);

  const initialMAE = 16.0;
  const currentMAE = latestMetrics?.globalMAE || (history && history.length > 0 ? history[history.length - 1].globalMAE : initialMAE);
  const maeImprovement = Math.max(0, initialMAE - currentMAE);
  const accuracyPerMB = cumulativeMB > 0 ? (maeImprovement / cumulativeMB).toFixed(3) : '0.000';

  const lines: string[] = [];

  // Metadata comments
  lines.push('# AIORI PS-003 Research Suite - Federated Communication Cost & Byte Accounting');
  lines.push('# Dataset: METR-LA (Los Angeles Highway Traffic, 207 Loop Detectors)');
  lines.push(`# Model Architecture: ${modelStats.name} (${modelStats.parameterCount.toLocaleString()} parameters)`);
  lines.push(`# Quantization Scheme: ${quantization.toUpperCase()}`);
  lines.push(`# Client RSU Nodes: ${clientCount}`);
  lines.push(`# Export Timestamp: ${new Date().toISOString()}`);
  lines.push('');

  // SECTION 1: Key Telemetry Summary
  lines.push('--- SECTION 1: TELEMETRY & BYTE ACCOUNTING SUMMARY ---');
  lines.push('Metric_Key,Value,Unit,Description');
  lines.push(`Model_Architecture,"${modelStats.name}",architecture,"Internal neural architecture"`);
  lines.push(`Total_Model_Parameters,${modelStats.parameterCount},weights,"Trainable weights and biases"`);
  lines.push(`Base_Model_FP32_Size_KB,${modelStats.baseSizeKb},KB,"Uncompressed FP32 model checkpoint size"`);
  lines.push(`Quantization_Scheme,"${quantization.toUpperCase()}",encoding,"Communication compression format"`);
  lines.push(`Active_Client_RSUs,${clientCount},nodes,"Participating edge roadside sensor stations"`);
  lines.push(`Downlink_Per_Round_KB,${(comm.downlinkBytesPerRound / 1024).toFixed(2)},KB,"Server broadcast w_t size per round"`);
  lines.push(`Uplink_Per_Round_KB,${(comm.uplinkBytesPerRound / 1024).toFixed(2)},KB,"Aggregated client delta uploads per round"`);
  lines.push(`Total_Per_Round_KB,${(comm.totalRoundBytes / 1024).toFixed(2)},KB,"Combined round telemetry bandwidth"`);
  lines.push(`Current_Evaluated_Round,${currentRound},round,"Latest simulation round"`);
  lines.push(`Cumulative_Transferred_MB,${cumulativeMB},MB,"Total payload transferred through current round"`);
  lines.push(`Projected_Total_MB_at_${totalRounds}_Rounds,${projectedTotalMB},MB,"Estimated full convergence network volume"`);
  lines.push(`Communication_ROI_Accuracy_Gain,${accuracyPerMB},delta_MAE_per_MB,"Forecast accuracy gained per MB transmitted"`);
  lines.push(`Cellular_Tariff_INR_Est,₹${inrTotal},INR,"Enterprise IoT SIM pool expense @ ₹18.5/GB"`);
  lines.push(`Cellular_Tariff_USD_Est,$${usdTotal},USD,"Enterprise IoT SIM pool expense @ $0.22/GB"`);
  lines.push('');

  // SECTION 2: Quantization Comparison Matrix for Active Architecture
  lines.push('--- SECTION 2: QUANTIZATION EFFICIENCY COMPARISON MATRIX ---');
  lines.push('Quantization_Type,Bytes_Per_Weight,Model_Size_KB,Total_Round_KB,Projected_Total_MB,Bandwidth_Savings_Pct,Edge_Deployment_Scenario');
  
  const schemes: QuantizationType[] = ['fp32', 'fp16', 'int8', 'topk-sparse'];
  schemes.forEach((q) => {
    const qComm = calculateCommunicationCosts(modelStats.parameterCount, q, clientCount);
    const qTotalMB = ((qComm.totalRoundBytes * totalRounds) / (1024 * 1024)).toFixed(2);
    const fp32Total = (modelStats.baseSizeKb * (clientCount + 1) * totalRounds) / 1024;
    const savings = q === 'fp32' ? 0 : Math.round((1 - parseFloat(qTotalMB) / fp32Total) * 100);
    const scenario = 
      q === 'fp32' ? 'High-speed fiber/Wi-Fi testbed' :
      q === 'fp16' ? 'Standard 4G/LTE highway telemetry' :
      q === 'int8' ? 'Bandwidth-constrained cellular IoT' :
      'Rural/solar edge nodes with sporadic uplink';

    lines.push([
      q.toUpperCase(),
      q === 'fp32' ? 4 : q === 'fp16' ? 2 : q === 'int8' ? 1 : 0.6,
      (qComm.downlinkBytesPerRound / 1024).toFixed(1),
      (qComm.totalRoundBytes / 1024).toFixed(1),
      qTotalMB,
      `${savings}%`,
      `"${scenario}"`
    ].join(','));
  });
  lines.push('');

  // SECTION 3: Detailed Round Progression (if history available)
  if (history && history.length > 0) {
    lines.push('--- SECTION 3: ROUND-BY-ROUND TELEMETRY AUDIT ---');
    lines.push('Round,Round_Uplink_Bytes,Round_Downlink_Bytes,Round_Total_KB,Cumulative_Comm_MB,Global_MAE,Timestamp_ISO');
    history.forEach((h) => {
      const rTotalKB = ((h.roundTotalBytes || comm.totalRoundBytes) / 1024).toFixed(2);
      const cMB = ((h.cumulativeBytes || 0) / (1024 * 1024)).toFixed(2);
      const iso = new Date(h.timestamp || Date.now()).toISOString();
      lines.push([
        h.round,
        h.roundUplinkBytes || comm.uplinkBytesPerRound,
        h.roundDownlinkBytes || comm.downlinkBytesPerRound,
        rTotalKB,
        cMB,
        h.globalMAE.toFixed(3),
        `"${iso}"`
      ].join(','));
    });
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `aiori_metr_la_communication_costs_${quantization}_${timestampStr}.csv`;
  downloadCsvFile(filename, lines.join('\r\n'));
};
