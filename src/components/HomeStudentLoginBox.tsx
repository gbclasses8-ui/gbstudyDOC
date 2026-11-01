import React, { useState } from 'react';
import { LogIn, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Sparkles, Server } from 'lucide-react';
import { loginUser, PRESET_ACCOUNTS } from '../services/api';
import { UserSession } from '../types';

interface HomeStudentLoginBoxProps {
  onLoginSuccess: (session: UserSession, creds?: { phone: string; pass: string }) => void;
  activeSessionsCount: number;
}

export const HomeStudentLoginBox: React.FC<HomeStudentLoginBoxProps> = ({
  onLoginSuccess,
  activeSessionsCount,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      setError('कृपया मोबाइल नंबर और पासवर्ड दोनों भरें।');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const session = await loginUser(cleanPhone, cleanPass);
      onLoginSuccess(session, { phone: cleanPhone, pass: cleanPass });
      setPhone('');
      setPassword('');
      setSuccess('सफलतापूर्वक लॉगिन हो गया! आपके सभी Paid और Free बैच सक्रिय होकर नीचे अनलॉक हो गए हैं।');
      setTimeout(() => setSuccess(null), 6000);
    } catch (err: any) {
      console.error('Home login failed:', err);
      setError(err?.message || 'लॉगिन विफल! कृपया मोबाइल नंबर व पासवर्ड दोबारा जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickServerConnect = async (index: number) => {
    const preset = PRESET_ACCOUNTS[index];
    if (!preset) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const session = await loginUser(preset.phone, preset.password);
      onLoginSuccess(session, { phone: preset.phone, pass: preset.password });
      setSuccess(`${preset.label} कनेक्ट हो गया! सभी 11th/12th कक्षाएं और नोट्स सक्रिय हैं।`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err?.message || 'कनेक्ट विफल!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5 sm:p-6 shadow-2xl pink-glow-sm">
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="max-w-md space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold">
            <LogIn className="w-3.5 h-3.5 text-pink-400" />
            <span>Student Portal Login • Active Accounts ({activeSessionsCount})</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Student Login & Batch Activation
          </h2>

          <p className="text-xs text-zinc-300 leading-relaxed">
            अपना मोबाइल नंबर और पासवर्ड दर्ज करें — आपके खाते के सभी Paid व Free बैच तुरंत एक्टिव होकर अनलॉक हो जाएंगे और सभी छात्र भी देख सकेंगे!
          </p>

          {/* Quick preset 1-click test links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-zinc-500 font-medium">Quick 1-Click Connect:</span>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickServerConnect(0)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-pink-300 font-semibold border border-pink-500/20 transition-colors disabled:opacity-50"
            >
              12th Science Server
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickServerConnect(1)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-pink-300 font-semibold border border-pink-500/20 transition-colors disabled:opacity-50"
            >
              11th Science Server
            </button>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="w-full lg:max-w-md bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                मोबाइल नंबर (Mobile Number)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-md shadow-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>सत्यापित हो रहा है...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login & Activate All Batches</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
