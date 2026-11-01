import React, { useState } from 'react';
import { 
  LogIn, 
  Phone, 
  Lock, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';
import { loginUser } from '../services/api';
import { UserSession } from '../types';

interface StudentLoginGateProps {
  onLoginSuccess: (session: UserSession, creds: { phone: string; pass: string }) => void;
  onOpenTelegram: () => void;
  onAdminTrigger?: () => void;
  adminClickCount?: number;
}

export const StudentLoginGate: React.FC<StudentLoginGateProps> = ({
  onLoginSuccess,
  onOpenTelegram,
  onAdminTrigger,
  adminClickCount = 0,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      setError('कृपया मोबाइल नंबर और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await loginUser(cleanPhone, cleanPass);
      onLoginSuccess(session, { phone: cleanPhone, pass: cleanPass });
    } catch (err: any) {
      console.error('Login gate error:', err);
      setError(err?.message || 'लॉगिन विफल! कृपया अपना मोबाइल नंबर और पासवर्ड सही से जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top minimal bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAdminTrigger}
            className="w-10 h-10 rounded-xl overflow-hidden border border-pink-500/40 p-0.5 bg-zinc-900 shadow-md shadow-pink-500/10 active:scale-95 transition-transform"
            title={adminClickCount > 0 ? `Click ${10 - adminClickCount} more times for Admin` : 'GB STUDY'}
          >
            <img src="/logo.png" alt="GB STUDY" className="w-full h-full object-cover rounded-lg" />
          </button>
          <div>
            <span className="text-base font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              GB STUDY
            </span>
            <span className="block text-[10px] text-zinc-400 font-medium">Student Portal</span>
          </div>
        </div>

        <button
          onClick={onOpenTelegram}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-all hover:scale-105"
        >
          <Send className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
          <span>Telegram Join</span>
        </button>
      </header>

      {/* Main Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500 p-1 bg-zinc-950 shadow-xl shadow-pink-500/20 mb-4 animate-in zoom-in-95 duration-300">
              <img src="/logo.png" alt="GB STUDY" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Student Login
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400 max-w-xs leading-relaxed">
              वेबसाइट में प्रवेश करने के लिए अपना मोबाइल नंबर और पासवर्ड दर्ज करें।
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="mt-5 grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 text-center">
            <div className="flex flex-col items-center">
              <BookOpen className="w-4 h-4 text-pink-400 mb-1" />
              <span className="text-[10px] font-semibold text-zinc-300">11th & 12th</span>
              <span className="text-[9px] text-zinc-500">All Batches</span>
            </div>
            <div className="flex flex-col items-center border-x border-zinc-800">
              <Sparkles className="w-4 h-4 text-pink-400 mb-1" />
              <span className="text-[10px] font-semibold text-zinc-300">Live & Rec</span>
              <span className="text-[9px] text-zinc-500">2,600+ Lectures</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] font-semibold text-zinc-300">Free Notes</span>
              <span className="text-[9px] text-zinc-500">Handwritten PDFs</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                मोबाइल नंबर / Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                पासवर्ड / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सत्यापित किया जा रहा है... (Logging In)</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login & Enter GB STUDY</span>
                </>
              )}
            </button>
          </form>

          {/* Sync Notice */}
          <div className="mt-5 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-300/90 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <span>
              आपके लॉगिन करते ही आपके बैच सभी छात्रों के लिए भी ऑटोमैटिक अनलॉक हो जाएंगे।
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 text-center text-xs text-zinc-500">
        GB STUDY &copy; {new Date().getFullYear()} &bull; Disha Online Classes Bihar Board Study Portal
      </footer>
    </div>
  );
};
