import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.data?.message || 'Verification OTP code generated!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ email, code, newPassword });
      toast.success(res.data?.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF7F6] text-slate-800 flex flex-col justify-between selection:bg-zoho-red selection:text-white">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#E52E2E]"></span>
            <span className="w-3.5 h-3.5 rounded-xs bg-[#10B981]"></span>
            <span className="w-3.5 h-3.5 rounded-xs bg-[#1A73E8]"></span>
            <span className="w-3.5 h-3.5 rounded-xs bg-[#F59E0B]"></span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">StockSense</span>
        </Link>
        <div className="text-xs sm:text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-zoho-red hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md w-full mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-zoho-red flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <div className="fine-line-accent mx-auto my-3" />
          <p className="text-sm text-slate-600 font-normal">
            Secure OTP-based recovery for your StockSense enterprise account
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registered Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red"
                    placeholder="manager@stocksense.com"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                We'll generate a secure 6-digit OTP code to verify your identity before resetting your password.
              </p>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 text-sm font-bold uppercase tracking-wider bg-zoho-red hover:bg-zoho-redHover text-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Send Verification OTP
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  OTP code generated for <strong>{email}</strong>. (In development mode, inspect your server console for the code).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-center tracking-widest text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red"
                  placeholder="123456"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 text-sm font-bold uppercase tracking-wider bg-zoho-red hover:bg-zoho-redHover text-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Confirm & Reset Password
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                ← Change email address
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zoho-red hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer fine line */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200">
        © 2026 StockSense Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
};
