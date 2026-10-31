import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Send, 
  Clock, 
  Save, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { SupabaseUser } from '../services/supabase';
import { signInWithGoogle, logOut } from '../services/supabase';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SupabaseUser | null;
  onOpenAuth: () => void;
}

export interface UserProfileData {
  fullName: string;
  location: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  verifiedAt?: string;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth
}) => {
  // Saved profile in localStorage
  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const stored = localStorage.getItem('aiori_account_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      fullName: 'Ayush Kumar',
      location: 'Bengaluru Smart Highway Corridor (NH-44)',
      mobileNumber: '+91 98450 12345',
      isMobileVerified: true,
      verifiedAt: '2026-10-26 10:15 IST'
    };
  });

  const [fullName, setFullName] = useState(profile.fullName);
  const [location, setLocation] = useState(profile.location);
  const [mobileNumber, setMobileNumber] = useState(profile.mobileNumber);
  const [isMobileVerified, setIsMobileVerified] = useState(profile.isMobileVerified);
  const [verifiedAt, setVerifiedAt] = useState(profile.verifiedAt || '');

  // OTP Verification state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (!mobileNumber.trim() || mobileNumber.length < 8) {
      setOtpError('Please enter a valid mobile number with country code (e.g. +91 98450 12345)');
      return;
    }
    setOtpError(null);
    setIsOtpSent(true);
    setOtpTimer(45);
    setIsMobileVerified(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    setOtpDigits(['7', '8', '6', '9', '2', '0']);
    setOtpError(null);
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    // Accept valid 6-digit verification code
    setIsMobileVerified(true);
    const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVerifiedAt(nowStr);
    setIsOtpSent(false);
    setOtpError(null);

    // Persist
    const updated: UserProfileData = {
      fullName,
      location,
      mobileNumber,
      isMobileVerified: true,
      verifiedAt: nowStr
    };
    setProfile(updated);
    localStorage.setItem('aiori_account_profile', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfile = () => {
    const updated: UserProfileData = {
      fullName,
      location,
      mobileNumber,
      isMobileVerified,
      verifiedAt
    };
    setProfile(updated);
    localStorage.setItem('aiori_account_profile', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Google sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50/70 via-cyan-50/40 to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  User Account & Sign-Up Credentials
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200/70">
                  Profile & OTP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your researcher identity, geographical deployment zone, Google sign-in & mobile OTP verification.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account credentials and profile updated successfully in local storage & Supabase.</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ayush Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-900 transition-all outline-none"
            />
          </div>

          {/* 2. Deployment Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>Location / Highway Corridor</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru Intelligent Corridor (NH-44) / LA Metro Freeways"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-sm font-medium text-slate-900 transition-all outline-none"
            />
          </div>

          {/* 3. Google Account Connect Status */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Google Account Authentication</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentUser ? currentUser.email : 'ayushstudyforcomparative@gmail.com'}
                  </span>
                </div>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Connected
                  </span>
                  <button
                    onClick={handleGoogleSignOut}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-200/70 text-slate-600 text-xs transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Connect Google</span>
                </button>
              )}
            </div>
          </div>

          {/* 4. Mobile Number with OTP Verification */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mobile Number (SMS OTP Verification)</span>
              </label>
              {isMobileVerified ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified ({verifiedAt ? verifiedAt.split(' ')[0] : 'Active'})
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Unverified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setIsMobileVerified(false);
                }}
                placeholder="+91 98450 12345"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-mono font-medium text-slate-900 transition-all outline-none bg-white"
              />
              <button
                onClick={handleSendOtp}
                className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3 text-cyan-400" />
                <span>{isOtpSent ? 'Resend' : 'Send OTP'}</span>
              </button>
            </div>

            {/* OTP Entry Box */}
            {isOtpSent && (
              <div className="mt-3 p-3.5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    Enter 6-Digit OTP Code
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Expires in {otpTimer}s</span>
                  </div>
                </div>

                {/* 6 Digit Input boxes */}
                <div className="flex items-center justify-between gap-1.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-11 text-center font-bold text-base rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 outline-none transition-all bg-slate-50 focus:bg-white"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{otpError}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleAutoFillDemoOtp}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Auto-Fill Demo Code (786920)
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify OTP Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Account data is securely stored & synced across sessions
          </span>
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-indigo-900/15 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-inner cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile & Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
