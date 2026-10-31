import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  Zap, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  WifiOff, 
  Wifi, 
  Sliders, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Flame, 
  Terminal, 
  Send, 
  TrendingDown, 
  CheckCircle2,
  Clock,
  Car,
  FileText
} from 'lucide-react';
import { 
  FlowerLlmConfig, 
  DEFAULT_FLOWER_LLM_CONFIG, 
  FLOWER_RSU_PARTITIONS, 
  simulateFlowerLlmConvergence, 
  runFederatedLlmReasoning, 
  generateFlowerAppCode,
  FedLlmInferenceResult
} from '../services/flowerFedLlmService';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface FlowerFedLLMStudioProps {
  currentLanguage?: SupportedLanguage;
}

export const FlowerFedLLMStudio: React.FC<FlowerFedLLMStudioProps> = ({
  currentLanguage = 'en'
}) => {
  const [config, setConfig] = useState<FlowerLlmConfig>(DEFAULT_FLOWER_LLM_CONFIG);
  const [activeSubTab, setActiveSubTab] = useState<'training' | 'partitions' | 'inference' | 'code'>('inference');
  
  // Interactive Reasoning State
  const [incidentInput, setIncidentInput] = useState<string>(
    'Severe 3-vehicle collision blocking Lanes 1 & 2 on US-101 Northbound near Cahuenga Pass with fluid spill. Speeds collapsed to 12 mph. Heavy braking wave propagating 2.5 miles upstream.'
  );
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<FedLlmInferenceResult | null>(null);

  // Code Export State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<'server' | 'client' | 'pyproject' | 'bash'>('server');

  // Compute convergence progression
  const trainingMetrics = useMemo(() => {
    return simulateFlowerLlmConvergence(config);
  }, [config]);

  const latestMetric = trainingMetrics[trainingMetrics.length - 1];

  const handleRunInference = async () => {
    if (!incidentInput.trim()) return;
    setIsInferring(true);
    try {
      const res = await runFederatedLlmReasoning(incidentInput, config);
      setInferenceResult(res);
    } finally {
      setIsInferring(false);
    }
  };

  const appCodes = useMemo(() => {
    return generateFlowerAppCode(config);
  }, [config]);

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Flower Framework & GitHub Attribution */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Flower (flwrlabs/flower) Next-Gen FL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PEFT / LoRA Fine-Tuning
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Flower Federated LLM Studio (FlowerTune ITS)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Decentralized instruction tuning for traffic foundation models across Caltrans edge Roadside Units (RSUs).
              Aggregates LoRA adapters without centralizing raw traffic camera footage or private motorist telematics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://github.com/flwrlabs/flower"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-150 backdrop-blur-sm"
            >
              <span>GitHub: flwrlabs/flower</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            <button
              onClick={() => setActiveSubTab('code')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-all duration-150 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Export Flower 1.x Code</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-indigo-900/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('inference')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'inference'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Federated LLM Reasoning</span>
          </button>

          <button
            onClick={() => setActiveSubTab('training')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'training'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. LoRA Fine-Tuning & Dropout Resilience</span>
          </button>

          <button
            onClick={() => setActiveSubTab('partitions')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'partitions'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3. Edge RSU Incident Partitions</span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Flower ClientApp & ServerApp Code</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INTERACTIVE FEDERATED TRAFFIC REASONING */}
      {activeSubTab === 'inference' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Incident Input Console */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Traffic Incident Dispatch Console
                </span>
                <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  FlowerTune Aggregated LoRA
                </span>
              </div>

              {/* Preset Scenarios */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Quick Pre-loaded Incident Scenarios:</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    {
                      label: 'US-101 Hollywood 3-Car Crash & Fluid Spill',
                      text: 'Major 3-vehicle collision blocking Lanes 1 & 2 on US-101 Northbound near Cahuenga Pass with fluid spill. Speeds collapsed to 12 mph. Heavy braking wave propagating 2.5 miles upstream.'
                    },
                    {
                      label: 'I-10 Santa Monica Stalled EV & Right Lane Closure',
                      text: 'Disabled electric SUV stalled in Lane 4 of I-10 Westbound past La Brea Ave. Congestion spillover backing onto Robertson Blvd on-ramp. Speed differential 55 mph -> 18 mph.'
                    },
                    {
                      label: 'I-210 Foothill Mountain Dense Micro-Fog Hazard',
                      text: 'Severe fog bank rolling into Foothill corridor with visibility drop below 150 ft. Dark curve section experiencing rapid deceleration events and high truck-car speed disparity.'
                    }
                  ].map((scen, idx) => (
                    <button
                      key={idx}
                      onClick={() => setIncidentInput(scen.text)}
                      className="text-left text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      {scen.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Incident Narrative / Dispatch Report:</label>
                <textarea
                  value={incidentInput}
                  onChange={(e) => setIncidentInput(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-none bg-slate-50 text-slate-900 resize-none leading-relaxed"
                  placeholder="Enter traffic incident details, highway corridor, affected lanes, and speed drop..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRunInference}
                disabled={isInferring}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isInferring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Aggregating RSU LoRA Weights & Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Run Federated LLM Inference (Flower FedProx)</span>
                  </>
                )}
              </button>
            </div>

            {/* Edge LoRA Aggregation Spec */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Flower LoRA Hyperparameters:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>Foundation: <strong className="text-slate-900">Llama-3-8B</strong></div>
                <div>Quantization: <strong className="text-slate-900">4-bit NF4</strong></div>
                <div>Rank $r$: <strong className="text-slate-900">{config.loraRank}</strong></div>
                <div>Alpha $\alpha$: <strong className="text-slate-900">{config.loraAlpha}</strong></div>
                <div>Trainable: <strong className="text-slate-900">3.4M (0.042%)</strong></div>
                <div>Strategy: <strong className="text-slate-900">{config.strategy} (μ={config.proximalMu})</strong></div>
              </div>
            </div>
          </div>

          {/* Inference Output Directives */}
          <div className="lg:col-span-7 space-y-4">
            {inferenceResult ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Federated LLM Traffic Management Directives
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    inferenceResult.spilloverRisk === 'Extreme' ? 'bg-rose-100 text-rose-800' :
                    inferenceResult.spilloverRisk === 'High' ? 'bg-amber-100 text-amber-800' :
                    'bg-cyan-100 text-cyan-800'
                  }`}>
                    Risk: {inferenceResult.spilloverRisk}
                  </span>
                </div>

                {/* 3 Metric Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-cyan-50/70 p-3.5 rounded-xl border border-cyan-200 space-y-1">
                    <div className="text-[11px] text-cyan-800 font-semibold flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-cyan-600" />
                      Dynamic Speed Advisory
                    </div>
                    <div className="text-2xl font-mono font-bold text-cyan-950">
                      {inferenceResult.speedAdvisoryMph} <span className="text-xs">mph</span>
                    </div>
                    <div className="text-[10px] text-cyan-700">VSL automated step-down</div>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1">
                    <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Upstream Ramp Metering
                    </div>
                    <div className="text-2xl font-mono font-bold text-amber-950">
                      +{inferenceResult.rampMeteringRateSec} <span className="text-xs">sec</span>
                    </div>
                    <div className="text-[10px] text-amber-700">Red-cycle increase</div>
                  </div>

                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                    <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Consensus Stability
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-950">
                      {inferenceResult.federatedConsensusScore}%
                    </div>
                    <div className="text-[10px] text-emerald-700">LoRA weight agreement</div>
                  </div>
                </div>

                {/* Caltrans Variable Message Sign (VMS) Preview */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Caltrans Overhead Variable Message Sign (VMS) Advisory:</span>
                  </div>
                  <div className="bg-slate-950 text-amber-400 font-mono text-center p-3.5 rounded-xl border border-slate-800 tracking-widest text-xs uppercase shadow-inner leading-relaxed font-bold">
                    {inferenceResult.vmsAlertText.split(' / ').map((line, idx) => (
                      <div key={idx} className="py-0.5">{line}</div>
                    ))}
                  </div>
                </div>

                {/* Corridor Impact & Spillover */}
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800">Corridor Impact & Queue Dynamics:</div>
                  <p className="text-slate-600 leading-relaxed">{inferenceResult.corridorImpact}</p>
                </div>

                {/* Reasoning Narrative */}
                <div className="space-y-1 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/80 text-xs">
                  <div className="font-bold text-indigo-950 flex items-center justify-between">
                    <span>Decentralized RSU Consensus Summary:</span>
                    <span className="text-[10px] font-mono text-indigo-700">Flower ServerApp Aggregated</span>
                  </div>
                  <p className="text-indigo-900 leading-relaxed">{inferenceResult.reasoningNarrative}</p>
                </div>

                {/* Participating RSUs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px] text-slate-500">
                  <span className="font-semibold">Participating Roadside Units:</span>
                  {inferenceResult.participatingRsus.map((rsu, i) => (
                    <span key={i} className="bg-slate-100 text-slate-800 font-mono px-2 py-0.5 rounded border border-slate-200">
                      {rsu}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center flex flex-col items-center justify-center min-h-[360px] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="font-bold text-slate-800 text-sm">Awaiting Incident Dispatch Query</h4>
                  <p className="text-xs text-slate-500">
                    Select a preset traffic scenario on the left or enter a custom corridor incident, then click
                    <strong> "Run Federated LLM Inference"</strong> to execute decentralized reasoning across RSU LoRA weights.
                  </p>
                </div>
                <button
                  onClick={handleRunInference}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs cursor-pointer"
                >
                  Run Demo Inference on US-101 Crash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LORA FINE-TUNING & DROPOUT RESILIENCE */}
      {activeSubTab === 'training' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Foundation Model */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Model:</span>
                <select
                  value={config.foundationModel}
                  onChange={(e) => setConfig(prev => ({ ...prev, foundationModel: e.target.value as any }))}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="meta-llama/Llama-3-8B-Instruct">Llama-3-8B-Instruct (Meta)</option>
                  <option value="google/gemma-2-9b-it">Gemma-2-9B-IT (Google)</option>
                  <option value="mistralai/Mistral-7B-Instruct-v0.3">Mistral-7B-Instruct (Mistral)</option>
                </select>
              </div>

              {/* Strategy */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">FL Strategy:</span>
                <select
                  value={config.strategy}
                  onChange={(e) => setConfig(prev => ({ ...prev, strategy: e.target.value as any }))}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="FedProx">FedProx (Straggler Resilient)</option>
                  <option value="FedAvg">FedAvg (Vanilla)</option>
                  <option value="FedAdam">FedAdam (Adaptive Server)</option>
                </select>
              </div>

              {/* LoRA Rank */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">LoRA Rank:</span>
                <div className="flex gap-1 font-bold">
                  {[8, 16, 32].map(r => (
                    <button
                      key={r}
                      onClick={() => setConfig(prev => ({ ...prev, loraRank: r as any }))}
                      className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        config.loraRank === r ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      r={r}
                    </button>
                  ))}
                </div>
              </div>

              {/* RSU Periodic Dropout Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">RSU Connectivity Dropout:</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, simulateClientDropout: !prev.simulateClientDropout }))}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    config.simulateClientDropout 
                      ? 'bg-amber-500 text-slate-950 shadow-xs' 
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {config.simulateClientDropout ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                  <span>{config.simulateClientDropout ? 'Simulating Dropout (Active)' : 'Normal (Full RSU Link)'}</span>
                </button>
              </div>
            </div>

            {/* Live Metrics Summary */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div>Loss: <strong className="text-indigo-800">{latestMetric.evalLoss.toFixed(3)}</strong></div>
              <div>Perplexity: <strong className="text-cyan-800">{latestMetric.perplexity.toFixed(2)}</strong></div>
              <div>Resilience: <strong className="text-emerald-700">{latestMetric.resilienceScore}%</strong></div>
            </div>
          </div>

          {/* Convergence Trajectory Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-600" />
                  Decentralized LoRA Loss & Perplexity Trajectory
                </h4>
                <p className="text-[11px] text-slate-500">
                  Evaluated across global Flower federated rounds with simulated intermittent RSU disconnects
                </p>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold">
                {config.strategy} Aggregation
              </span>
            </div>

            {/* SVG Trajectory */}
            <div className="relative w-full aspect-[21/8] min-h-[200px] max-h-[240px] bg-slate-50 rounded-xl border border-slate-200 p-2">
              <svg viewBox="0 0 600 200" className="w-full h-full select-none">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = 15 + 160 * ratio;
                  return (
                    <line key={ratio} x1="40" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                  );
                })}

                {/* Dropout Markers & Curve */}
                {(() => {
                  const maxLoss = 4.0;
                  const minLoss = 0.5;
                  const getX = (r: number) => 40 + ((r - 1) / (config.totalServerRounds - 1)) * 540;
                  const getY = (val: number) => 15 + 160 - ((val - minLoss) / (maxLoss - minLoss)) * 160;

                  const pathD = trainingMetrics.reduce((acc, m, idx) => {
                    const x = getX(m.round);
                    const y = getY(m.evalLoss);
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '');

                  return (
                    <>
                      {/* Loss Curve */}
                      <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Points & Dropout pulses */}
                      {trainingMetrics.map((m) => {
                        const x = getX(m.round);
                        const y = getY(m.evalLoss);
                        const isDrop = m.droppedRsus.length > 0;

                        return (
                          <g key={m.round}>
                            {isDrop && (
                              <circle cx={x} cy={y} r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping opacity-60" />
                            )}
                            <circle
                              cx={x}
                              cy={y}
                              r={isDrop ? '4.5' : '3'}
                              fill={isDrop ? '#f59e0b' : '#4f46e5'}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                            {isDrop && (
                              <text x={x} y={y - 8} textAnchor="middle" fill="#d97706" fontSize="7" fontWeight="bold">
                                ⚠️ Drop
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-bold text-indigo-700">
                  <span className="w-3.5 h-1 bg-indigo-600 rounded-full" />
                  LoRA Evaluation Loss
                </span>
                <span className="flex items-center gap-1.5 font-bold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  RSU Connectivity Dropout Round
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Resilience retention: <strong className="text-emerald-700 font-mono">98.4%</strong> under FedProx
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EDGE RSU INCIDENT PARTITIONS */}
      {activeSubTab === 'partitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-600" />
              Decentralized RSU Edge Partitions (Caltrans District 7)
            </h4>
            <span className="text-xs text-slate-500">4 Edge RSU Nodes Training Local Adapters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLOWER_RSU_PARTITIONS.map((rsu) => (
              <div key={rsu.rsuId} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-mono text-xs font-bold flex items-center justify-center">
                      {rsu.rsuId}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[220px]">
                      {rsu.corridor}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    rsu.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    rsu.severity === 'Severe' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {rsu.severity}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-600">Incident Type:</div>
                  <div className="font-bold text-slate-900">{rsu.incidentType}</div>

                  <div className="font-semibold text-slate-600 pt-1">Sample Local Narrative:</div>
                  <p className="font-mono text-[11px] p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
                    {rsu.rawDispatchText}
                  </p>

                  <div className="font-semibold text-slate-600 pt-1">Ground Truth Management Directive:</div>
                  <div className="font-mono text-[11px] text-cyan-800 bg-cyan-50/70 p-2 rounded-xl border border-cyan-200 font-medium">
                    {rsu.groundTruthAdvisory}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Partition Size: <strong className="text-slate-800 font-mono">{rsu.sampleCount} records</strong></span>
                  <span>LoRA Weights: <strong className="text-indigo-700 font-mono">13.6 MB</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FLOWER CLIENTAPP & SERVERAPP CODE EXPORTER */}
      {activeSubTab === 'code' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-600" />
                Flower 1.x Production Code Generator
              </h3>
              <p className="text-xs text-slate-500">
                Official Flower (<a href="https://github.com/flwrlabs/flower" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">flwrlabs/flower</a>) implementation ready for local or Colab execution
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const code = activeCodeFile === 'server' ? appCodes.serverAppPy :
                               activeCodeFile === 'client' ? appCodes.clientAppPy :
                               activeCodeFile === 'pyproject' ? appCodes.pyprojectToml : appCodes.runBash;
                  handleCopyCode(code, activeCodeFile);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                {copiedKey === activeCodeFile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span>{copiedKey === activeCodeFile ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => {
                  const name = activeCodeFile === 'server' ? 'server_app.py' :
                               activeCodeFile === 'client' ? 'client_app.py' :
                               activeCodeFile === 'pyproject' ? 'pyproject.toml' : 'run.sh';
                  const code = activeCodeFile === 'server' ? appCodes.serverAppPy :
                               activeCodeFile === 'client' ? appCodes.clientAppPy :
                               activeCodeFile === 'pyproject' ? appCodes.pyprojectToml : appCodes.runBash;
                  handleDownloadFile(name, code);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* File Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
            <button
              onClick={() => setActiveCodeFile('server')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                activeCodeFile === 'server' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              flowertune_llm/server_app.py
            </button>
            <button
              onClick={() => setActiveCodeFile('client')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                activeCodeFile === 'client' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              flowertune_llm/client_app.py
            </button>
            <button
              onClick={() => setActiveCodeFile('pyproject')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                activeCodeFile === 'pyproject' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              pyproject.toml
            </button>
            <button
              onClick={() => setActiveCodeFile('bash')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                activeCodeFile === 'bash' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              run.sh
            </button>
          </div>

          {/* Code Body */}
          <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto text-slate-100 font-mono text-xs max-h-[420px] leading-relaxed shadow-inner">
            <pre>
              {activeCodeFile === 'server' && appCodes.serverAppPy}
              {activeCodeFile === 'client' && appCodes.clientAppPy}
              {activeCodeFile === 'pyproject' && appCodes.pyprojectToml}
              {activeCodeFile === 'bash' && appCodes.runBash}
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Runs with Flower CLI: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">flwr run .</code></span>
            <span>Targeting flwr[simulation]&gt;=1.15.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
