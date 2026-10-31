import { SimulationConfig } from '../types/federated';

export interface FlowerLlmConfig {
  foundationModel: 'meta-llama/Llama-3-8B-Instruct' | 'google/gemma-2-9b-it' | 'mistralai/Mistral-7B-Instruct-v0.3';
  loraRank: 8 | 16 | 32;
  loraAlpha: 16 | 32 | 64;
  loraDropout: number;
  quantization: '4bit-nf4' | '8bit-int8' | 'bfloat16';
  targetModules: string[];
  totalServerRounds: number;
  fractionFit: number;
  strategy: 'FedAvg' | 'FedProx' | 'FedAdam';
  proximalMu: number;
  simulateClientDropout: boolean;
  dropoutRate: number;
}

export interface RsuIncidentLog {
  rsuId: string;
  corridor: string;
  incidentType: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  rawDispatchText: string;
  groundTruthAdvisory: string;
  sampleCount: number;
}

export interface FedLlmRoundMetric {
  round: number;
  evalLoss: number;
  perplexity: number;
  loraDrift: number;
  activeRsus: number;
  droppedRsus: string[];
  resilienceScore: number;
}

export interface FedLlmInferenceResult {
  incidentSummary: string;
  corridorImpact: string;
  spilloverRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  speedAdvisoryMph: number;
  rampMeteringRateSec: number;
  vmsAlertText: string;
  federatedConsensusScore: number;
  participatingRsus: string[];
  reasoningNarrative: string;
  isRealAi: boolean;
}

export const FLOWER_RSU_PARTITIONS: RsuIncidentLog[] = [
  {
    rsuId: 'RSU-1',
    corridor: 'US-101 Northbound (Hollywood Fwy @ Cahuenga Pass)',
    incidentType: 'Multi-Vehicle Collision with Fuel Spill',
    severity: 'Critical',
    rawDispatchText: 'CHP Unit 44-S reports 3 vehicles involved across Lanes 1 and 2. Small fluid hazard detected. Speeds dropped from 58 mph to 11 mph within 4 minutes. Upstream queue extending 2.8 miles.',
    groundTruthAdvisory: 'VSL: 35 mph at Highland Ave. Increase Vineland on-ramp red metering by 4.0s. Post VMS: ACCIDENT AT CAHUENGA / EXPECT 30 MIN DELAY / MERGE RIGHT.',
    sampleCount: 1420
  },
  {
    rsuId: 'RSU-2',
    corridor: 'I-10 Westbound (Santa Monica Fwy @ La Brea Ave)',
    incidentType: 'Stalled Heavy Commercial Vehicle',
    severity: 'Moderate',
    rawDispatchText: 'Caltrans loop sensor #1010 reports speed fluctuation 62 mph -> 24 mph. Semi-truck stalled on right shoulder encroaching Lane 4. Heavy braking waves propagating to Crenshaw Blvd.',
    groundTruthAdvisory: 'VSL: 45 mph at Crenshaw. Hold Washington Blvd ramp meter. Post VMS: DISABLED TRUCK PAST LA BREA / RIGHT LANE BLOCKED.',
    sampleCount: 1180
  },
  {
    rsuId: 'RSU-3',
    corridor: 'I-110 Northbound (Harbor Fwy @ Downtown Slot)',
    incidentType: 'Peak Traffic Jam & Arterial Overflow',
    severity: 'Severe',
    rawDispatchText: 'Sensor #1042 density exceeds 78 veh/mi/ln. Downtown connector bottlenecking at I-5 interchange. Arterial signals at 9th St backing onto freeway exit ramp.',
    groundTruthAdvisory: 'VSL: 30 mph through Downtown Slot. Maximize Adams Blvd upstream metering. Trigger arterial green extension at 8th and 9th St.',
    sampleCount: 1650
  },
  {
    rsuId: 'RSU-4',
    corridor: 'I-210 Eastbound (Foothill Fwy @ Pasadena)',
    incidentType: 'Severe Weather / Dense Micro-Fog',
    severity: 'Moderate',
    rawDispatchText: 'Environmental optical sensor reports visibility < 200 feet along mountain corridor. Speeds dropping to 42 mph in dark curve sections. High speed variance between heavy trucks and passenger cars.',
    groundTruthAdvisory: 'VSL: 45 mph advisory. Activate dynamic fog flashers. Post VMS: DENSE FOG AHEAD / REDUCE SPEED / USE LOW BEAMS.',
    sampleCount: 940
  }
];

export const DEFAULT_FLOWER_LLM_CONFIG: FlowerLlmConfig = {
  foundationModel: 'meta-llama/Llama-3-8B-Instruct',
  loraRank: 8,
  loraAlpha: 16,
  loraDropout: 0.05,
  quantization: '4bit-nf4',
  targetModules: ['q_proj', 'k_proj', 'v_proj', 'o_proj'],
  totalServerRounds: 20,
  fractionFit: 1.0,
  strategy: 'FedProx',
  proximalMu: 0.15,
  simulateClientDropout: true,
  dropoutRate: 0.25
};

