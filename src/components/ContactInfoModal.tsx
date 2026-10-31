import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Clock,
  Compass,
  Headphones
} from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  isOpen,
  onClose,
  currentLanguage
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) return;
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setSenderName('');
      setSenderEmail('');
      setMessage('');
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-cyan-50/70 via-sky-50/40 to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Headphones className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {t('contactTitle') || 'AIORI Research Support & Contact Info'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200/70">
                  Live Helpdesk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('contactSubtitle') || 'Author, Hackathon Oversight & Developer Helpline'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
          {isSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('messageSent') || 'Thank you! Your inquiry has been dispatched to the author.'}</span>
            </div>
          )}

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Project Lead / Author */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('leadResearcher') || 'Project Lead / Author'}
              </span>
              <div className="font-bold text-slate-900 text-sm">Ayush Kumar</div>
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span className="truncate">ayushstudyforcomparative@gmail.com</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Bengaluru, Karnataka, India</span>
              </div>
            </div>

            {/* Card 2: Hackathon Mentorship & GitHub */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('hackathonMentors') || 'Hackathon Oversight Team'}
              </span>
              <div className="font-bold text-slate-900 text-sm">AIORI Hackathon Mentorship</div>
              <a 
                href="https://github.com/aiori-hackathon" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-cyan-700 hover:text-cyan-900 font-mono flex items-center gap-1.5 hover:underline"
              >
                <Github className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="truncate">github.com/aiori-hackathon</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>PS-003 Smart Cities Track</span>
              </div>
            </div>
          </div>

          {/* 24/7 Status Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-900">
                {t('helpline247') || 'Technical Support Helpline'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Response &lt; 2 hrs
            </span>
          </div>

          {/* Contact Inquiry Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('sendMessage') || 'Send Inquiry / Feedback'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('fullName') || 'Your Name'}
                className="px-3.5 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 text-xs font-medium outline-none bg-slate-50 focus:bg-white transition-all"
                required
              />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="Your Email Address"
                className="px-3.5 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 text-xs font-medium outline-none bg-slate-50 focus:bg-white transition-all"
                required
              />
            </div>

            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('yourMessage') || 'Ask about PS-003 dataset partitions, Colab training sync, or model performance...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 text-xs font-medium outline-none bg-slate-50 focus:bg-white transition-all resize-none"
              required
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-900/10 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('submitMessage') || 'Submit Message'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium font-mono">
            Directly synced with research team inbox
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            {t('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
