import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Check, 
  Copy, 
  Layers, 
  Sparkles, 
  BookOpen,
  Cpu,
  Palette,
  ExternalLink
} from 'lucide-react';
import { 
  APP_CONTEXT_TXT, 
  UI_UX_SPEC_TXT, 
  ARCHITECTURE_SPEC_TXT, 
  FULL_APPLICATION_SPECIFICATION_MD,
  downloadTxtFile, 
  downloadAllDocsBundle 
} from '../utils/docsContent';

interface DocDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocDownloadModal: React.FC<DocDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'context' | 'uiux' | 'architecture' | 'fullspec'>('fullspec');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getDocData = () => {
    switch (activeTab) {
      case 'fullspec':
        return {
          title: 'FULL_APPLICATION_SPECIFICATION.md',
          label: 'Complete App Spec (.md)',
          desc: 'Comprehensive engineering document: technology stack, 4 partitions, edge algorithms, and project directory.',
          content: FULL_APPLICATION_SPECIFICATION_MD,
          icon: Layers,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          mimeType: 'text/markdown;charset=utf-8'
        };
      case 'context':
        return {
          title: '01_AIORI_PS003_SYSTEM_CONTEXT_AND_OBJECTIVES.txt',
          label: 'App Context & PS-003 Overview',
          desc: 'Problem statement, METR-LA 207-sensor dataset, Dirichlet non-IID sharding, and edge privacy.',
          content: APP_CONTEXT_TXT,
          icon: BookOpen,
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
          mimeType: 'text/plain;charset=utf-8'
        };
      case 'uiux':
        return {
          title: '02_UI_UX_DESIGN_SPECIFICATION_AND_GUIDELINES.txt',
          label: 'UI / UX Design Specification',
          desc: 'Caltrans ATMS aesthetic, 4 application partitions, color tokens, and 8-language localization.',
          content: UI_UX_SPEC_TXT,
          icon: Palette,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          mimeType: 'text/plain;charset=utf-8'
        };
      case 'architecture':
        return {
          title: '03_FEDERATED_TRAFFIC_SYSTEM_ARCHITECTURE.txt',
          label: 'Mathematical & FL System Architecture',
          desc: 'FedAvg equations, INT8 affine quantization (75% savings), and chronological train-test splits.',
          content: ARCHITECTURE_SPEC_TXT,
          icon: Cpu,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          mimeType: 'text/plain;charset=utf-8'
        };
    }
  };

  const currentDoc = getDocData();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    downloadTxtFile(currentDoc.title, currentDoc.content, currentDoc.mimeType);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 p-0.5 shadow-md shadow-cyan-900/20 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  System Context, UI/UX & Full Application Spec (.md / .txt)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-300">
                  PS-003 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Download complete specifications for software architecture, research context, and interface design in Markdown or Text.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100/70 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('fullspec')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'fullspec'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Full App Spec (.md)</span>
            </button>

            <button
              onClick={() => setActiveTab('context')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'context'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. App Context & PS-003</span>
            </button>

            <button
              onClick={() => setActiveTab('uiux')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'uiux'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>3. UI/UX Design Spec</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>4. Federated Architecture</span>
            </button>
          </div>

          {/* Quick Actions: Download All Bundle */}
          <button
            onClick={downloadAllDocsBundle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 ml-auto"
            title="Download all documents in a single formatted bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Bundle</span>
          </button>
        </div>

        {/* Content Preview & Download Actions */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-5">
          {/* Active File Meta Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {currentDoc.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentDoc.badgeColor}`}>
                  {currentDoc.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentDoc.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadCurrent}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {currentDoc.title.endsWith('.md') ? '.md' : '.txt'}</span>
              </button>
            </div>
          </div>

          {/* Textarea Reader Preview */}
          <div className="flex-1 min-h-[300px] rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-y-auto leading-relaxed shadow-inner select-text">
            <pre className="whitespace-pre-wrap break-words">{currentDoc.content}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Caltrans ATMS Digital Twin</span>
            <span>•</span>
            <span>METR-LA: 207 Sensors</span>
            <span>•</span>
            <span className="text-cyan-700 font-bold">INT8: -75% Bandwidth</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCurrent}
              className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Instant Download ({currentDoc.title})</span>
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
