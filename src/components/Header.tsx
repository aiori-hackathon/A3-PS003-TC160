import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Globe, 
  ChevronDown,
  FileText,
  CheckCircle2,
  Code2,
  Activity
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';
import { GoogleAccountMenu } from './GoogleAccountMenu';
import { SupabaseUser } from '../services/supabase';
import { SimulationConfig } from '../types/federated';
import { DataLeakageAuditBadge } from './DataLeakageAuditBadge';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onOpenLanguage: () => void;
  currentUser: SupabaseUser | null;
  onOpenMobileOtpModal: () => void;
  onUserLogin?: (user: any) => void;
  onOpenDocs?: () => void;
  currentMAE?: number;
  currentRound?: number;
  isTraining?: boolean;
  onOpenPseudocode?: () => void;
  config?: SimulationConfig;
  onUpdateConfig?: (partial: Partial<SimulationConfig>) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentLanguage,
  onOpenLanguage,
  currentUser,
  onOpenMobileOtpModal,
  onUserLogin,
  onOpenDocs,
  currentMAE,
  currentRound,
  isTraining,
  onOpenPseudocode,
  config,
  onUpdateConfig
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Subtle CSS transition animation for MAE badge (Smooth background fade without scale effect)
  const [isFading, setIsFading] = useState<boolean>(false);
  const prevMaeRef = useRef<number | undefined>(currentMAE);

  useEffect(() => {
    if (
      currentMAE !== undefined &&
      prevMaeRef.current !== undefined &&
      currentMAE !== prevMaeRef.current
    ) {
      setIsFading(true);
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 700);
      prevMaeRef.current = currentMAE;
      return () => clearTimeout(timer);
    }
    prevMaeRef.current = currentMAE;
  }, [currentMAE, currentRound]);

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* App Brand & Description */}
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-900/10 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                {t('appTitle') || 'AIORI PS-003 Research Suite'}
              </h1>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {t('appSubtitle') || 'Federated Traffic-Flow Forecasting & Communication-Cost Evaluator (METR-LA)'}
              </p>
            </div>
          </div>

          {/* Center / Right Status Badges: Data Leakage Audit Badge + Live MAE Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* PS-003 Data Leakage Audit Badge (Warning if Training and Validation overlap) */}
            {config && (
              <DataLeakageAuditBadge
                config={config}
                onUpdateConfig={onUpdateConfig}
              />
            )}

            {/* Live MAE Badge with subtle CSS background fade animation */}
            {currentMAE !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold transition-colors duration-700 ease-out shadow-2xs select-none ${
                  isFading
                    ? 'bg-emerald-200/90 border-emerald-400 text-emerald-950'
                    : 'bg-emerald-50 border-emerald-300/80 text-emerald-800'
                }`}
                title="Global Out-of-Sample Test MAE across METR-LA Highway Network"
              >
                {isTraining ? (
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 transition-colors duration-700 ${
                      isFading ? 'text-emerald-900' : 'text-emerald-600'
                    }`}
                  />
                )}
                <span>MAE: {currentMAE.toFixed(2)} km/h</span>
                {currentRound !== undefined && (
                  <span className="text-[10px] text-slate-500 font-normal hidden md:inline">
                    (R{currentRound})
                  </span>
                )}
              </div>
            )}

            {/* PS-003 FedAvg Pseudocode Deliverable Button */}
            {onOpenPseudocode && (
              <button
                onClick={onOpenPseudocode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-900 text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shadow-2xs"
                title="View FedAvg Pseudocode & Theoretical Aggregation Deliverable (PS-003)"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-700" />
                <span>Pseudocode</span>
              </button>
            )}

            {/* Documentation & UI/UX Specs .txt Downloader */}
            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shadow-2xs"
                title="Download UI/UX Design Specs & Problem Context (.txt)"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Docs (.txt)</span>
              </button>
            )}

            {/* Language Selection Button with Flag & Name */}
            <button
              onClick={onOpenLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shadow-2xs"
              title="Change Platform Language (8 Indian & Southern Indian Languages)"
            >
              <span className="text-base leading-none select-none">{currentLangObj.flag}</span>
              <span className="hidden lg:inline font-semibold">{currentLangObj.nativeName}</span>
              <Globe className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Google-Style User Icon & Sign In / Sign Up Popover Menu */}
            <GoogleAccountMenu
              currentUser={currentUser}
              currentLanguage={currentLanguage}
              onOpenMobileOtpModal={onOpenMobileOtpModal}
              onUserLogin={onUserLogin}
            />
          </div>

        </div>
      </div>
    </header>
  );
};
