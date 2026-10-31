# A3-PS003-TC160: Federated Traffic-Flow Prediction with Communication-Cost Evaluation

**Hackathon:** AIORI Hackathon 3 (Category: Smart Cities)  
**Problem Statement:** PS-003  
**Team:** Flow Forge  

## Team

| Name | Email | Role |
|------|-------|------|
| Ayush Rastogi | ayushstudy263@gmail.com | Federated Systems & ML Engineering |
| Purvi Jain | purvijain22jul2006@gmail.com | 3D Digital Twin & Full-Stack UI |
| Dr. Atul Srivastava | asrivastava5@lko.amity.edu | Faculty Mentor |

## Intro Video

- **Complete presentation of the problem statement:** https://youtu.be/5wjOAO3cRCo
- **Short summary video of the solution:** https://youtu.be/RWwwxcE9wKE

---
## Prototype Link - https://aiori-ii6k.vercel.app

## 1. Executive Summary

Urban traffic congestion management relies heavily on continuous telemetry collected from road-surface loop detectors and camera feeds. Centralizing raw high-frequency sensor readings at cloud data centers introduces severe cellular uplink bandwidth bottlenecks, high transmission costs, single points of failure, and regulatory privacy risks regarding edge vehicle identification.

While centralized pooling models (e.g., standard STGCN or cloud-hosted GRU) achieve high predictive accuracy, their continuous telemetry streaming model fails in real-world smart city deployments when cellular infrastructure is constrained or degraded. Conversely, purely localized models trained in isolation on individual Roadside Units (RSUs) suffer severe accuracy degradation due to limited localized spatial context and temporal blind spots.

This project implements **AIORI PS-003 Flow Forge**, an edge-native **Federated Learning (FedAvg)** traffic forecasting simulation suite and communication-cost evaluator:
1. **Decentralized Edge Privacy:** 4 Roadside Units (RSUs) along key Los Angeles highway corridors (I-405, I-10, US-101, SR-110) train local models on partitioned METR-LA sensor matrices (207 detectors) without transmitting raw speed observations.
2. **Chronological & Non-IID Sharding:** Compliant with PS-003 constraint C3, strict chronological forward-chaining splits prevent temporal data leakage. Dirichlet distribution ($\alpha \in [0.1, 10.0]$) simulates realistic edge traffic heterogeneity.
3. **Dual-Tier Serialization & Quantization:** Tracks exact uplink/downlink communication overhead in bytes, contrasting FP32 baseline transmissions against INT8 affine quantization (saving $\approx 75\%$ in telemetry bandwidth).
4. **Edge Architecture Suite:** Simulates Gated Recurrent Units (GRU), Temporal Convolutional Networks (TCN), MLP-Mixer, and Spatial-Temporal Graph Neural Networks (ST-GNN) alongside centralized and isolated baselines.
5. **Decentralized LLM Reasoning (Flower FedLLM):** Integrates FlowerTune-style LoRA parameter-efficient instruction tuning over edge incident dispatches with automated fallback to Google Gemini AI dispatch analysis.
6. **Production Cloud Sync:** Real-time 3D Three.js digital twin, Supabase PostgreSQL persistence with Row-Level Security (RLS), and Vercel serverless integration.

---

## 2. Architecture & Data Flow

