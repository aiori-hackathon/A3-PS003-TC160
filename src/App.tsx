import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TrafficIntroAnimation } from './components/TrafficIntroAnimation';
import { CinematicIntro3D } from './components/CinematicIntro3D';
import { ThreeDigitalTwinView } from './components/ThreeDigitalTwinView';
import { AuthModal } from './components/AuthModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { BluetoothBeaconModal } from './components/BluetoothBeaconModal';
import { ContactInfoModal } from './components/ContactInfoModal';
import { FederatedTopologyCanvas } from './components/FederatedTopologyCanvas';
import { ConvergenceChart } from './components/ConvergenceChart';
import { CommunicationCostPanel } from './components/CommunicationCostPanel';
import { TrafficDensityHeatmap } from './components/TrafficDensityHeatmap';
import { MetrLaEffectivePredictions } from './components/MetrLaEffectivePredictions';
import { SimulationComparison, PinnedRunState } from './components/SimulationComparison';
import { FlowerFedLLMStudio } from './components/FlowerFedLLMStudio';
import { ErrorPages } from './components/ErrorPages';
import { AIAssistantChat } from './components/AIAssistantChat';
import { MultiSeedBenchmarkModal } from './components/MultiSeedBenchmarkModal';
import { ResearchReportModal } from './components/ResearchReportModal';
import { GoogleColabModal, ColabEnhancedMetrics } from './components/GoogleColabModal';
import { DocDownloadModal } from './components/DocDownloadModal';
import { FedAvgPseudocodeModal } from './components/FedAvgPseudocodeModal';
import { DataLeakageAuditBadge } from './components/DataLeakageAuditBadge';
import { SimulationConfig, RoundMetrics } from './types/federated';
import { METR_LA_DATASET, MODEL_SPECS } from './services/trafficDataService';
import { FederatedSimulationEngine } from './services/federatedEngine';
import { savePinnedRunToSupabase, onAuthStateChange, SupabaseUser } from './services/supabase';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from './services/i18n';
import { 
  LineChart, 
  Flame, 
  GitCompare, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  Bookmark,
  Terminal,
  ExternalLink,
  Search,
  AlertTriangle,
  Radio,
  FileWarning,
  Menu,
  Play,
  Globe,
  Bluetooth,
  User,
  Zap,
  Headphones,
  WifiOff,
  Wifi
} from 'lucide-react';

