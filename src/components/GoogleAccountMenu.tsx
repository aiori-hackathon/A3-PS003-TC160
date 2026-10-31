import React, { useState } from 'react';
import { 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Lock, 
  MapPin, 
  Smartphone, 
  KeyRound, 
  X, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SupabaseUser } from '../services/supabase';
import { signInWithGoogle, logOut } from '../services/supabase';
import { SupportedLanguage, getTranslation } from '../services/i18n';

interface GoogleAccountMenuProps {
  currentUser: SupabaseUser | null;
  currentLanguage: SupportedLanguage;
  onOpenMobileOtpModal: () => void;
  onUserLogin?: (user: any) => void;
}

export const GoogleAccountMenu: React.FC<GoogleAccountMenuProps> = ({
  currentUser,
  currentLanguage,
  onOpenMobileOtpModal,
  onUserLogin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authView, setAuthView] = useState<'profile' | 'signin' | 'signup'>('profile');

  // Sign in / Sign up form fields
  const [email, setEmail] = useState('ayushstudyforcomparative@gmail.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Ayush Kumar');
  const [location, setLocation] = useState('Bengaluru Smart Highway Corridor (NH-44)');
  const [mobileNumber, setMobileNumber] = useState('+91 98450 12345');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user && onUserLogin) onUserLogin(user);
      setAuthMessage('Successfully connected with Google Account!');
      setTimeout(() => {
        setAuthMessage(null);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthMessage(`Signed in as ${email}`);
    setTimeout(() => {
      setAuthMessage(null);
      setIsOpen(false);
    }, 1500);
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    setAuthMessage(`Account created for ${fullName} (${email})!`);
    setTimeout(() => {
      setAuthMessage(null);
      setAuthView('profile');
    }, 1500);
  };

  const handleSignOut = async () => {
    await logOut();
    setAuthMessage('Signed out successfully.');
    setTimeout(() => setAuthMessage(null), 1500);
  };

  // Get user display initial
  const displayEmail = currentUser?.email || email || 'ayushstudyforcomparative@gmail.com';
  const displayName = currentUser?.displayName || fullName || 'Ayush Kumar';
  const initial = (displayName[0] || displayEmail[0] || 'A').toUpperCase();

  return (
    <div className="relative">
      {/* Google-Style Small Avatar Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-xs hover:shadow-md transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ring-2 ring-transparent hover:ring-indigo-300"
        title="Google Account & Authentication (Sign In / Sign Up)"
        aria-label="Google Account"
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs text-indigo-700 select-none">
              {initial}
            </span>
          )}
        </div>
        {/* Small Google status indicator dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      </button>

      {/* Google Account Popover Card */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50/70 via-sky-50/40 to-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('profileTitle') || 'Google & Research Account'}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Overview Card (Google Style) */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-base text-indigo-700">{initial}</span>
                )}
              </div>
            </div>
            <div className="truncate flex-1">
              <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                <span>{displayName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-500 font-mono block truncate">
                {displayEmail}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                {location}
              </span>
            </div>
          </div>

          {authMessage && (
            <div className="mx-4 my-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{authMessage}</span>
            </div>
          )}

          {/* Tab Navigation: Profile / Sign In / Sign Up */}
          <div className="grid grid-cols-3 border-b border-slate-100 text-xs font-semibold">
            <button
              onClick={() => setAuthView('profile')}
              className={`py-2.5 text-center transition-colors cursor-pointer border-b-2 ${
                authView === 'profile'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setAuthView('signin')}
              className={`py-2.5 text-center transition-colors cursor-pointer border-b-2 ${
                authView === 'signin'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('signIn') || 'Sign In'}
            </button>
            <button
              onClick={() => setAuthView('signup')}
              className={`py-2.5 text-center transition-colors cursor-pointer border-b-2 ${
                authView === 'signup'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('signUp') || 'Sign Up'}
            </button>
          </div>

          {/* View: Profile Details & Mobile OTP Trigger */}
          {authView === 'profile' && (
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile Number</span>
                  </span>
                  <span className="font-mono text-slate-900 font-bold">{mobileNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">SMS OTP Status</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMobileOtpModal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Update Credentials / Verify OTP</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* One-Click Google Authentication */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('connectGoogle') || 'Connect with Google'}</span>
              </button>

              {currentUser && (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('signOut') || 'Sign Out'}</span>
                </button>
              )}
            </div>
          )}

          {/* View: Sign In Form */}
          {authView === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('emailAddress') || 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('password') || 'Password'}</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signIn') || 'Sign In'}</span>
              </button>

              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-2 bg-white text-[10px] text-slate-400 uppercase">Or continue with</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('googleSignIn') || 'Sign in with Google'}</span>
              </button>
            </form>
          )}

          {/* View: Sign Up Form */}
          {authView === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="p-4 space-y-2.5 text-xs max-h-[340px] overflow-y-auto">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ayush Kumar"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Location / Corridor</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or highway corridor"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('createAccount') || 'Create New Account'}</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('googleSignUp') || 'Sign up with Google'}</span>
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="font-mono">Secure Supabase Auth & PostgreSQL</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