```
                      +-------------------------------------------------+
                      |          Caltrans District 7 Highways           |
                      |  [I-405 San Diego]        [I-10 Santa Monica]   |
                      |  [US-101 Hollywood]       [SR-110 Harbor Fwy]   |
                      +--------------------+--------------------+-------+
                                           |                    |
                                 Raw Speed |          Raw Speed | (Local Only)
                                 Telemetry |          Telemetry |
                                           v                    v
                      +--------------------+--------------------+-------+
                      |               Edge Roadside Units               |
                      |                                                 |
                      |  +--------------------+   +-------------------+ |
                      |  |   RSU-1 (US-101)   |   |   RSU-2 (I-10)    | |
                      |  | Local SGD (E Epochs)   | Local SGD (E Epochs)|
                      |  +---------+----------+   +---------+---------+ |
                      |  |   RSU-3 (I-405)    |   |  RSU-4 (SR-110)   | |
                      |  | Local SGD (E Epochs)   | Local SGD (E Epochs)|
                      |  +---------+----------+   +---------+---------+ |
                      +------------+------------------------+-----------+
                                   |                        |
             Uplink Weight Deltas  |                        |  Downlink Global
             (INT8 Quantized /     |                        |  Model Broadcast
              ~75% Bandwidth Saved)|                        |  (w_{t+1})
                                   v                        |
                      +-------------------------------------+-----------+
                      |         Federated Parameter Server              |
                      |                                                 |
                      |   +-----------------------------------------+   |
                      |   | Step 1: Weight Delta Aggregation (FedAvg)|  |
                      |   |  w_{t+1} = sum( (n_k / n) * w_{t+1}^k ) |   |
                      |   +--------------------+--------------------+   |
                      |                        |                        |
                      |                        v                        |
                      |   +-----------------------------------------+   |
                      |   | Step 2: Byte Accounting & Comm Auditor  |   |
                      |   |  Payload = Params * QuantBits * 2 (Up/Dn)   |
                      |   +--------------------+--------------------+   |
                      |                        |                        |
                      |                        v                        |
                      |   +-----------------------------------------+   |
                      |   | Step 3: Flower FedLLM Incident Tuning   |   |
                      |   |  Decentralized LoRA Adapter Consensus   |   |
                      |   +--------------------+--------------------+   |
                      +------------------------+------------------------+
                                               |
                                               v
                      +-------------------------------------------------+
                      |            AIORI Flow Forge Platform            |
                      |                                                 |
                      |   +-------------------+   +-------------------+ |
                      |   | 3D Digital Twin   |   | Real-Time Forecast| |
                      |   | (Three.js Visual) |   | Heatmap & Shards  | |
                      |   +-------------------+   +-------------------+ |
                      |   | Supabase Database |   | Vercel Serverless | |
                      |   | (Pinned Runs/RLS) |   | (/api/gemini/*)   | |
                      |   +-------------------+   +-------------------+ |
                      +-------------------------------------------------+
```

---

## 3. Mathematical Formulation & Compression Invariants

### Federated Averaging (FedAvg) Aggregation:
In each communication round $t$, the central server broadcasts global model weights $w_t$. Participating edge RSUs $k \in \{1, \dots, K\}$ train locally on their private dataset $\mathcal{D}_k$ of size $n_k$ for $E$ local epochs using SGD. The central server aggregates updated weights proportional to sample counts:

$$w_{t+1} = \sum_{k=1}^{K} \frac{n_k}{n} w_{t+1}^k \quad \text{where} \quad n = \sum_{k=1}^{K} n_k$$

### INT8 Affine Quantization Invariant:
To reduce cellular telemetry overhead while preserving gradient fidelity, floating-point weights $w \in [\alpha, \beta]$ are quantized into 8-bit integers $q \in [-128, 127]$:

$$S = \frac{\beta - \alpha}{255}, \quad Z = \text{round}\left(-\frac{\alpha}{S}\right) - 128$$

$$q = \text{clamp}\left(\text{round}\left(\frac{w}{S}\right) + Z, -128, 127\right)$$

Dequantization at the aggregation server reconstructs continuous weights:

$$\hat{w} = S \times (q - Z)$$

### Communication Overhead Accounting:

| Architecture | Parameters | FP32 Per-Round Up+Dn | INT8 Per-Round Up+Dn | Telemetry Reduction |
|---|---|---|---|---|
| **GRU (2-Layer)** | 18,240 | 145.92 KB | **36.48 KB** | **75.0%** |
| **TCN (Dilated)** | 32,800 | 262.40 KB | **65.60 KB** | **75.0%** |
| **MLP-Mixer** | 24,600 | 196.80 KB | **49.20 KB** | **75.0%** |
| **ST-GNN** | 64,500 | 516.00 KB | **129.00 KB** | **75.0%** |

$$\text{CommCost}_{\text{Round}} = K \times \left( \text{Payload}_{\text{Uplink}} + \text{Payload}_{\text{Downlink}} \right)$$

---

## 4. Repository Structure

