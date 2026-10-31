import React from 'react';
import { 
  LineChart, 
  Flame, 
  GitCompare, 
  Layers, 
  FileText, 
  Terminal, 
  Play, 
  ShieldCheck, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  FileWarning, 
  Database,
  Radio,
  Sliders,
  Sparkles,
  ExternalLink,
  LogIn,
  CheckCircle2,
  Globe,
  Bluetooth,
  Smartphone,
  Download,
  Code2
} from 'lucide-react';
import { SupabaseUser } from '../services/supabase';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';
import { ColabEnhancedMetrics } from './GoogleColabModal';

interface SidebarProps {
  activeTab: 'predictions' | 'heatmap' | 'comparison' | '3d-twin' | 'flower-llm';
  onSelectTab: (tab: 'predictions' | 'heatmap' | 'comparison' | '3d-twin' | 'flower-llm') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenBenchmark: () => void;
  onOpenReport: () => void;
  onOpenColab: () => void;
  onReplayIntro: () => void;
  onOpenAuth: () => void;
  onOpenLanguage?: () => void;
  onOpenBluetooth?: () => void;
  onOpenAccount?: () => void;
  onOpenDocs?: () => void;
  onOpenPseudocode?: () => void;
  currentLanguage: SupportedLanguage;
  colabEnhancedMetrics?: ColabEnhancedMetrics | null;
  onTriggerError: (type: '404' | 'security' | 'downtime') => void;
  currentUser: SupabaseUser | null;
  pinnedRunCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenBenchmark,
  onOpenReport,
  onOpenColab,
  onReplayIntro,
  onOpenAuth,
  onOpenLanguage,
  onOpenBluetooth,
  onOpenAccount,
  onOpenDocs,
  onOpenPseudocode,
  currentLanguage,
  colabEnhancedMetrics,
  onTriggerError,
  currentUser,
  pinnedRunCount
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 z-30 shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Section: App Branding & Collapse Toggle */}
      <div>
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>AIORI PS-003</span>
                  <span className="text-[9px] px-1.5 py-0.2 font-mono bg-cyan-50 text-cyan-700 rounded border border-cyan-200">
                    Suite
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  METR-LA FL Prediction
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 1. Primary Application Partitions Section */}
        <div className="p-3 space-y-1">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('appPartitions') || 'Application Partitions'}
            </div>
          )}

          {/* Partition 1: Live Forecast Dashboard */}
          <button
            onClick={() => onSelectTab('predictions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
              activeTab === 'predictions'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
            title="Partition 1: Live Traffic Forecast Dashboard"
          >
            <LineChart className={`w-4 h-4 shrink-0 ${activeTab === 'predictions' ? 'text-white' : 'text-cyan-600'}`} />
            {!isCollapsed && (
              <div className="text-left truncate">
                <div className="truncate">{t('partition1') || '1. Live Forecast'}</div>
                <div className={`text-[10px] font-normal truncate ${activeTab === 'predictions' ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {t('partition1Desc') || 'Corridors & Horizons'}
                </div>
              </div>
            )}
          </button>

          {/* Partition 2: Heatmap & Shard Studio */}
          <button
            onClick={() => onSelectTab('heatmap')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
            title="Partition 2: Research Heatmap & Dirichlet Shard Studio"
          >
            <Flame className={`w-4 h-4 shrink-0 ${activeTab === 'heatmap' ? 'text-white' : 'text-amber-500'}`} />
            {!isCollapsed && (
              <div className="text-left truncate">
                <div className="truncate">{t('partition2') || '2. Heatmap & Shards'}</div>
                <div className={`text-[10px] font-normal truncate ${activeTab === 'heatmap' ? 'text-amber-100' : 'text-slate-400'}`}>
                  {t('partition2Desc') || 'Non-IID Bar Charts & Matrix'}
                </div>
              </div>
            )}
          </button>

          {/* Partition 3: Simulation Comparison Studio */}
          <button
            onClick={() => onSelectTab('comparison')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
            title="Partition 3: Simulation Comparison Studio"
          >
            <div className="relative shrink-0">
              <GitCompare className={`w-4 h-4 ${activeTab === 'comparison' ? 'text-white' : 'text-indigo-600'}`} />
              {pinnedRunCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
            {!isCollapsed && (
              <div className="text-left truncate">
                <div className="flex items-center justify-between">
                  <span className="truncate">{t('partition3') || '3. Run Comparison'}</span>
                  {pinnedRunCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-bold ml-1">
                      Pinned
                    </span>
                  )}
                </div>
                <div className={`text-[10px] font-normal truncate ${activeTab === 'comparison' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {t('partition3Desc') || 'Baseline vs Current Diff'}
                </div>
              </div>
            )}
          </button>

          {/* Partition 4: 3D Website & Digital Twin Studio */}
          <button
            onClick={() => onSelectTab('3d-twin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
              activeTab === '3d-twin'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
            title="Partition 4: 3D Digital Twin & Procedural Highway Studio"
          >
            <div className="relative shrink-0">
              <Sparkles className={`w-4 h-4 ${activeTab === '3d-twin' ? 'text-cyan-200' : 'text-cyan-600'}`} />
            </div>
            {!isCollapsed && (
              <div className="text-left truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{t('partition3D') || '4. 3D Digital Twin'}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-700 font-mono">
                    3D
                  </span>
                </div>
                <div className={`text-[10px] font-normal truncate ${activeTab === '3d-twin' ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {t('partition3DDesc') || 'Procedural RSU Node & Highway'}
                </div>
              </div>
            )}
          </button>

          {/* Partition 5: Flower Federated LLM Studio */}
          <button
            onClick={() => onSelectTab('flower-llm')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
              activeTab === 'flower-llm'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
            }`}
            title="Partition 5: Flower Federated LLM Studio (flwrlabs/flower)"
          >
            <div className="relative shrink-0">
              <Radio className={`w-4 h-4 ${activeTab === 'flower-llm' ? 'text-white' : 'text-indigo-600'}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="text-left truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">5. Flower FedLLM</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-700 font-mono font-bold">
                    Flower
                  </span>
                </div>
                <div className={`text-[10px] font-normal truncate ${activeTab === 'flower-llm' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  PEFT LoRA & AI Reasoning
                </div>
              </div>
            )}
          </button>
        </div>

        {/* 2. Research Tools & Deliverables */}
        <div className="p-3 pt-1 space-y-1 border-t border-slate-100">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('researchDeliverables') || 'Research Deliverables'}
            </div>
          )}

          {/* Language Selection Option */}
          {onOpenLanguage && (
            <button
              onClick={onOpenLanguage}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 active:scale-95 cursor-pointer"
              title="8 Indian & Southern Indian Languages"
            >
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full truncate">
                  <span className="truncate">Language ({currentLangObj.nativeName})</span>
                  <span className="text-xs">{currentLangObj.flag}</span>
                </div>
              )}
            </button>
          )}

          {/* Bluetooth Sensor Permission */}
          {onOpenBluetooth && (
            <button
              onClick={onOpenBluetooth}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Open Bluetooth & Scan RSUs"
            >
              <Bluetooth className="w-4 h-4 text-sky-600 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{t('bluetoothSensor') || 'Bluetooth RSU Sensors'}</span>
              )}
            </button>
          )}

          {/* Account & Mobile OTP */}
          {onOpenAccount && (
            <button
              onClick={onOpenAccount}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-150 active:scale-95 cursor-pointer"
              title="User Account, Location & Mobile OTP"
            >
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{t('accountProfile') || 'Account & Mobile OTP'}</span>
              )}
            </button>
          )}

          {/* 3-Seed Benchmark Matrix */}
          <button
            onClick={onOpenBenchmark}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 active:scale-95 cursor-pointer"
            title="3-Seed Verification Matrix (Seeds 42, 101, 2024)"
          >
            <Layers className="w-4 h-4 text-purple-600 shrink-0" />
            {!isCollapsed && <span className="truncate">{t('benchmark3Seed') || '3-Seed Benchmark'}</span>}
          </button>

          {/* Research Compliance Report */}
          <button
            onClick={onOpenReport}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 active:scale-95 cursor-pointer"
            title="PS-003 Research Evaluation Report"
          >
            <FileText className="w-4 h-4 text-sky-600 shrink-0" />
            {!isCollapsed && <span className="truncate">{t('researchReport') || 'Research Report'}</span>}
          </button>

          {/* PS-003 FedAvg Pseudocode Deliverable */}
          {onOpenPseudocode && (
            <button
              onClick={onOpenPseudocode}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-cyan-800 hover:bg-cyan-50 hover:text-cyan-950 transition-all duration-150 active:scale-95 cursor-pointer"
              title="PS-003 FedAvg Pseudocode & Theoretical Aggregation"
            >
              <Code2 className="w-4 h-4 text-cyan-600 shrink-0" />
              {!isCollapsed && <span className="truncate">FedAvg Pseudocode</span>}
            </button>
          )}

          {/* System & UI/UX Specs .txt Downloader */}
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-indigo-700 hover:bg-indigo-50 hover:text-indigo-950 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Download UI/UX Design Specs & Problem Context (.txt)"
            >
              <Download className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && <span className="truncate">Download Docs (.txt)</span>}
            </button>
          )}

          {/* Google Colab Backend GPU Terminal & Synchronizer */}
          <button
            onClick={onOpenColab}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-950 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Google Colab Direct Link & Permanent Model Improvement"
          >
            <Terminal className="w-4 h-4 text-amber-600 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full truncate">
                <span className="truncate">{t('colabBackend') || 'Colab Backend'}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  colabEnhancedMetrics?.isPermanent 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {colabEnhancedMetrics?.isPermanent ? `${colabEnhancedMetrics.enhancedMAE} MAE` : '.venv'}
                </span>
              </div>
            )}
          </button>

          {/* Replay Traffic Intro Animation */}
          <button
            onClick={onReplayIntro}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Replay Highway Traffic Simulation Intro"
          >
            <Play className="w-4 h-4 text-cyan-600 shrink-0" />
            {!isCollapsed && <span className="truncate">{t('replayIntro') || 'Replay Traffic Intro'}</span>}
          </button>
        </div>
      </div>

      {/* Bottom Section: User Auth & Diagnostics */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        {/* User Profile / Connect with Google */}
        <button
          onClick={onOpenAuth}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
            currentUser
              ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-2xs font-bold'
          }`}
          title={currentUser ? `Logged in as ${currentUser.displayName || currentUser.email}` : 'Connect with Google'}
        >
          {currentUser ? (
            <div className="flex items-center gap-2.5 truncate w-full text-xs">
              <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              {!isCollapsed && (
                <div className="text-left truncate">
                  <div className="font-bold text-slate-800 truncate text-[11px]">
                    {currentUser.displayName || 'Authorized User'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">
                    {currentUser.email || 'Google Connected'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs py-0.5 w-full">
              <LogIn className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{t('connectGoogle') || 'Connect with Google'}</span>}
            </div>
          )}
        </button>

        {/* Resilience Testing Trigger */}
        {!isCollapsed && (
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Resilience Test:</span>
            <button
              onClick={() => onTriggerError('404')}
              className="text-slate-500 hover:text-rose-600 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Test 404 Route Error"
            >
              404
            </button>
            <span>•</span>
            <button
              onClick={() => onTriggerError('security')}
              className="text-slate-500 hover:text-indigo-600 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Test Security Advisory"
            >
              Security
            </button>
            <span>•</span>
            <button
              onClick={() => onTriggerError('downtime')}
              className="text-slate-500 hover:text-amber-600 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Test Downtime Error"
            >
              Down
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