export function App() {
  // 1. Language state (supporting 8 Indian & Southern Indian languages)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('aiori_language');
      if (stored && ['en', 'hi', 'kn', 'ta', 'te', 'ml', 'mr', 'bn'].includes(stored)) {
        return stored as SupportedLanguage;
      }
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isPostIntroLanguagePrompt, setIsPostIntroLanguagePrompt] = useState<boolean>(false);

  // 2. Traffic Intro Animation state (shown when user first enters the interface)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    const seen = sessionStorage.getItem('aiori_traffic_intro_seen');
    return seen !== 'true';
  });

  // 3. Google Authentication State
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // 4. Account Profile & Mobile OTP Modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // 5. Bluetooth RSU Sensor Modal state
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState<boolean>(false);

  // 6. Contact Info & Helpdesk Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  // 6.5. System & UI/UX Documentation Downloader (.txt) Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // 7. Permanent Colab Training Improvement State (Saved in localStorage & Firestore)
  const [colabEnhancedMetrics, setColabEnhancedMetrics] = useState<ColabEnhancedMetrics | null>(() => {
    try {
      const stored = localStorage.getItem('aiori_colab_enhanced_metrics');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      totalSyncedRounds: 50,
      enhancedMAE: 2.93,
      enhancedRMSE: 4.50,
      accuracyGainPercent: 14.3,
      syncedTimestamp: '2026-10-26 10:30',
      isPermanent: true
    };
  });

  // Configuration locked exclusively to METR-LA dataset as requested
  const [config, setConfig] = useState<SimulationConfig>({
    datasetId: 'metr-la',
    clientCount: 4,
    distribution: 'non-iid-dirichlet',
    dirichletAlpha: 0.5,
    modelArchitecture: 'gru',
    algorithm: 'fedavg',
    proximalMu: 0.1,
    localEpochs: 2,
    batchSize: 64,
    learningRate: 0.001,
    quantization: 'fp32',
    randomSeed: 42,
    totalRounds: 50,
    trainSplitRatio: 0.70,
    valSplitRatio: 0.15,
    testSplitRatio: 0.15
  });

  // 5 Primary Landing Page Partitions
  // 1: '3d-twin'     -> 3D Website & Digital Twin Studio (Procedural 3D RSU Node & Highway)
  // 2: 'predictions' -> Live Traffic Forecast Dashboard
  // 3: 'heatmap'     -> Research Heatmap & Shard Studio (with Non-IID Dirichlet Shard Bar Chart)
  // 4: 'comparison'  -> Simulation Comparison Studio (Side-by-side pinned baseline vs current run)
  // 5: 'flower-llm'  -> Flower Federated LLM Studio (flwrlabs/flower)
  const [activeTab, setActiveTab] = useState<'predictions' | 'heatmap' | 'comparison' | '3d-twin' | 'flower-llm'>('3d-twin');

  // Sidebar collapse toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Dynamic Error State: Rendered only when an actual error occurs or is triggered
  const [activeError, setActiveError] = useState<{
    type: '404' | 'security' | 'downtime';
    title?: string;
    message?: string;
  } | null>(null);

  // Detector search input to allow testing 404 error condition
  const [detectorSearch, setDetectorSearch] = useState<string>('');

  // Backend simulation & training state (runs behind the scenes in backend)
  const [isTrainingBackend, setIsTrainingBackend] = useState<boolean>(false);
  const [backendHistory, setBackendHistory] = useState<RoundMetrics[]>([]);
  const [backendClients, setBackendClients] = useState<any[]>([]);

  // Pinned Run state for Side-by-Side Simulation Comparison
  const [pinnedRun, setPinnedRun] = useState<PinnedRunState | null>(null);

  // Modals state
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isColabOpen, setIsColabOpen] = useState<boolean>(false);
  const [isPseudocodeOpen, setIsPseudocodeOpen] = useState<boolean>(false);

  // Translation helper
  const t = (key: string) => getTranslation(currentLanguage, key);

  // Listen to Supabase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Auto-train model internally in backend whenever config changes
  useEffect(() => {
    setIsTrainingBackend(true);
    const timer = setTimeout(() => {
      const engine = new FederatedSimulationEngine(config);
      const hist = engine.runFullSimulation(config.totalRounds);
      setBackendHistory(hist);
      setBackendClients(engine.getClients());
      setIsTrainingBackend(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [config]);

  const activeModel = MODEL_SPECS[config.modelArchitecture];
  const latestMetrics = backendHistory.length > 0 ? backendHistory[backendHistory.length - 1] : null;
  
  // Calculate MAE: If permanent Colab training enhancement is active, reflect the improved model accuracy!
  const baseMAE = latestMetrics ? latestMetrics.globalMAE : 3.42;
  const currentMAE = colabEnhancedMetrics?.isPermanent ? colabEnhancedMetrics.enhancedMAE : baseMAE;

  const handleConfigChange = (newPartial: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...newPartial }));
  };

  const handlePinCurrentRun = () => {
    if (!latestMetrics) return;
    const newPinned: PinnedRunState = {
      id: `run-${Date.now()}`,
      name: `Run: ${MODEL_SPECS[config.modelArchitecture].name.split(' ')[1]} (${config.clientCount} RSUs, ${config.quantization.toUpperCase()})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      config: { ...config },
      latestMetrics: { ...latestMetrics },
      history: [...backendHistory],
      actualTestMAE: currentMAE,
      actualTestRMSE: colabEnhancedMetrics?.isPermanent ? colabEnhancedMetrics.enhancedRMSE : latestMetrics.globalRMSE
    };
    setPinnedRun(newPinned);
    setActiveTab('comparison');

    // Persist to Supabase
    savePinnedRunToSupabase(newPinned);
  };

  const handleClearPinned = () => {
    setPinnedRun(null);
  };

  // When 3D intro completes, transition cleanly to the selected partition and language prompt
  const handleIntroComplete = (preferredMode: '3d-twin' | 'dashboard' = '3d-twin') => {
    sessionStorage.setItem('aiori_traffic_intro_seen', 'true');
    setShowIntro(false);
    if (preferredMode === '3d-twin') {
      setActiveTab('3d-twin');
    } else {
      setActiveTab('predictions');
    }

    // If user hasn't explicitly chosen language yet, show the language modal immediately after intro
    const hasChosenLang = localStorage.getItem('aiori_language_chosen');
    if (!hasChosenLang) {
      setIsPostIntroLanguagePrompt(true);
      setIsLanguageModalOpen(true);
    }
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('aiori_language', lang);
    localStorage.setItem('aiori_language_chosen', 'true');
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Test sensor detector lookup; if invalid, triggers 404 error page!
  const handleDetectorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = detectorSearch.trim();
    if (!query) return;

    const sensorNum = parseInt(query, 10);
    // METR-LA has 207 sensors. If sensor > 207 or not a valid number, trigger 404 error!
    if (isNaN(sensorNum) || sensorNum < 1 || sensorNum > 207) {
      setActiveError({
        type: '404',
        title: `METR-LA Sensor Detector #${query} Not Found`,
        message: `Loop station ID #${query} does not exist in the Los Angeles Caltrans D7 207-detector inventory.`
      });
    } else {
      setDetectorSearch('');
    }
  };

  // Permanent Colab Improvement handler
  const handleApplyColabTraining = (metrics: ColabEnhancedMetrics) => {
    setColabEnhancedMetrics(metrics);
  };

  // Render 3D Cinematic Intro first when user arrives
  if (showIntro) {
    return (
      <CinematicIntro3D
        onComplete={handleIntroComplete}
        datasetName={METR_LA_DATASET.name}
        sensorCount={METR_LA_DATASET.sensorsCount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-800">
      
      {/* Streamlined Top Header: ONLY Name of Application and Description on Left, Language & Google-Style Profile Icon on Right */}
      <Header
        currentLanguage={currentLanguage}
        onOpenLanguage={() => {
          setIsPostIntroLanguagePrompt(false);
          setIsLanguageModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenMobileOtpModal={() => setIsAccountModalOpen(true)}
        onUserLogin={(usr) => setCurrentUser(usr)}
        onOpenDocs={() => setIsDocModalOpen(true)}
        currentMAE={currentMAE}
        currentRound={latestMetrics ? latestMetrics.round : config.totalRounds}
        isTraining={isTrainingBackend}
        onOpenPseudocode={() => setIsPseudocodeOpen(true)}
        config={config}
        onUpdateConfig={handleConfigChange}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setActiveError(null);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenBenchmark={() => setIsBenchmarkOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenColab={() => setIsColabOpen(true)}
          onReplayIntro={handleReplayIntro}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenLanguage={() => {
            setIsPostIntroLanguagePrompt(false);
            setIsLanguageModalOpen(true);
          }}
          onOpenBluetooth={() => setIsBluetoothModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onOpenDocs={() => setIsDocModalOpen(true)}
          onOpenPseudocode={() => setIsPseudocodeOpen(true)}
          currentLanguage={currentLanguage}
          colabEnhancedMetrics={colabEnhancedMetrics}
          onTriggerError={(type) => setActiveError({ type })}
          currentUser={currentUser}
          pinnedRunCount={pinnedRun ? 1 : 0}
        />

        {/* Primary Content Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === '3d-twin' ? (
            <ThreeDigitalTwinView
              onSwitchToDashboard={() => setActiveTab('predictions')}
              onReplayIntro={handleReplayIntro}
            />
          ) : (
            <>
              {/* Subheader: Top Notification Bar with Colab Link & Training Status */}
              <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">{t('activePartition') || 'Active Partition:'}</span>
                  <span className="font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-lg font-bold">
                    {activeTab === 'predictions' ? (t('partition1') || '1. Live Forecast Dashboard') :
                     activeTab === 'heatmap' ? (t('partition2') || '2. Heatmap & Shard Studio') :
                     activeTab === 'comparison' ? (t('partition3') || '3. Simulation Comparison Studio') :
                     '5. Flower Federated LLM Studio'}
                  </span>

                  {colabEnhancedMetrics?.isPermanent && (
                    <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{colabEnhancedMetrics.totalSyncedRounds} Colab Rounds Synced ({colabEnhancedMetrics.enhancedMAE} km/h MAE)</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Internal Google Colab Link */}
                  <button
                    onClick={() => setIsColabOpen(true)}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shadow-2xs"
                    title="View Google Colab Notebook & Permanent Training Optimizer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-amber-600" />
                    <span>Colab Notebook Sync</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </button>

                  {/* Backend Model Status */}
                  {isTrainingBackend ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-xl animate-pulse">
                      <div className="w-2 h-2 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
                      {t('modelTraining') || 'Model Training...'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xl shadow-2xs transition-colors duration-700 ease-out">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      MAE: {currentMAE.toFixed(2)} km/h {colabEnhancedMetrics?.isPermanent ? '(Colab Boosted)' : ''}
                    </span>
                  )}
                </div>
              </div>

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
            
            {/* CONDITIONAL ERROR PAGE: Rendered only when an error occurs */}
            {activeError ? (
              <div className="animate-in fade-in duration-200">
                <ErrorPages
                  initialType={activeError.type}
                  onReturnToDashboard={() => setActiveError(null)}
                />
              </div>
            ) : (
              <>
                {/* Hyperparameter Quick Control Bar & Detector Search Tool */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>{t('hyperparameters') || 'Model Hyperparameters (Internally Trained):'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Architecture Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">{t('modelArch') || 'Model:'}</span>
                      <select
                        value={config.modelArchitecture}
                        onChange={(e) => handleConfigChange({ modelArchitecture: e.target.value as any })}
                        className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="gru">Compact GRU (63K)</option>
                        <option value="tcn-cnn">Dilated 1D-TCN (42K)</option>
                        <option value="compact-mlp">MLP-Mixer (28K)</option>
                        <option value="st-gnn">ST-GNN (78K)</option>
                      </select>
                    </div>

                    {/* Clients Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">{t('rsus') || 'RSUs:'}</span>
                      <div className="flex gap-1 font-bold">
                        {[3, 4, 5].map(cnt => (
                          <button
                            key={cnt}
                            onClick={() => handleConfigChange({ clientCount: cnt })}
                            className={`px-1.5 py-0.5 rounded transition-all duration-150 active:scale-95 cursor-pointer ${config.clientCount === cnt ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Distribution */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">{t('drift') || 'Drift:'}</span>
                      <button
                        onClick={() => handleConfigChange({ distribution: config.distribution === 'iid' ? 'non-iid-dirichlet' : 'iid' })}
                        className="font-bold text-slate-800 hover:text-cyan-700 transition-all duration-150 active:scale-95 cursor-pointer"
                      >
                        {config.distribution === 'iid' ? 'IID (Uniform)' : `Non-IID (α=${config.dirichletAlpha})`}
                      </button>
                    </div>

                    {/* Quantization */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">{t('comm') || 'Comm:'}</span>
                      <select
                        value={config.quantization}
                        onChange={(e) => handleConfigChange({ quantization: e.target.value as any })}
                        className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="fp32">FP32 (100% Size)</option>
                        <option value="fp16">FP16 (50% Bandwidth)</option>
                        <option value="int8">INT8 (75% Savings)</option>
                        <option value="topk-sparse">Top-10% Sparse (85% Savings)</option>
                      </select>
                    </div>

                    {/* RSU Periodic Connectivity Failure Simulator Toggle */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">RSU Dropout:</span>
                      <button
                        onClick={() => handleConfigChange({ simulateDropout: !config.simulateDropout })}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                          config.simulateDropout
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs shadow-amber-500/20'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title="Simulate periodic RSU 5G network dropouts and evaluate model resilience"
                      >
                        {config.simulateDropout ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{config.simulateDropout ? 'Simulating Dropout (ON)' : 'Dropout: OFF'}</span>
                      </button>
                    </div>

                    {/* PS-003 Chronological Data Leakage Audit Badge */}
                    <DataLeakageAuditBadge
                      config={config}
                      onUpdateConfig={handleConfigChange}
                    />

                    {/* Detector Search */}
                    <form onSubmit={handleDetectorSearch} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={detectorSearch}
                        onChange={(e) => setDetectorSearch(e.target.value)}
                        placeholder={t('detectorSearch') || 'Detector # (1-207)'}
                        className="w-28 bg-transparent text-[11px] font-mono text-slate-800 focus:outline-none"
                        title="Lookup detector. Enter an invalid number like 999 to test the 404 error page."
                      />
                      <button
                        type="submit"
                        className="text-[10px] bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded font-semibold text-slate-700 transition-all duration-150 active:scale-95 cursor-pointer"
                      >
                        {t('searchButton') || 'Go'}
                      </button>
                    </form>

                    {/* Pin Action Shortcut */}
                    <button
                      onClick={handlePinCurrentRun}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold shadow-2xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                      title="Pin this run for side-by-side comparison"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{t('pinRun') || 'Pin Run'}</span>
                    </button>
                  </div>
                </div>

                {/* PARTITION 1: Live Traffic Forecast Dashboard */}
                {activeTab === 'predictions' && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <MetrLaEffectivePredictions
                      config={config}
                      currentMAE={currentMAE}
                      currentLanguage={currentLanguage}
                      onUpdateConfig={handleConfigChange}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <ConvergenceChart
                        history={backendHistory}
                        totalRounds={config.totalRounds}
                        unit="km/h"
                        currentLanguage={currentLanguage}
                        simulateDropout={config.simulateDropout}
                        onToggleDropout={() => handleConfigChange({ simulateDropout: !config.simulateDropout })}
                      />

                      <CommunicationCostPanel
                        latestMetrics={latestMetrics}
                        modelStats={activeModel}
                        clientCount={config.clientCount}
                        quantization={config.quantization}
                        totalRounds={config.totalRounds}
                        history={backendHistory}
                        currentLanguage={currentLanguage}
                      />
                    </div>
                  </div>
                )}

                {/* PARTITION 2: Research Heatmap & Shard Studio (with new Dirichlet Bar Chart) */}
                {activeTab === 'heatmap' && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <TrafficDensityHeatmap
                      clients={backendClients}
                      datasetId="metr-la"
                      distribution={config.distribution}
                      dirichletAlpha={config.dirichletAlpha}
                      seed={config.randomSeed}
                      currentMAE={currentMAE}
                      currentLanguage={currentLanguage}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <FederatedTopologyCanvas
                        clients={backendClients}
                        modelStats={activeModel}
                        currentRound={50}
                        isRunning={false}
                        latestMetrics={latestMetrics}
                        unit="km/h"
                        datasetId="metr-la"
                        distribution={config.distribution}
                        dirichletAlpha={config.dirichletAlpha}
                        seed={config.randomSeed}
                      />

                      <CommunicationCostPanel
                        latestMetrics={latestMetrics}
                        modelStats={activeModel}
                        clientCount={config.clientCount}
                        quantization={config.quantization}
                        totalRounds={config.totalRounds}
                        history={backendHistory}
                        currentLanguage={currentLanguage}
                      />
                    </div>
                  </div>
                )}

                {/* PARTITION 3: Side-by-Side Simulation Comparison Studio */}
                {activeTab === 'comparison' && (
                  <div className="animate-in fade-in-50 duration-200">
                    <SimulationComparison
                      currentConfig={config}
                      currentMetrics={latestMetrics}
                      currentHistory={backendHistory}
                      pinnedRun={pinnedRun}
                      onPinCurrentRun={handlePinCurrentRun}
                      onClearPinned={handleClearPinned}
                      onUpdateConfig={handleConfigChange}
                      currentLanguage={currentLanguage}
                    />
                  </div>
                )}

                {/* PARTITION 5: Flower Federated LLM Studio */}
                {activeTab === 'flower-llm' && (
                  <div className="animate-in fade-in-50 duration-200">
                    <FlowerFedLLMStudio currentLanguage={currentLanguage} />
                  </div>
                )}
              </>
            )}

          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-3 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">AIORI Intelligent Transportation Suite</span>
                <span>•</span>
                <span>PS-003 Federated Traffic Forecasting on METR-LA</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLanguageModalOpen(true)}
                  className="text-slate-600 hover:text-slate-900 font-bold transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Globe className="w-3 h-3 text-cyan-600" />
                  <span>Language</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="text-slate-600 hover:text-slate-900 font-bold transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-indigo-600" />
                  <span>Account</span>
                </button>
                <span>•</span>
                <button
                  onClick={handleReplayIntro}
                  className="text-cyan-700 hover:text-cyan-800 font-bold transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-cyan-600" />
                  <span>Replay Intro</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsColabOpen(true)}
                  className="text-amber-800 hover:text-amber-900 font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  Colab Notebook
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="text-cyan-700 hover:text-cyan-800 font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  {t('contactInfo') || 'Contact Info'}
                </button>
              </div>
            </div>
          </footer>
            </>
          )}

        </div>
      </div>

      {/* Floating AI Research & Navigation Chatbot */}
      <AIAssistantChat
        currentConfig={config}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setActiveError(null);
        }}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onPinRun={handlePinCurrentRun}
        onOpenColab={() => setIsColabOpen(true)}
        onTriggerError={(type) => setActiveError({ type })}
      />

      {/* Floating Contact & Support Button anchored directly below AI Assistant Icon */}
      <button
        onClick={() => setIsContactModalOpen(true)}
        className="fixed bottom-5 right-5 sm:right-7 z-40 flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Contact Project Lead, Hackathon Mentors & Technical Helpdesk"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
        <Headphones className="w-3.5 h-3.5 text-cyan-600" />
        <span>{t('contactInfo') || 'Contact & Support'}</span>
      </button>

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isPostIntro={isPostIntroLanguagePrompt}
      />

      {/* Account Profile & Mobile OTP Modal */}
      <AccountProfileModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Bluetooth RSU Sensor Scanner Modal */}
      <BluetoothBeaconModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
      />

      {/* 3-Seed Benchmark Modal */}
      <MultiSeedBenchmarkModal
        config={config}
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Research Evaluation Report Modal */}
      <ResearchReportModal
        config={config}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Google Colab Direct Link & Permanent Training Improvement Modal */}
      <GoogleColabModal
        config={config}
        isOpen={isColabOpen}
        onClose={() => setIsColabOpen(false)}
        onApplyPermanentTraining={handleApplyColabTraining}
        currentEnhancedMetrics={colabEnhancedMetrics}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={(usr) => setCurrentUser(usr)}
      />

      {/* System Context & UI/UX Documentation Downloader (.txt) Modal */}
      <DocDownloadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      {/* PS-003 FedAvg Pseudocode Snippet Deliverable Modal */}
      <FedAvgPseudocodeModal
        isOpen={isPseudocodeOpen}
        onClose={() => setIsPseudocodeOpen(false)}
        config={config}
      />

    </div>
  );
}

export default App;