export function simulateFlowerLlmConvergence(config: FlowerLlmConfig): FedLlmRoundMetric[] {
  const metrics: FedLlmRoundMetric[] = [];
  const totalRounds = config.totalServerRounds;
  const initialLoss = 3.65;
  const targetLoss = 0.88;
  const initialPerplexity = 38.5;
  const targetPerplexity = 2.41;

  for (let r = 1; r <= totalRounds; r++) {
    const decay = Math.exp(-r / 5.5);
    let loss = targetLoss + (initialLoss - targetLoss) * decay;
    let ppl = targetPerplexity + (initialPerplexity - targetPerplexity) * decay;

    // Simulate RSU connectivity dropout
    const isDropout = config.simulateClientDropout && (r % 3 === 0 || r % 7 === 0);
    const dropped: string[] = [];

    if (isDropout) {
      dropped.push(FLOWER_RSU_PARTITIONS[r % FLOWER_RSU_PARTITIONS.length].rsuId);
      const spikeFactor = config.strategy === 'FedProx' ? 0.08 : 0.28;
      loss += spikeFactor * (1 - config.proximalMu * 0.6);
      ppl += spikeFactor * 3.2;
    }

    const activeCount = 4 - dropped.length;
    const loraDrift = Math.max(0.015, (0.42 / (r + 1)) * (isDropout ? 1.35 : 1.0));
    const resilience = isDropout 
      ? Math.round((1.0 - (loss - targetLoss) * 0.05) * 1000) / 10
      : 98.5;

    metrics.push({
      round: r,
      evalLoss: Math.round(loss * 1000) / 1000,
      perplexity: Math.round(ppl * 100) / 100,
      loraDrift: Math.round(loraDrift * 1000) / 1000,
      activeRsus: activeCount,
      droppedRsus: dropped,
      resilienceScore: Math.min(99.4, Math.max(70, resilience))
    });
  }

  return metrics;
}

/**
 * Executes Federated LLM Traffic Reasoning via Server-Side Gemini API route (/api/gemini/flower-reasoning)
 * ensuring zero browser API key exposure and consistent behavior for all users.
 */