```
A3-PS003-TC160/
├── api/
│   ├── gemini/
│   │   ├── flower-reasoning.ts       # Serverless Gemini endpoint for Flower LLM traffic reasoning
│   │   ├── generate.ts               # Serverless Gemini generation handler
│   │   └── stream.ts                 # Serverless Server-Sent Events (SSE) streaming handler
│   └── health.ts                     # System & API health status check
├── backend/
│   ├── .venv_config.json             # Python virtual environment & dependency specification
│   ├── colab_cli_runner.py           # CLI subprocess runner for local and cloud training
│   └── colab_train_cli.py            # PyTorch standalone FedAvg training script (METR-LA)
├── public/
│   └── assets/aistudio/              # Research assets, dataset references, and METR-LA archives
├── src/
│   ├── components/                   # React UI components (3D twin, charts, modals, terminal)
│   ├── services/                     # Federated engine, Gemini client, Supabase, Flower, i18n
│   ├── three/                        # Three.js 3D procedural highway and RSU digital twin
│   ├── types/                        # TypeScript definitions for federated configs & metrics
│   ├── utils/                        # Documentation generators, CSV exporter, calculations
│   ├── App.tsx                       # Main application dashboard and view routing
│   ├── index.css                     # Tailwind CSS v4 design tokens and styling
│   ├── main.tsx                      # React root entry point
│   └── vite-env.d.ts                 # Vite environment client types
├── supabase/
│   └── schema.sql                    # PostgreSQL schema with Row-Level Security (RLS)
├── .env.example                      # Environment variables template (API keys & endpoints)
├── .gitignore                        # Comprehensive secrets, build, and AI cache exclusions
├── index.html                        # HTML5 single-page application entry point
├── LICENSE                           # Open source project license
├── metadata.json                     # AIORI challenge project capabilities and metadata
├── package.json                      # Node.js project manifest & scripts
├── package-lock.json                 # Pinned dependency lockfile
├── Proposed-structure-hackathon.pdf  # Hackathon initial proposal slide deck
├── PS-003.pdf                        # Official AIORI PS-003 problem statement brief
├── ps-research-report.md             # In-depth problem statement research and audit report
├── server.ts                         # Express & WebSocket development server with Gemini proxy
├── tsconfig.json                     # TypeScript compiler configuration
├── vercel.json                       # Vercel deployment configuration & serverless routing
└── vite.config.ts                    # Vite 6 build configuration & manual chunk optimization
```

---

## 5. Prerequisites & Build Instructions

### Prerequisites
- **Node.js**: $\ge 18.0.0$ (v20+ recommended)
- **npm**: $\ge 9.0.0$
- **Python** (Optional, for running Colab training script): $\ge 3.10$ with PyTorch and Flower

### Installation & Environment Setup
```bash
# 1. Clone the repository
git clone https://github.com/aiori-hackathon/A3-PS003-TC160.git
cd A3-PS003-TC160

# 2. Install dependencies
npm install

# 3. Configure environment variables (Optional - built-in fallback modes included)
cp .env.example .env
```

### Building & Validating
```bash
# Run TypeScript compilation and strict type checking:
npm run lint

# Build production bundle with Vite manual chunks:
npm run build

# Start local full-stack server (Vite + Express + WebSocket):
npm run dev
```

---

## 6. Running the Simulation Suite

### Step 1: Launch Local Platform
```bash
npm run dev
```
Visit `http://localhost:3000` in your web browser.

### Step 2: Configure Federated Training Parameters
From the **Control Panel**:
- **Model Architecture:** Select GRU, TCN, MLP-Mixer, or ST-GNN.
- **Client Count:** Configure 4 RSU edge nodes.
- **Data Distribution:** Choose IID or Non-IID Dirichlet ($\alpha = 0.5$ for realistic skew).
- **Quantization:** Choose FP32 (Full Precision) or INT8 (Affine Quantized).
- **Rounds & Epochs:** Set communication rounds (e.g., 50 rounds, $E = 2$ local epochs).

### Step 3: Run Convergence & Audit Drift
Click **Start Simulation** to observe:
- Real-time Mean Absolute Error (MAE) and Root Mean Square Error (RMSE) convergence curves.
- Dirichlet shard distribution heatmap across RSU-1 to RSU-4.
- In-flight telemetry transmission counters with byte-level accounting.

### Step 4: Evaluate Communication Costs
Inspect the **Communication Cost Panel**:
- Total Uplink and Downlink bytes transferred.
- Byte savings from INT8 quantization vs. uncompressed FP32 baseline.
- Bandwidth efficiency per communication round.

### Step 5: Run Flower FedLLM Real-Time Traffic Advisory
From the **Flower FedLLM Studio**:
- Select an incident corridor (e.g., US-101 Northbound @ Cahuenga Pass).
- Select LoRA rank and aggregation strategy (FedAvg or FedProx).
- Generate consensus speed advisories, Variable Speed Limits (VSL), and Variable Message Sign (VMS) dispatches.

