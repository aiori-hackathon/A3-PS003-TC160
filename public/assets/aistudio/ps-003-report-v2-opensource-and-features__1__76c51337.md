# PS-003 Report v2: Open-Source Options, Added Features and Updated Plan
Generated: 30 Oct 2026. Search path: [B] built-in.

Sources [1]–[22] are in `ps-research-report.md`. This file adds [23]–[34]. **Part A is evidence only.** **Part B is the plan**; its choices are labeled (decision) and are not findings.

---

# PART A: Open-Source Evidence

## A1. New sources (all read as search snippets only unless noted; no star counts, licenses or versions were verified)
- [23] Flower: A Friendly Federated Learning Research Framework, arXiv 2007.14390 (preprint, Tier 4, Unreviewed; authors not captured). Built-in strategies include FedAvg (cites McMahan 2017) and a fault-tolerant FedAvg variant; new algorithms are written through a Strategy interface.
- [24] Flower documentation, flower.ai/docs (several versions seen; Tier 4, organizer of the tool = Organizer-authored). Describes `start_simulation`/`run_simulation` with virtual clients, a `FedAvg` strategy with fraction and minimum-client arguments, and a strategy list that includes FedProx, FedAvgM, FedMedian and FedTrimmedAvg. https://flower.ai/docs/framework/1.30/fr/how-to-run-flower-locally.html and the "how to run simulations" page.
- [25] Bigscity LibCity Datasets, GitHub. https://www.github.com/LibCity/Bigscity-LibCity-Datasets. Converted datasets in a unified "atomic file" format with conversion tools, including METR_LA, PEMS_BAY, PEMSD3, PEMSD4 and others. Download links point to BaiduDisk or Google Drive.
- [26] LibCity: A Unified Library Towards Efficient and Comprehensive Urban Spatial-Temporal Prediction, arXiv 2304.14343 (preprint, Unreviewed). Its dataset table lists METR-LA and PEMS-BAY as speed data and PeMSD3, PeMSD4 and PeMSD8 as flow data (the retrieved table text is partly garbled by extraction, so verify when you download).
- [27] LibCity: An Open Library for Traffic Prediction, ACM SIGSPATIAL 2021 (peer-reviewed). 42 reproduced models and 29 datasets; open source at github.com/LibCity/Bigscity-LibCity. https://paperswithcode.com/paper/libcity-an-open-library-for-traffic
- [28] STID repository, GitHub (built on BasicTS, an open-source time-series forecasting benchmark). Has data-preparation scripts for METR-LA, PEMS-BAY, PEMS03, PEMS04, PEMS07, PEMS08. https://github.com/rrrrrrzy/stid
- [29] DL-Traff-Graph, GitHub (CIKM 2021 Best Resource Paper Runner-Up per its page). Ships METR-LA, PeMS-BAY, PeMSD7(M) files and models including HistoricalAverage and CopyLastSteps baselines. https://github.com/deepkashiwa20/DL-Traff-Graph
- [30] FLUTE: A Scalable, Extensible Framework for High-Performance Federated Learning Simulations, arXiv 2203.13789 (preprint; authors' own benchmarks; Unreviewed). Compares FLUTE with FedML (Parrot) and Flower simulators; claims speed gains over both.
- [31] Recent Advances on Federated Learning: A Systematic Survey, arXiv 2301.01299 (preprint). Describes FedLab (standalone, cross-process and hierarchical simulation, with aggregation and data-partition modules), Flower, FedML, FATE, FedScale.
- [32] Exploring the Practicality of Federated Learning: A Survey Towards the Communication Perspective, arXiv 2405.20431 (preprint). Qualitative comparison of Flower, FedML, FedScale, NVFlare, FederatedScope by platform support and protocol.
- [33] Evaluating Federated Learning Simulators: A Comparative Analysis of Horizontal and Vertical Approaches, Sensors, Aug 2024 (peer-reviewed). Evaluates FedML, Flower, Flute and PySyft and reports trade-offs. https://doaj.org/article/495d290fe87245ca9b1d8f8effd1d28c
- [34] Hydra documentation, hydra.cc (Organizer-authored). Describes multirun mode (`--multirun`), sweepers, per-job output directories and a config composition system.

## A2. Open-source options by role (evidence only)

| Role | Option | What sources report | Constraint touchpoints |
|---|---|---|---|
| FL simulation | Flower | Simulation with virtual clients, FedAvg built in, custom Strategy interface [23][24] | C2 FedAvg: Meets (built in). C5 bytes per round: Unknown, no source states a built-in byte counter. |
| FL simulation | FedML, FLUTE, FedLab, FATE, NVFlare, PySyft | Described in comparisons [30][31][32][33]; FLUTE and FedML compared by speed in [30] (single source, authors' benchmark) | C2: Unknown for traffic forecasting. Not tested here. |
| FL simulation | Hand-written loop | The FedAvg algorithm is specified in [1] | PS lists "Federated learning simulator" as an expected outcome. |
| Dataset format | LibCity atomic files | Unified format plus conversion tools [25]; 29 datasets [27] | C1 one public dataset: Meets. |
| Dataset format | BasicTS-style prep scripts | Scripts for METR-LA, PEMS-BAY, PEMS03/04/07/08 [28] | C1: Meets. |
| Baselines | HistoricalAverage, CopyLastSteps | Present in DL-Traff-Graph [29] | Centralized and naive baselines: supported. |
| Experiment config | Hydra | Multirun, sweepers, per-job output dirs [34] | C6 three seeds: configurable as a sweep (the sources describe sweeps generally, not seeds specifically). |

Resolved question from report v1: the sources list PeMSD3, PeMSD4 and PeMSD8 as **flow** datasets and METR-LA and PEMS-BAY as **speed** datasets [26]. PeMSD4 has 307 sensors and PeMSD8 has 170, at 5-minute intervals, with date ranges Jan 1–Feb 28 2018 and Jul 1–Aug 2016 [26][9][25].

## A3. Known issues and gaps
- Not verified for any tool: license, current version, maintenance status, GitHub stars, install size.
- No source states that Flower or the others log communication bytes per round; the byte formula in [8] is the documented approach.
- Framework comparisons [30][33] use different tasks and are not about traffic forecasting; performance claims are single-source.
- Dataset terms of use (PeMS) were not checked. LibCity hosts data through BaiduDisk or Google Drive links [25]; access from your network is unverified.
- Not searched this run: experiment trackers (MLflow, TensorBoard), dashboard tools (Streamlit), and any open-source federated traffic code (for example repositories for FedGRU [14]). These appear below only as unverified options.
- Privacy and secure-aggregation modules exist in several frameworks, but the PS excludes formal privacy guarantees, so they are outside this study.

---

# PART B: Updated Plan with Added Features

## B1. Decisions updated (changes from v1 in bold)
| # | Decision (decision) | Choice | Basis |
|---|---|---|---|
| D1 | Dataset | **PeMSD4 (flow, 307 sensors, 5-min, Jan–Feb 2018)**; PeMSD8 (170 sensors) as a fallback | Flow data per [26]; matches PS "traffic-flow". Verify content after download. |
| D2 | Clients | 4 clients | Within 3–5. |
| D3 | Model | Single-layer GRU, shared across sensors, 12-step input, 1-step horizon | GRU is the smallest payload in [7]. |
| D4 | Split | Chronological 70/10/20 per client; assert ordering | PS C3. |
| D5 | Simulator | **Own FedAvg simulator as the deliverable, with Flower FedAvg as an optional parity check** | PS asks to "build a federated simulator"; Flower provides FedAvg and simulation [24]. |
| D6 | Config and seeds | **Hydra multirun over seeds 0, 1, 2** | [34] |
| D7 | Dataset loading | **LibCity-format loader or a small own loader for the raw PeMSD4 file** | [25][28] |
| D8 | Baselines | Centralized GRU, **HistoricalAverage, CopyLastSteps**, local-only | [29] |

## B2. Added features (all new vs v1)
**Must (PS-driven)**
1. **Requirement checker** `check_ps_compliance.py`: asserts 3–5 clients, one dataset, FedAvg, chronological split, IID and non-IID runs, MAE, RMSE, bytes per round, convergence, 3 seeds, and no privacy-guarantee code. Prints a pass/fail table for the final report.
2. **Dual partitioner**: IID (random sensor assignment) and non-IID (k-means on sensor mean level and variance, plus an optional spatial split).
3. **Heterogeneity report**: per-client mean, std, daily-profile difference and a distance score showing IID and non-IID genuinely differ.
4. **Communication ledger**: downlink, uplink, per round, cumulative; centralized one-time upload for comparison; bytes-to-target.
5. **Convergence analyzer**: rounds-to-target on validation, plateau detection, area under the validation curve.
6. **Seed manager and aggregator**: seeds 0, 1, 2, mean ± std tables.

**Should**
7. **Per-client metrics and worst-client MAE**, since one paper focuses on performance disparities among clients [6].
8. **Local-epoch and learning-rate sweeps** through Hydra multirun [34].
9. **Client-fraction sweep** (all clients vs a subset), because cost depended on the fraction in [8].
10. **Flower parity test**: same data, same init, compare FedAvg curves from your simulator against Flower's [24]; document differences.
11. **Naive baselines** HistoricalAverage and CopyLastSteps [29].
12. **Results manifest**: config hash, seed, package versions, git commit stored with every run.
13. **Auto report builder**: tables (CSV and Markdown), figures, and a PDF section generator for the hackathon PDF.

**Could**
14. Horizon-wise metrics (5 min, 30 min, 1 h), as reported by [11].
15. FedProx as a labeled extra comparison (listed in Flower [24]; not required by the PS).
16. Interactive dashboard and experiment tracker (unverified options, not researched).
17. Per-client scaler ablation.

## B3. Revised module and function map (additions marked +)
| Module | Functions |
|---|---|
| config | `load_config`, + Hydra config groups (`data`, `partition`, `model`, `fl`) |
| data | `load_pemsd4`, `clean`, `make_windows`, `chrono_split`, `fit_scaler`, + `verify_flow_variable` |
| partition | `partition_iid`, `partition_noniid`, + `kmeans_by_stats`, + `heterogeneity_report` |
| models | `GRUForecaster`, `count_params`, `model_bytes` |
| fl | `Client.local_train`, `Server.fedavg`, `Simulator.run`, + `client_sampling(fraction, seed)` |
| comm | `CommLedger`, + `bytes_to_target`, + `centralized_upload_bytes` |
| baselines | `train_centralized`, `train_local_only`, + `historical_average`, + `copy_last_steps` |
| eval | `mae`, `rmse`, + `per_client_metrics`, + `worst_client`, + `rounds_to_target`, + `plateau_round`, + `auc_curve` |
| parity | + `run_flower_fedavg`, + `compare_curves` |
| experiments | `run_experiment`, + Hydra entry point, + `manifest.write()` |
| report | `aggregate_seeds`, `plot_*`, `export_tables`, + `build_pdf_sections` |
| compliance | + `check_ps_compliance` |
| tests | `test_no_leakage`, `test_partition_disjoint`, `test_byte_formula`, `test_seed_repro`, + `test_noniid_differs`, + `test_flower_parity` |

## B4. Experiment matrix (updated)
| Run | Setting | Method | Seeds |
|---|---|---|---|
| A | pooled | Centralized GRU | 0, 1, 2 |
| B | IID, 4 clients | FedAvg | 0, 1, 2 |
| C | non-IID, 4 clients | FedAvg | 0, 1, 2 |
| D | each client alone | Local-only | 0, 1, 2 |
| E | reference | HistoricalAverage, CopyLastSteps | n/a |
| F | non-IID | FedAvg, local epochs {1, 5} | 0, 1, 2 |
| G | non-IID | FedAvg, client fraction sweep | 0, 1, 2 |
| H | IID and non-IID | Flower FedAvg parity (1 seed minimum) | 0 |

## B5. Metric definitions (unchanged core)
- Bytes per round = 2 × parameters × 4 × participants (float32, per the formula in [8]); log uplink and downlink separately.
- Convergence = first round where validation MAE is within a pre-set tolerance of the centralized best validation MAE; report rounds and cumulative bytes.
- MAE and RMSE on the final test period in original units; mean ± std over seeds.

## B6. Repository layout (updated)
```
<team-name>/
  conf/        data/ partition/ model/ fl/ experiment/
  src/         data partition models fl comm baselines eval parity report compliance
  scripts/     check_ps_compliance.py  run_all.sh  make_report.py
  tests/
  results/     runs/<hash>/ (manifest, curves, ledger)  tables/  figures/
  docs/        <team>_report.pdf  (structure per Proposed-structure-hackathon.pdf)
  demo/        pseudocode.md  demo.py --fast
```

## B7. Pseudocode for the demo (updated)
```
cfg = hydra_config(seed)
data = load_pemsd4(); assert flow variable
train, val, test = chrono_split(data, 0.7, 0.1, 0.2)
scaler = fit(train)
clients = partition(sensors, k=4, mode=IID|NONIID, seed)
print(heterogeneity_report(clients))
w = init_gru(seed)
for r in 1..R:
    sel = sample_clients(clients, fraction, seed+r)
    ups = [(local_train(c, w, E), n_c) for c in sel]
    w = weighted_average(ups)
    ledger.add(r, up=P*4*len(sel), down=P*4*len(sel))
    log(val_MAE(w), val_RMSE(w), ledger.cumulative)
report test MAE/RMSE, rounds_to_target, bytes_to_target; repeat seeds 0..2
```

## B8. Phases
1. Setup: repo, GitHub steps, Hydra skeleton, compliance script stub.
2. Data and baselines: PeMSD4 loader, split, scaler, HistoricalAverage, CopyLastSteps, centralized GRU.
3. Federation: own simulator, ledger, IID run.
4. Non-IID: partitioner, heterogeneity report, runs B, C, D over 3 seeds.
5. Analysis: convergence, bytes, per-client metrics, sweeps F and G.
6. Parity: Flower check (run H).
7. Delivery: report builder, PDF, README, demo rehearsal, compliance output, GitHub ownership transfer.

## B9. Risks and open items
- PeMSD4 variable and file layout must be confirmed after download; the retrieved dataset table was partly garbled [26].
- Dataset license and network access unverified [25].
- Flower byte logging is unverified; keep the own ledger as the source of truth.
- Open-source tool versions and licenses are unverified; pin versions in `requirements.txt` after checking them yourself.
- The hackathon PDF structure file was not provided.
- Google Scholar and ResearchGate were not reached in either report.