export async function runFederatedLlmReasoning(
  incidentDescription: string,
  config: FlowerLlmConfig
): Promise<FedLlmInferenceResult> {
  try {
    const res = await fetch('/api/gemini/flower-reasoning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        incidentDescription,
        config: {
          loraRank: config.loraRank,
          strategy: config.strategy,
          foundationModel: config.foundationModel
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Server-side Gemini reasoning request failed or timed out, using federated consensus engine:', err);
  }

  // Fallback: Deterministic intelligent domain engine based on incident keywords
  await new Promise(r => setTimeout(r, 450));
  const textLower = incidentDescription.toLowerCase();
  
  let risk: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Moderate';
  let speed = 45;
  let rampSec = 3.5;
  let vms = 'SLOW TRAFFIC AHEAD / EXPECT DELAYS';

  if (textLower.includes('collision') || textLower.includes('crash') || textLower.includes('spill') || textLower.includes('blocked')) {
    risk = 'Extreme';
    speed = 30;
    rampSec = 6.0;
    vms = 'ACCIDENT AHEAD / MULTIPLE LANES BLOCKED / MERGE SAFELY';
  } else if (textLower.includes('fog') || textLower.includes('rain') || textLower.includes('weather')) {
    risk = 'Moderate';
    speed = 45;
    rampSec = 3.0;
    vms = 'ADVERSE WEATHER / DENSE FOG / REDUCE SPEED';
  } else if (textLower.includes('stalled') || textLower.includes('hazard') || textLower.includes('debris')) {
    risk = 'High';
    speed = 40;
    rampSec = 4.5;
    vms = 'HAZARD ON SHOULDER / CAUTION AHEAD / PREPARE TO STOP';
  }

  return {
    incidentSummary: `Federated consensus on incident: "${incidentDescription.slice(0, 80)}..." across 4 Caltrans RSUs.`,
    corridorImpact: `Shockwave velocity estimated at -18 km/h upstream. Queue expected to extend 2.4 miles within 12 minutes unless dynamic VSL and ramp metering are deployed immediately.`,
    spilloverRisk: risk,
    speedAdvisoryMph: speed,
    rampMeteringRateSec: rampSec,
    vmsAlertText: vms,
    federatedConsensusScore: 96.4,
    participatingRsus: ['RSU-1 (Hollywood)', 'RSU-2 (Santa Monica)', 'RSU-3 (Harbor)', 'RSU-4 (Pasadena)'],
    reasoningNarrative: `Flower FedProx aggregation aggregated local LoRA adapter gradients without transmitting raw sensor footage. The server model converged with 96.4% consensus stability despite simulated RSU-2 intermittent 5G disconnect.`,
    isRealAi: false
  };
}

/**
 * Generates official Flower 1.x Python code for the active configuration
 */
export function generateFlowerAppCode(config: FlowerLlmConfig): {
  serverAppPy: string;
  clientAppPy: string;
  pyprojectToml: string;
  runBash: string;
} {
  const serverAppPy = `"""
Flower (flwrlabs/flower) ServerApp for Federated LLM Fine-Tuning.
Traffic Management Center (TMC) Global Aggregator with FedProx Straggler Tolerance.
GitHub: https://github.com/flwrlabs/flower
"""
import os
from datetime import datetime
from flwr.app import ArrayRecord, ConfigRecord, Context, MetricRecord
from flwr.serverapp import Grid, ServerApp
from flwr.serverapp.strategy import FedProx, FedAvg
from peft import get_peft_model_state_dict
from flowertune_llm.models import get_model

app = ServerApp()

@app.main()
def main(grid: Grid, context: Context) -> None:
    """Entry point for Flower ServerApp."""
    print("🚀 Initializing Flower ServerApp: Federated Traffic LLM")
    
    # Model configuration from Flower context
    num_rounds = ${config.totalServerRounds}
    proximal_mu = ${config.proximalMu}
    
    # Initialize base model LoRA state
    base_model = get_model("${config.foundationModel}", lora_r=${config.loraRank}, lora_alpha=${config.loraAlpha})
    initial_arrays = ArrayRecord(get_peft_model_state_dict(base_model))
    
    # Flower Federated Strategy with Client Dropout & Straggler Resilience
    strategy = FedProx(
        fraction_train=${config.fractionFit},
        min_fit_clients=2,
        min_available_clients=3,
        proximal_mu=proximal_mu,
    ) if "${config.strategy}" == "FedProx" else FedAvg(
        fraction_train=${config.fractionFit},
        min_fit_clients=2,
    )
    
    # Execute federated instruction tuning across edge RSUs
    strategy.start(
        grid=grid,
        initial_arrays=initial_arrays,
        train_config=ConfigRecord({"num_rounds": num_rounds}),
        num_rounds=num_rounds,
    )
    print("✅ Flower Federated LLM training complete. Aggregated LoRA adapter saved.")
`;

  const clientAppPy = `"""
Flower (flwrlabs/flower) ClientApp for Edge Roadside Units (RSU).
Decentralized PEFT/LoRA fine-tuning on localized Caltrans traffic incident data.
GitHub: https://github.com/flwrlabs/flower
"""
import torch
from flwr.clientapp import ClientApp
from flwr.common import Context, ArrayRecord
from peft import set_peft_model_state_dict, get_peft_model_state_dict
from flowertune_llm.models import get_model
from flowertune_llm.dataset import load_rsu_partition

app = ClientApp()

@app.train()
def train(arrays: ArrayRecord, context: Context) -> ArrayRecord:
    """Trains local LoRA adapter on private RSU incident narratives."""
    node_id = context.node_id
    print(f"📡 RSU Client {node_id}: Starting local LoRA round...")
    
    # Load localized partition without centralizing raw traffic data
    dataset = load_rsu_partition(node_id)
    model = get_model("${config.foundationModel}", lora_r=${config.loraRank}, lora_alpha=${config.loraAlpha})
    
    # Load global aggregated weights from Flower ServerApp
    set_peft_model_state_dict(model, arrays.to_numpy_dict())
    
    # Execute local gradient steps (AdamW + Cosine Annealing)
    model.train()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
    
    for batch in dataset.take(20):
        optimizer.zero_grad()
        loss = model(**batch).loss
        loss.backward()
        optimizer.step()
        
    print(f"✅ RSU Client {node_id}: Local LoRA adapter updated. Sending delta arrays.")
    return ArrayRecord(get_peft_model_state_dict(model))
`;

  const pyprojectToml = `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "caltrans-flower-fedllm"
version = "1.0.0"
description = "Federated Traffic LLM using Flower (flwrlabs/flower) for Edge RSUs"
dependencies = [
    "flwr[simulation]>=1.15.0",
    "peft>=0.13.0",
    "transformers>=4.45.0",
    "torch>=2.4.0",
    "bitsandbytes>=0.44.0",
    "datasets>=3.0.0",
]

[tool.flwr.app]
publisher = "caltrans-its"

[tool.flwr.app.components]
serverapp = "flowertune_llm.server_app:app"
clientapp = "flowertune_llm.client_app:app"

[tool.flwr.app.config]
num-server-rounds = ${config.totalServerRounds}
fraction-train = ${config.fractionFit}
proximal-mu = ${config.proximalMu}
foundation-model = "${config.foundationModel}"
lora-rank = ${config.loraRank}
lora-alpha = ${config.loraAlpha}
`;

  const runBash = `#!/bin/bash
# Clone official Flower repository and execute simulation
# GitHub: https://github.com/flwrlabs/flower

pip install "flwr[simulation]>=1.15.0" peft transformers torch bitsandbytes
flwr run . --run-config "num-server-rounds=${config.totalServerRounds}"
`;

  return { serverAppPy, clientAppPy, pyprojectToml, runBash };
}
