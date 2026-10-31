import React from 'react';
import { 
  Languages, 
  Check, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  X,
  Compass
} from 'lucide-react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  getTranslation 
} from '../services/i18n';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isPostIntro?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  isPostIntro = false
}) => {
  if (!isOpen) return null;

  const t = (key: string) => getTranslation(currentLanguage, key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with decorative radiant badge */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-cyan-50/70 via-sky-50/40 to-white">
          {!isPostIntro && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150 active:scale-95 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {t('selectLanguage') || 'Select Your Preferred Language'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200/70">
                  8 Indian Languages
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('selectLanguageDesc') || 'Choose from 8 major Indian & Southern Indian languages for real-time translation across the entire platform.'}
              </p>
            </div>
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50/90 border-cyan-400/90 shadow-md shadow-cyan-900/5 ring-2 ring-cyan-400/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-xs select-none">{lang.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {lang.nativeName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({lang.name})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang.region}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 hover:border-cyan-400 flex items-center justify-center text-transparent">
                        <Check className="w-3 h-3 text-slate-300" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Southern India Focus Badge */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5 text-xs text-slate-600">
            <Compass className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              Full Southern Indian language coverage included: <strong>Kannada (ಕನ್ನಡ)</strong>, <strong>Tamil (தமிழ்)</strong>, <strong>Telugu (తెలుగు)</strong>, and <strong>Malayalam (മലയാളം)</strong>, plus Hindi, Marathi, Bengali & English.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Translations instantly update all dashboard corridors and models</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-900/15 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-inner cursor-pointer"
          >
            <span>{t('continueToApp') || 'Apply & Continue to Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
