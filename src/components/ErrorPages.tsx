import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  WifiOff, 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  HelpCircle, 
  Mail, 
  CheckCircle2, 
  Home, 
  PhoneCall,
  FileWarning
} from 'lucide-react';

interface ErrorPagesProps {
  initialType?: '404' | 'security' | 'downtime';
  onReturnToDashboard: () => void;
}

export const ErrorPages: React.FC<ErrorPagesProps> = ({
  initialType = '404',
  onReturnToDashboard
}) => {
  const [activeError, setActiveError] = useState<'404' | 'security' | 'downtime'>(initialType);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean>(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetrySuccess(false);
    setTimeout(() => {
      setIsRetrying(false);
      setRetrySuccess(true);
      setTimeout(() => {
        onReturnToDashboard();
      }, 800);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm max-w-4xl mx-auto space-y-6">
      
      {/* Top Selector to preview error states */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <FileWarning className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              System Resilience, Error Handling & Security Advisory
            </h3>
            <p className="text-xs text-slate-500">
              Diagnostic and contingency recovery states for smart city edge networks
            </p>
          </div>
        </div>

        {/* State Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => { setActiveError('404'); setRetrySuccess(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeError === '404'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            404 Not Found
          </button>
          <button
            onClick={() => { setActiveError('security'); setRetrySuccess(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeError === 'security'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Advisory
          </button>
          <button
            onClick={() => { setActiveError('downtime'); setRetrySuccess(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeError === 'downtime'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Downtime / Contact
          </button>
        </div>
      </div>

      {/* 1. 404 Error View */}
      {activeError === '404' && (
        <div className="py-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
            <span className="font-mono text-2xl font-black text-amber-600">404</span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h4 className="text-lg font-bold text-slate-900">Requested Traffic Route Not Found</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The sensor detector station or telemetry endpoint you are attempting to query does not exist in the METR-LA loop inventory or has been retired.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-500 max-w-lg text-left w-full">
            <div>Error Code: <strong>ERR_SENSOR_NODE_UNRESOLVED</strong></div>
            <div>Corridor: /api/v1/metr-la/sensor/unknown</div>
            <div>Suggested Action: Redirect to active freeway loop detectors #773869 or #767541.</div>
          </div>

          <div className="pt-2">
            <button
              onClick={onReturnToDashboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Security & DPDP 2025 Advisory View */}
      {activeError === 'security' && (
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Data Security & Privacy Protocol (DPDP Rules 2025 Compliant)</h4>
              <p className="text-xs text-indigo-800">
                AIORI enforces strict decentralized edge isolation. Zero vehicle identifiers or raw sensor streams are transmitted to central servers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Raw Image / Telemetry Retention
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Raw vehicle loop counts and loop induction records are processed strictly on local edge RSUs. Only mathematical weight gradients ($\Delta w_k$) are communicated.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Differential Privacy & Cryptographic Integrity
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Aggregated updates are bounded by gradient clipping and proximal regularizers ($\mu=0.10$), preventing reconstruction or membership inference attacks.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onReturnToDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Acknowledge & Return</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Service Downtime & Contact Down View */}
      {activeError === 'downtime' && (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <WifiOff className="w-6 h-6 text-rose-600" />
          </div>

          <div className="space-y-1 max-w-md">
            <h4 className="text-base font-bold text-slate-900">Cellular Backhaul Choke / Service Disrupted</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The roadside wireless telemetry link to the central parameter server is experiencing elevated packet latency or temporary downtime. Local RSU edge predictors are operating in autonomous offline cache mode.
            </p>
          </div>

          {/* Contact Support Information */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs w-full max-w-md text-left space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
              <span>Smart City Incident Operations Dispatch:</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>Emergency Ops NOC: <strong className="text-slate-900">+1 (800) 555-METR-LA</strong></div>
              <div>Operations Email: <strong className="text-slate-900">support@aiori-traffic.org</strong></div>
              <div>Status: <strong>Autonomous Fallback RSU Model Active</strong></div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Re-establishing Cellular Link...' : retrySuccess ? 'Link Re-established!' : 'Retry Server Connection'}</span>
            </button>

            <button
              onClick={onReturnToDashboard}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-600" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