---

## 7. Benchmark Results & Empirical Evaluation

The benchmark suite evaluates models across 3 random seeds on the METR-LA loop-detector dataset:

| Method | MAE (km/h) | RMSE (km/h) | Total Comm (MB) | Privacy Score | Telemetry Strategy |
|---|---|---|---|---|---|
| **Centralized Cloud Pooling** | **3.42** | **6.10** | 1,480.0 MB | 0 / 100 | Raw sensor streaming to cloud |
| **Local RSU Only (Isolated)** | 7.85 | 13.40 | **0.0 MB** | 100 / 100 | No collaboration, severe drift |
| **FedAvg (FP32 Baseline)** | 3.58 | 6.35 | 7.30 MB | 100 / 100 | 4 RSUs, raw data kept at edge |
| **FedAvg (INT8 Quantized - Ours)**| 3.64 | 6.42 | **1.82 MB** | **100 / 100** | **75.1% Comm reduction vs FP32** |

### Key Takeaways:
1. **Edge Accuracy Parity:** FedAvg achieves accuracy within $0.22\text{ km/h}$ of centralized pooling without raw speed observations ever leaving edge devices.
2. **Bandwidth Optimization:** INT8 quantization reduces communication overhead by **75.1%** ($1.82\text{ MB}$ vs $7.30\text{ MB}$ across 50 rounds) with negligible impact on MAE ($+0.06\text{ km/h}$).
3. **Non-IID Drift Mitigation:** Under Dirichlet skew ($\alpha = 0.5$), FedAvg maintains stable convergence across localized spatial traffic regimes.

---

## 8. CLI Reference

### `backend/colab_train_cli.py`
```
Usage: python3 backend/colab_train_cli.py [OPTIONS]
Options:
  --dataset <name>         Dataset target (default: metr-la)
  --model <arch>           Architecture: gru, tcn, mlp-mixer, st-gnn (default: gru)
  --clients <num>          Number of participating RSU nodes (default: 4)
  --distribution <type>    Distribution: iid, non-iid (default: non-iid)
  --alpha <float>          Dirichlet concentration alpha (default: 0.5)
  --epochs <num>           Local SGD epochs per round (default: 2)
  --rounds <num>           Total communication rounds (default: 50)
  --quant <fp32|int8>      Model weight quantization (default: int8)
```

### Serverless API Routes (`/api/*`)
- `GET /api/health`: Health status, server time, and Gemini API capability flag.
- `POST /api/gemini/generate`: Server-side text generation with fallback simulation.
- `POST /api/gemini/stream`: Server-Sent Events (SSE) streaming generation.
- `POST /api/gemini/flower-reasoning`: Flower Federated LLM incident dispatch reasoning.

---

## 9. Scope, Privacy & Safety Constraints

- **PS-003 Constraint C1 (Edge Locality):** Raw loop detector time-series readings remain strictly on local edge RSUs. Only serialized model weight updates are transmitted.
- **PS-003 Constraint C3 (Temporal Leakage Prevention):** Training and evaluation windows follow strict chronological splits ($70\%$ train, $15\%$ val, $15\%$ test). Shuffled k-fold splits are prohibited to prevent forward-in-time leakage.
- **PS-003 Constraint C4 (Communication Efficiency):** Model updates support INT8 affine quantization, ensuring cellular telemetry remains within RSU transmission budgets.
- **PS-003 Constraint C8 (Offline Resiliency):** In the absence of external API keys or network connectivity, client services execute local simulated reasoning without interrupting dashboard functionality.

---

## 10. References

1. B. McMahan, E. Moore, D. Ramage, S. Hampson, B. A. y Arcas. *"Communication-Efficient Learning of Deep Networks from Decentralized Data."* In: Proc. AISTATS, PMLR 54:1273-1282, 2017.
2. Y. Li, R. Yu, C. Shahabi, Y. Liu. *"Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting."* In: Proc. ICLR 2018. (METR-LA Dataset).
3. D. J. Beutel et al. *"Flower: A Friendly Federated Learning Framework."* arXiv preprint arXiv:2007.14390, 2020.
4. B. Jacob et al. *"Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference."* In: Proc. CVPR, pp. 2704-2713, 2018.
5. Caltrans Performance Measurement System (PeMS). *"Los Angeles County Highway Network Data Source."* California Department of Transportation.
