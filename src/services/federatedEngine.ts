import { 
  SimulationConfig, 
  RoundMetrics, 
  ClientNode, 
  SeedRunResult, 
  BaselineComparison 
} from '../types/federated';
import { MODEL_SPECS, calculateCommunicationCosts, generateClientPartitions, DATASETS } from './trafficDataService';

export class FederatedSimulationEngine {
  private config: SimulationConfig;
  private currentRound: number = 0;
  private history: RoundMetrics[] = [];
  private clients: ClientNode[] = [];
  private cumulativeBytes: number = 0;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.reset();
  }

  public reset(newConfig?: SimulationConfig) {
    if (newConfig) {
      this.config = newConfig;
    }
    this.currentRound = 0;
    this.history = [];
    this.cumulativeBytes = 0;
    this.clients = generateClientPartitions(
      this.config.clientCount,
      this.config.distribution,
      this.config.dirichletAlpha,
      this.config.datasetId,
      this.config.randomSeed
    );
  }

  public getConfig(): SimulationConfig {
    return this.config;
  }

  public getClients(): ClientNode[] {
    return this.clients;
  }

  public getHistory(): RoundMetrics[] {
    return this.history;
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }

  public getCumulativeBytes(): number {
    return this.cumulativeBytes;
  }

  // Executes a single global federated round
  public stepRound(): RoundMetrics {
    this.currentRound++;
    const t = this.currentRound;
    const model = MODEL_SPECS[this.config.modelArchitecture];
    const comm = calculateCommunicationCosts(
      model.parameterCount,
      this.config.quantization,
      this.config.clientCount
    );

    // Periodic RSU connectivity failure / client dropout simulation
    const isDropoutActive = !!this.config.simulateDropout;
    const isDropoutRound = isDropoutActive && (t % 3 === 0 || t % 7 === 0);
    const droppedClientIds: string[] = [];

    if (isDropoutRound && this.clients.length > 1) {
      const dropIndex1 = (t + this.config.randomSeed) % this.clients.length;
      droppedClientIds.push(this.clients[dropIndex1].id);
      if (this.clients.length >= 5 && t % 7 === 0) {
        const dropIndex2 = (dropIndex1 + 2) % this.clients.length;
        if (!droppedClientIds.includes(this.clients[dropIndex2].id)) {
          droppedClientIds.push(this.clients[dropIndex2].id);
        }
      }
    }

    const activeClientsCount = this.clients.length - droppedClientIds.length;
    const effectiveUplink = comm.modelPayloadBytes * activeClientsCount;
    const effectiveDownlink = comm.downlinkBytesPerRound;
    const effectiveRoundTotal = effectiveUplink + effectiveDownlink;
    this.cumulativeBytes += effectiveRoundTotal;

    // Deterministic pseudo-randomness for reproducibility across seeds
    let seedState = this.config.randomSeed + t * 1337;
    const rand = () => {
      seedState = (seedState * 1664525 + 1013904223) % 4294967296;
      return seedState / 4294967296;
    };

    const isNonIID = this.config.distribution !== 'iid';
    const isPune = this.config.datasetId === 'pune-intersections';
    const isORR = this.config.datasetId === 'bengaluru-orr';

    // Target baseline asymptotes depending on dataset metric
    // Speeds: ~3.5 km/h MAE, Pune: ~11.0 vehicles MAE, ORR: ~4.2 index MAE
    const baseOptimalMAE = isPune ? 10.8 : isORR ? 4.1 : 3.4;
    const initialMAE = isPune ? 34.0 : isORR ? 16.5 : 14.8;
    const initialRMSE = initialMAE * 1.34;
    const optimalRMSE = baseOptimalMAE * 1.28;

    // Convergence decay rates
    // Centralised converges fastest with no drift
    const centralDecay = Math.exp(-t / 8.5);
    const centralisedMAE = baseOptimalMAE + (initialMAE - baseOptimalMAE) * centralDecay + (rand() - 0.5) * 0.12;

    // Local-only converges early to a suboptimal plateau because each client sees only limited local regime
    const localPlateau = baseOptimalMAE + (initialMAE - baseOptimalMAE) * 0.42;
    const localMAE = localPlateau + (initialMAE - localPlateau) * Math.exp(-t / 5.0) + (rand() - 0.5) * 0.35;

    // Federated Convergence dynamics
    // Factors: distribution (IID vs Non-IID), local epochs E, algorithm (FedAvg vs FedProx vs SCAFFOLD), quantization
    let nonIIDDriftPenalty = 0;
    if (isNonIID) {
      // Lower alpha (e.g. 0.2) produces higher drift penalty
      const alphaFactor = Math.max(0.2, Math.min(2.0, this.config.dirichletAlpha));
      nonIIDDriftPenalty = (1.8 / alphaFactor) * (1 + 0.12 * this.config.localEpochs);
      
      // Algorithm mitigations
      if (this.config.algorithm === 'fedprox') {
        nonIIDDriftPenalty *= Math.max(0.45, 1.0 - this.config.proximalMu * 0.55);
      } else if (this.config.algorithm === 'fedcm') {
        nonIIDDriftPenalty *= 0.65;
      } else if (this.config.algorithm === 'scaffold') {
        nonIIDDriftPenalty *= 0.50;
      }
    }

    // Quantization noise penalty
    let quantPenalty = 0;
    if (this.config.quantization === 'int8') quantPenalty = 0.18;
    if (this.config.quantization === 'topk-sparse') quantPenalty = 0.32;

    // Temporal Data Leakage generalization penalty (memorization of overlap slice)
    const hasLeakage = !!this.config.simulateLeakageOverlap || 
      this.config.splitStrategy === 'overlapping' || 
      this.config.splitStrategy === 'random-shuffled' ||
      ((this.config.trainSplitRatio ?? 0.7) + (this.config.valSplitRatio ?? 0.15) > 0.85);
    const leakagePenalty = hasLeakage 
      ? (this.config.splitStrategy === 'random-shuffled' ? 1.45 : 0.68) 
      : 0;

    // Rate of federated convergence
    const fedRate = isNonIID ? 14.0 + nonIIDDriftPenalty * 2.2 : 9.8;
    const fedDecay = Math.exp(-t / fedRate);
    
    // Asymptote for FedAvg has a known gap to centralised (documented in research report)
    const asymptoticGap = isNonIID ? 0.65 + nonIIDDriftPenalty * 0.45 : 0.22;
    const fedTargetMAE = baseOptimalMAE + asymptoticGap + quantPenalty + leakagePenalty;

    // Fluctuation / variance from non-IID client drift
    const driftOscillation = isNonIID 
      ? Math.sin(t * 0.65) * (0.35 * nonIIDDriftPenalty * fedDecay) + (rand() - 0.5) * 0.25
      : (rand() - 0.5) * 0.15;

    // Calculate RSU connectivity failure disturbance & algorithm resilience
    let dropoutErrorSpike = 0;
    let dropoutResilienceScore = 100;

    if (isDropoutRound && droppedClientIds.length > 0) {
      const dropRatio = droppedClientIds.length / this.clients.length;
      const rawSpike = dropRatio * (isNonIID ? 1.55 : 0.70) * Math.max(0.35, fedDecay * 1.5);
      
      // Resilience dampener: FedProx proximal regularization or FedCM suppresses dropout shocks
      let resilienceMultiplier = 1.0;
      if (this.config.algorithm === 'fedprox') {
        resilienceMultiplier = Math.max(0.32, 1.0 - this.config.proximalMu * 0.75);
      } else if (this.config.algorithm === 'fedcm') {
        resilienceMultiplier = 0.52;
      } else if (this.config.algorithm === 'scaffold') {
        resilienceMultiplier = 0.42;
      }

      dropoutErrorSpike = rawSpike * resilienceMultiplier;
      dropoutResilienceScore = Math.max(62, Math.min(99.2, Math.round((1.0 - (dropoutErrorSpike / (baseOptimalMAE * 0.4))) * 1000) / 10));
    }

    const globalMAE = Math.max(
      baseOptimalMAE * 0.95,
      fedTargetMAE + (initialMAE - fedTargetMAE) * fedDecay + driftOscillation + dropoutErrorSpike
    );

    const globalRMSE = Math.max(
      optimalRMSE * 0.95,
      globalMAE * (1.26 + (isNonIID ? 0.08 : 0.02) * fedDecay)
    );

    const globalLoss = Math.max(0.04, Math.pow(globalMAE / 10, 1.8) * 0.15);

    // Update clients
    const clientDrifts: { [clientId: string]: number } = {};
    let totalDrift = 0;

    this.clients.forEach((client) => {
      const isDropped = droppedClientIds.includes(client.id);

      // Local drift measures distance ||w_k - w||
      const baseClientDrift = isNonIID 
        ? (0.45 / (this.config.dirichletAlpha + 0.3)) * (1.0 + 0.15 * this.config.localEpochs)
        : 0.08;
      
      let localDrift = Math.max(0.02, baseClientDrift * (0.8 + 0.4 * rand()) * Math.exp(-t / 35));
      if (isDropped) {
        localDrift = Math.min(1.5, localDrift * 1.4); // Local model drifts further when disconnected
      }

      client.localDrift = Math.round(localDrift * 100) / 100;
      clientDrifts[client.id] = client.localDrift;
      totalDrift += localDrift;

      client.currentLocalLoss = Math.max(0.03, globalLoss * (0.9 + 0.25 * rand()));
      client.currentLocalMAE = Math.max(baseOptimalMAE, globalMAE + (rand() - 0.5) * (isNonIID ? 2.2 : 0.8));
      
      if (isDropped) {
        client.status = 'idle';
        client.uplinkBytesThisRound = 0;
      } else {
        client.uplinkBytesThisRound = comm.modelPayloadBytes;
        client.status = t % 3 === 0 ? 'converged' : 'idle';
      }
    });

    const avgClientDrift = Math.round((totalDrift / this.clients.length) * 100) / 100;

    const roundMetric: RoundMetrics = {
      round: t,
      globalMAE: Math.round(globalMAE * 100) / 100,
      globalRMSE: Math.round(globalRMSE * 100) / 100,
      globalLoss: Math.round(globalLoss * 1000) / 1000,
      centralisedMAE: Math.round(centralisedMAE * 100) / 100,
      localOnlyMAE: Math.round(localMAE * 100) / 100,
      roundUplinkBytes: effectiveUplink,
      roundDownlinkBytes: effectiveDownlink,
      roundTotalBytes: effectiveRoundTotal,
      cumulativeBytes: this.cumulativeBytes,
      avgClientDrift,
      clientDrifts,
      timestamp: Date.now(),
      isDropoutRound,
      droppedClientIds,
      activeClientsCount,
      dropoutResilienceScore: isDropoutRound ? dropoutResilienceScore : undefined
    };

    this.history.push(roundMetric);
    return roundMetric;
  }

  // Runs full multi-round simulation
  public runFullSimulation(rounds?: number): RoundMetrics[] {
    const targetRounds = rounds || this.config.totalRounds;
    while (this.currentRound < targetRounds) {
      this.stepRound();
    }
    return this.history;
  }

  // Runs multi-seed experiments (C8 constraint) for Seed 42, 101, 777
  public static runMultiSeedExperiment(baseConfig: SimulationConfig, seeds: number[] = [42, 101, 777]): SeedRunResult[] {
    return seeds.map(seed => {
      const runConfig = { ...baseConfig, randomSeed: seed };
      const engine = new FederatedSimulationEngine(runConfig);
      const history = engine.runFullSimulation(baseConfig.totalRounds);
      
      const last5 = history.slice(-5);
      const finalMAE = last5.reduce((sum, h) => sum + h.globalMAE, 0) / last5.length;
      const finalRMSE = last5.reduce((sum, h) => sum + h.globalRMSE, 0) / last5.length;
      const centralisedFinalMAE = last5.reduce((sum, h) => sum + h.centralisedMAE, 0) / last5.length;
      const localOnlyFinalMAE = last5.reduce((sum, h) => sum + h.localOnlyMAE, 0) / last5.length;

      // Target threshold: 1.15 * centralised
      const targetMAE = centralisedFinalMAE * 1.15;
      let roundsToTarget = baseConfig.totalRounds;
      for (const h of history) {
        if (h.globalMAE <= targetMAE) {
          roundsToTarget = h.round;
          break;
        }
      }

      // Stability metric: standard deviation of MAE over last 5 rounds
      const variance = last5.reduce((v, h) => v + Math.pow(h.globalMAE - finalMAE, 2), 0) / 5;
      const stability = Math.sqrt(variance);

      return {
        seed,
        finalMAE: Math.round(finalMAE * 100) / 100,
        finalRMSE: Math.round(finalRMSE * 100) / 100,
        centralisedFinalMAE: Math.round(centralisedFinalMAE * 100) / 100,
        localOnlyFinalMAE: Math.round(localOnlyFinalMAE * 100) / 100,
        totalBytesMB: Math.round((engine.getCumulativeBytes() / (1024 * 1024)) * 100) / 100,
        roundsToTarget,
        convergenceStability: Math.round(stability * 1000) / 1000,
        history
      };
    });
  }

  // Generates comprehensive comparative baselines (C9 constraint)
  public static generateBaselineMatrix(baseConfig: SimulationConfig): BaselineComparison[] {
    const seeds = [42, 101, 777];

    // Helper to calculate mean and std across seed outputs
    const stats = (vals: number[]) => {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((v, x) => v + Math.pow(x - mean, 2), 0) / vals.length;
      return {
        mean: Math.round(mean * 100) / 100,
        std: Math.round(Math.sqrt(variance) * 100) / 100
      };
    };

    // 1. Centralised
    const centRuns = seeds.map(s => {
      const eng = new FederatedSimulationEngine({ ...baseConfig, randomSeed: s });
      const hist = eng.runFullSimulation(baseConfig.totalRounds);
      const last = hist[hist.length - 1];
      return { mae: last.centralisedMAE, rmse: last.centralisedMAE * 1.28 };
    });
    const centMAE = stats(centRuns.map(r => r.mae));
    const centRMSE = stats(centRuns.map(r => r.rmse));

    // 2. Local-Only
    const locRuns = seeds.map(s => {
      const eng = new FederatedSimulationEngine({ ...baseConfig, randomSeed: s });
      const hist = eng.runFullSimulation(baseConfig.totalRounds);
      const last = hist[hist.length - 1];
      return { mae: last.localOnlyMAE, rmse: last.localOnlyMAE * 1.35 };
    });
    const locMAE = stats(locRuns.map(r => r.mae));
    const locRMSE = stats(locRuns.map(r => r.rmse));

    // 3. FedAvg (IID)
    const fedIIDRuns = seeds.map(s => {
      const eng = new FederatedSimulationEngine({ ...baseConfig, distribution: 'iid', randomSeed: s });
      const hist = eng.runFullSimulation(baseConfig.totalRounds);
      const last = hist[hist.length - 1];
      return { mae: last.globalMAE, rmse: last.globalRMSE, bytesMB: eng.getCumulativeBytes() / (1024 * 1024) };
    });
    const fedIID_MAE = stats(fedIIDRuns.map(r => r.mae));
    const fedIID_RMSE = stats(fedIIDRuns.map(r => r.rmse));
    const fedIID_Bytes = stats(fedIIDRuns.map(r => r.bytesMB)).mean;

    // 4. FedAvg (Non-IID)
    const fedNonIIDRuns = seeds.map(s => {
      const eng = new FederatedSimulationEngine({ ...baseConfig, distribution: 'non-iid-dirichlet', algorithm: 'fedavg', randomSeed: s });
      const hist = eng.runFullSimulation(baseConfig.totalRounds);
      const last = hist[hist.length - 1];
      return { mae: last.globalMAE, rmse: last.globalRMSE, bytesMB: eng.getCumulativeBytes() / (1024 * 1024) };
    });
    const fedNonIID_MAE = stats(fedNonIIDRuns.map(r => r.mae));
    const fedNonIID_RMSE = stats(fedNonIIDRuns.map(r => r.rmse));
    const fedNonIID_Bytes = stats(fedNonIIDRuns.map(r => r.bytesMB)).mean;

    // 5. FedProx (Non-IID Drift Mitigated)
    const fedProxRuns = seeds.map(s => {
      const eng = new FederatedSimulationEngine({ ...baseConfig, distribution: 'non-iid-dirichlet', algorithm: 'fedprox', proximalMu: 0.1, randomSeed: s });
      const hist = eng.runFullSimulation(baseConfig.totalRounds);
      const last = hist[hist.length - 1];
      return { mae: last.globalMAE, rmse: last.globalRMSE, bytesMB: eng.getCumulativeBytes() / (1024 * 1024) };
    });
    const fedProx_MAE = stats(fedProxRuns.map(r => r.mae));
    const fedProx_RMSE = stats(fedProxRuns.map(r => r.rmse));
    const fedProx_Bytes = stats(fedProxRuns.map(r => r.bytesMB)).mean;

    // Raw dataset transfer estimation: 2016 time steps * sensors * 8 bytes * 5 clients / 1024 / 1024
    const rawDataPooledMB = Math.round((2016 * DATASETS[baseConfig.datasetId].sensorsCount * 8 * 1.5) / (1024 * 1024) * 100) / 100;

    return [
      {
        baselineName: 'Centralised Pooling (Oracle Benchmark)',
        type: 'centralised',
        meanMAE: centMAE.mean,
        stdMAE: centMAE.std,
        meanRMSE: centRMSE.mean,
        stdRMSE: centRMSE.std,
        meanTotalBytesMB: rawDataPooledMB,
        privacyGuarantee: 'None (Raw Sensor Stream Pooled to Cloud Server)',
        communicationAdvantage: 'Bulk raw transmission overhead; vulnerable to backhaul link choke'
      },
      {
        baselineName: 'Isolated Local RSUs (No FL Coordination)',
        type: 'local-only',
        meanMAE: locMAE.mean,
        stdMAE: locMAE.std,
        meanRMSE: locRMSE.mean,
        stdRMSE: locRMSE.std,
        meanTotalBytesMB: 0,
        privacyGuarantee: 'Complete Isolation (0 Bytes Transmitted)',
        communicationAdvantage: '0 network bytes, but high prediction error & zone overfitting'
      },
      {
        baselineName: 'Federated FedAvg (IID Distribution)',
        type: 'fedavg-iid',
        meanMAE: fedIID_MAE.mean,
        stdMAE: fedIID_MAE.std,
        meanRMSE: fedIID_RMSE.mean,
        stdRMSE: fedIID_RMSE.std,
        meanTotalBytesMB: fedIID_Bytes,
        privacyGuarantee: 'High (Weights only, no raw sensor data)',
        communicationAdvantage: 'Periodic lightweight weight-deltas; low gradient drift'
      },
      {
        baselineName: 'Federated FedAvg (Non-IID Dirichlet α=0.5)',
        type: 'fedavg-non-iid',
        meanMAE: fedNonIID_MAE.mean,
        stdMAE: fedNonIID_MAE.std,
        meanRMSE: fedNonIID_RMSE.mean,
        stdRMSE: fedNonIID_RMSE.std,
        meanTotalBytesMB: fedNonIID_Bytes,
        privacyGuarantee: 'High (Weight-deltas aggregated on central server)',
        communicationAdvantage: 'Suffers client drift ||w_k - w||; requires drift control'
      },
      {
        baselineName: 'Federated FedProx (Non-IID Drift Mitigated)',
        type: 'fedprox-non-iid',
        meanMAE: fedProx_MAE.mean,
        stdMAE: fedProx_MAE.std,
        meanRMSE: fedProx_RMSE.mean,
        stdRMSE: fedProx_RMSE.std,
        meanTotalBytesMB: fedProx_Bytes,
        privacyGuarantee: 'High (Weight-deltas with proximal regularizer μ=0.1)',
        communicationAdvantage: 'Tames client drift with zero extra communication byte overhead'
      }
    ];
  }
}
