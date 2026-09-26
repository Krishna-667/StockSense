import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Boxes,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  ArrowLeftRight,
  Truck,
  Sparkles,
  Search,
  ChevronDown,
  Building2,
  BarChart3,
  Smartphone,
  ExternalLink,
  Phone,
  MessageSquare,
  ChevronRight,
  Check,
  Star,
  Users,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Captcha } from '../../components/ui/Captcha';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  station: z.string().optional(),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentCaptcha, setCurrentCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [locationName, setLocationName] = useState('Tamil Nadu, India');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'demo'
  const [testimonialIndex, setTestimonialIndex] = useState(1);
  const [showAiModal, setShowAiModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      station: 'manager',
    },
  });

  const onSubmit = async (data) => {
    // 1. Validate CAPTCHA
    if (!captchaInput.trim()) {
      setCaptchaError('Please enter the security captcha code.');
      return;
    }

    if (captchaInput.trim().toLowerCase() !== currentCaptcha.toLowerCase()) {
      setCaptchaError('Captcha code does not match. Please try again.');
      toast.error('Invalid Captcha. Please enter the code shown.');
      return;
    }

    setCaptchaError('');
    setLoading(true);

    try {
      await login(data.email, data.password);
      toast.success('Welcome back to StockSense!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setCaptchaInput(currentCaptcha);
    setCaptchaError('');

    setLoading(true);
    login(email, password)
      .then(() => {
        toast.success(`Logged in with ${email.includes('manager') ? 'Manager' : 'Staff'} role!`);
        navigate('/');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message || 'Login failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const testimonials = [
    {
      quote:
        'Managing stock across 4 regional warehouses was our biggest bottleneck. StockSense unified our receipts, double-entry ledger, and transfers in one real-time dashboard.',
      author: 'Marcus Chen',
      title: 'Head of Operations, NexaLogistics',
      rating: 5,
    },
    {
      quote:
        'Our stock management system has become much better after using StockSense. We also switched to the automated Stock Ledger for our accounting management for its seamless integration.',
      author: 'Clive Taylor',
      title: 'Managing Director, Doability',
      rating: 5,
    },
    {
      quote:
        'The AI restock predictions saved us from 14 potential stockouts last quarter alone. The role separation between Floor Staff and Inventory Managers is rock solid.',
      author: 'Aisha Patel',
      title: 'Supply Chain VP, Horizon Retail',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-zoho-red selection:text-white">
      {/* ─────────────────────────────────────────────────────────
          1. TOP GLOBAL NAVIGATION BAR (Zoho-Style Enterprise Header)
      ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Modules */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* Colorful 4-quadrant brand icon */}
              <div className="flex items-center gap-0.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-[#E52E2E] shadow-2xs"></span>
                <span className="w-3.5 h-3.5 rounded-xs bg-[#10B981] shadow-2xs"></span>
                <span className="w-3.5 h-3.5 rounded-xs bg-[#1A73E8] shadow-2xs"></span>
                <span className="w-3.5 h-3.5 rounded-xs bg-[#F59E0B] shadow-2xs"></span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-zoho-red transition-colors">
                StockSense
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition-colors">
                ERP
              </a>
              <a href="#ledger" className="hover:text-slate-900 transition-colors">
                Stock Ledger
              </a>
              <a href="#multi-warehouse" className="hover:text-slate-900 transition-colors">
                Multi-Warehouse
              </a>
              <a href="#operations" className="hover:text-slate-900 transition-colors">
                Operations
              </a>
              <a href="#analytics" className="hover:text-slate-900 transition-colors">
                AI Analytics
              </a>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                v2.4 Live
              </span>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-slate-700 hover:text-zoho-red px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              className="bg-zoho-red hover:bg-zoho-redHover text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-md"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          2. HERO SECTION + DUAL COLUMN ACCESS FORM (Image 1)
      ───────────────────────────────────────────────────────── */}
      <section className="relative bg-[#FCF7F6] border-b border-rose-100/70 pt-10 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Product Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-zoho-red text-xs sm:text-sm font-semibold">
                <Boxes className="w-4 h-4 text-zoho-red" />
                <span>StockSense Inventory Cloud</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                Multi warehouse <br className="hidden sm:inline" />
                inventory management
              </h1>

              {/* Legible Subtext */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Efficiently manage multiple warehouses in multiple locations, transfer orders, keep
                tabs on your stock, streamline your warehouse operations, and generate insightful
                reports to make accurate business decisions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager@stocksense.com', 'password123')}
                  className="bg-zoho-red hover:bg-zoho-redHover text-white text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span>Sign Up For Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#dashboard-preview"
                  className="px-5 py-3.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold transition-colors shadow-2xs"
                >
                  Explore System Tour
                </a>
              </div>

              {/* Trust Metrics Pill Grid */}
              <div className="pt-6 border-t border-rose-200/60 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Double-Entry Ledger</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">0.0 ms</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">WebSocket Sync</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">30-Day</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">AI Stock Forecast</div>
                </div>
              </div>
            </div>

            {/* Right Column: Zoho-Style Form Container (Image 1) */}
            <div className="lg:col-span-6" id="login-card">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-6 sm:p-8 relative">
                {/* Form Mode Tabs */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className={`text-sm font-bold pb-1 transition-colors relative ${
                        activeTab === 'login'
                          ? 'text-zoho-red'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sign In to Workspace
                      {activeTab === 'login' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zoho-red rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('demo')}
                      className={`text-sm font-bold pb-1 transition-colors relative ${
                        activeTab === 'demo'
                          ? 'text-zoho-red'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Quick Demo Access
                      {activeTab === 'demo' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zoho-red rounded-full" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>

                {activeTab === 'demo' ? (
                  /* Quick Demo Helper Tab */
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Select a role to test StockSense with live pre-seeded inventory data, receipts,
                      and stock movements:
                    </p>

                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-purple-900">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Inventory Manager</span>
                          </div>
                          <p className="text-xs text-purple-700 mt-1">
                            Full system access: validate receipts, approve adjustments, inspect stock ledger, and manage warehouses.
                          </p>
                          <p className="text-xs font-mono text-purple-600 mt-1">
                            manager@stocksense.com · password123
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickLogin('manager@stocksense.com', 'password123')}
                          loading={loading}
                          className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                        >
                          Login as Manager
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-blue-900">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span>Warehouse Staff</span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            Floor operations: create draft receipts, pick and pack delivery orders, log transfers between racks.
                          </p>
                          <p className="text-xs font-mono text-blue-600 mt-1">
                            staff@stocksense.com · password123
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickLogin('staff@stocksense.com', 'password123')}
                          loading={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                        >
                          Login as Staff
                        </Button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 pt-2"
                    >
                      ← Back to standard credentials
                    </button>
                  </div>
                ) : (
                  /* Standard Login Form with Captcha */
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Business Email Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Business Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          {...register('email')}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red transition-colors ${
                            errors.email ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          }`}
                          placeholder="name@company.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-zoho-red hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red transition-colors ${
                            errors.password ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Operational Station / Interest selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Let us know what you're looking for
                      </label>
                      <div className="relative">
                        <select
                          {...register('station')}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red bg-white appearance-none pr-8 font-medium"
                        >
                          <option value="manager">Full Warehouse Management & Ledger (Manager)</option>
                          <option value="staff">Floor Operations & Barcode Shelving (Staff)</option>
                          <option value="multi">Multi-Location & Inter-Warehouse Transfers</option>
                          <option value="ai">AI Restock Forecasting & Analytics</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Location detection snippet (Zoho-Style from Image 1) */}
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          Looks like <strong className="text-slate-800">{locationName}</strong> is your location.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationPicker(!showLocationPicker)}
                        className="text-zoho-red hover:underline font-semibold ml-2 shrink-0"
                      >
                        Change?
                      </button>
                    </div>

                    {showLocationPicker && (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-md space-y-1 text-xs">
                        <p className="text-slate-500 font-medium">Select regional routing:</p>
                        {['Tamil Nadu, India', 'California, United States', 'London, United Kingdom', 'Singapore Regional Hub'].map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocationName(loc);
                              setShowLocationPicker(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded hover:bg-rose-50 ${
                              locationName === loc ? 'font-bold text-zoho-red bg-rose-50/70' : 'text-slate-700'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* CAPTCHA SECTION (As seen in Image 1) */}
                    <div className="pt-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Security Verification
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={captchaInput}
                            onChange={(e) => {
                              setCaptchaInput(e.target.value);
                              if (captchaError) setCaptchaError('');
                            }}
                            placeholder="Enter the captcha"
                            className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red ${
                              captchaError ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <Captcha
                          onCaptchaChange={(newCode) => {
                            setCurrentCaptcha(newCode);
                          }}
                        />
                      </div>
                      {captchaError ? (
                        <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{captchaError}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Case-insensitive. Click captcha image or 🔄 icon to refresh.
                        </p>
                      )}
                    </div>

                    {/* Privacy Disclaimer (Fine Line from Image 1) */}
                    <p className="text-[11px] text-slate-500 leading-tight pt-1">
                      By submitting this form, you agree to the processing of personal data according to our{' '}
                      <span className="text-zoho-red hover:underline cursor-pointer">Privacy Policy</span>.
                    </p>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full py-3 text-sm font-bold uppercase tracking-wider bg-zoho-red hover:bg-zoho-redHover text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      Sign In to StockSense
                    </Button>
                  </form>
                )}

                {/* Quick Demo Access Buttons Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Instant One-Click Demo
                    </span>
                    <span className="text-[11px] text-slate-400">Pre-seeded accounts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('manager@stocksense.com', 'password123')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-700 text-xs font-semibold transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Manager Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('staff@stocksense.com', 'password123')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Staff Demo</span>
                    </button>
                  </div>
                </div>

                {/* Footer sign up redirect */}
                <div className="mt-4 text-center text-xs text-slate-500">
                  Don't have an enterprise account?{' '}
                  <Link to="/signup" className="font-bold text-zoho-red hover:underline">
                    Sign up for free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          3. DASHBOARD SHOWCASE & MULTI-WAREHOUSE PREVIEW (Image 2)
      ───────────────────────────────────────────────────────── */}
      <section id="dashboard-preview" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live StockSense Operations Dashboard
            </h2>
            <div className="fine-line-accent mx-auto my-3" />
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              High-velocity visibility across your sales activity, inventory health, pending receipts,
              and warehouse transfers updated via live WebSockets.
            </p>
          </div>

          {/* Interactive Simulation of StockSense Dashboard UI (Matching Image 2) */}
          <div className="relative rounded-2xl border border-slate-300/80 shadow-2xl bg-[#1E1F28] p-2 sm:p-4 text-slate-100 overflow-hidden">
            {/* Window title bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 font-mono text-slate-300">stocksense.app/workspace/dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  WebSocket Connected
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Acme Hub · Chennai
                </span>
              </div>
            </div>

            {/* Dashboard Inner Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-5 bg-[#F4F5F8] text-slate-800 rounded-b-xl">
              {/* Left Mini Sidebar */}
              <div className="hidden lg:block lg:col-span-2 bg-[#1E1F28] rounded-xl p-3 text-slate-300 space-y-1">
                <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  StockSense ERP
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zoho-red text-white text-xs font-semibold">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium">
                  <Package className="w-4 h-4" />
                  <span>Inventory</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium">
                  <Truck className="w-4 h-4" />
                  <span>Receipts</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Deliveries</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Transfers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Stock Ledger</span>
                </div>
              </div>

              {/* Main Preview Board */}
              <div className="lg:col-span-10 space-y-4">
                {/* Sales & Operational Activity Cards (From Image 2) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Sales & Warehouse Activity
                    </h3>
                    <span className="text-xs text-slate-400">Real-time floor counters</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-2xl font-extrabold text-blue-600">228</div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">Qty To be Packed</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-2xl font-extrabold text-amber-600">6</div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">Pkgs To be Shipped</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-2xl font-extrabold text-emerald-600">10</div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">Pkgs To be Delivered</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-2xl font-extrabold text-purple-600">474</div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">Qty To be Invoiced</div>
                    </div>
                  </div>
                </div>

                {/* Two Column Summary: Inventory Summary & Product Details (From Image 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Inventory Summary */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Inventory Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-xs font-medium text-slate-600">Quantity in Hand</span>
                        <span className="text-base font-bold text-slate-900">10,458 Units</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-xs font-medium text-slate-600">Quantity to be Received</span>
                        <span className="text-base font-bold text-zoho-red">168 Units</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Double-Entry Verification</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Balanced
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Details & Health */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Product Catalog Health
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg">
                        <span className="text-[11px] font-semibold text-rose-700">Low Stock Items</span>
                        <div className="text-xl font-bold text-rose-600 mt-0.5">3 Alerts</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <span className="text-[11px] font-semibold text-emerald-700">Stock Velocity</span>
                        <div className="text-xl font-bold text-emerald-600 mt-0.5">71% Active</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[11px] font-semibold text-slate-600">Item Groups</span>
                        <div className="text-xl font-bold text-slate-800 mt-0.5">39 Groups</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[11px] font-semibold text-slate-600">Active SKUs</span>
                        <div className="text-xl font-bold text-slate-800 mt-0.5">190 Items</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations & Orders Preview */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recent Purchase & Delivery Orders
                    </span>
                    <span className="text-xs text-zoho-red font-semibold cursor-pointer">
                      View Stock Ledger →
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="py-2">Reference</th>
                          <th className="py-2">Source / Partner</th>
                          <th className="py-2">Stage</th>
                          <th className="py-2">Location</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr>
                          <td className="py-2 font-mono text-slate-900 font-bold">REC-00104</td>
                          <td className="py-2">Tata Steel Industries</td>
                          <td className="py-2">Draft → Ready</td>
                          <td className="py-2">Main Wh · Rack A-12</td>
                          <td className="py-2 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Ready
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-slate-900 font-bold">DEL-00089</td>
                          <td className="py-2">Apex Engineering Works</td>
                          <td className="py-2">Pick → Pack</td>
                          <td className="py-2">Production Floor</td>
                          <td className="py-2 text-right">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                              Reserved
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-slate-900 font-bold">TRF-00042</td>
                          <td className="py-2">Inter-Warehouse Movement</td>
                          <td className="py-2">Transit</td>
                          <td className="py-2">Wh 1 → Wh 2</td>
                          <td className="py-2 text-right">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              In-Transit
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Underneath Dashboard: Multi-warehouse management software section (From Image 2) */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Multi-warehouse <br />
                  management software
                </h3>
                <div className="fine-line-accent my-3" />
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                  Consolidate multi-facility inventories under a single source of truth. Manage
                  rack-level storage, track transfers, and eliminate manual register errors.
                </p>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    Manage multiple warehouses globally
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Eliminate complexity in managing multiple warehouses with StockSense, your
                    one-stop application to monitor warehouse activities across different countries
                    and zones.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    Redirect purchase orders to the desired warehouse
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Direct incoming supplier shipments straight to targeted aisles and shelving bins,
                    ensuring products reach the correct staging area without manual sorting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          4. INTER-WAREHOUSE & EFFECTIVE MANAGEMENT FEATURE GRID (Image 3)
      ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 bg-[#FAFAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Sub-section 1: Inter-warehouse management software */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Inter-warehouse management software
              </h2>
              <div className="fine-line-accent mx-auto my-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Update stocks automatically between warehouses
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Product quantities are automatically updated when a warehouse to warehouse
                  transfer happens. Don't go through the hassle of creating them manually.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Receive reorder notifications
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Prevent stockout situations in your warehouses. Using StockSense, receive low stock
                  notifications when it's time to place a new order with your supplier.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Track your items with Stock Ledger
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Never lose track of your stock during a warehouse transfer. Serial, batch and
                  immutable ledger tracking helps you to monitor the status of any individual item
                  while it is in transit.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Effective warehouse management */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Effective warehouse management
              </h2>
              <div className="fine-line-accent mx-auto my-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 4 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Customize access within teams
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Enable effective collaboration while keeping your data secure. Customize access
                  for each team member so that Managers approve validations and Staff manage floor
                  scans.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Provide team transparency
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Make sure your teams are on the same page. Staff working in different warehouses
                  can view the same real-time inventory updates using StockSense WebSockets.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Keep track of your team's activities
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Know which team member is making a sale or a purchase. Set notifications or
                  approval requests to help you ensure accuracy and identify top performers in your
                  operation.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Receive real-time updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Always monitor your stock in transit. Track your transfer orders and receive
                  real-time updates on the whereabouts of your stock with instant event push.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Real-time stock level updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Monitor your item levels in your respective warehouses whenever you create a sales
                  or purchase order, enabling you to keep track of your item quantity on a day-to-day
                  basis.
                </p>
              </div>

              {/* Feature 9 - AI restock capability */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  AI stockout predictive analytics
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Analyzes 30 days of stock ledger consumption to predict exact depletion dates and
                  suggest automated reorder quantities before stock runs out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          5. DETAILED INVENTORY REPORTS & TESTIMONIALS (Image 4)
      ───────────────────────────────────────────────────────── */}
      <section id="analytics" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Detailed Inventory Reports Header */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Detailed Inventory reports
              </h2>
              <div className="fine-line-accent mx-auto my-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Real-time warehouse reports
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-sm mx-auto">
                  Make smart business decisions using StockSense Inventory. Get real-time reports on
                  your items' sales performance and the purchase trends across your respective
                  warehouses.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Track warehouse performance
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-sm mx-auto">
                  Make sure you're on track to meet your targets. Monitor your warehouse activities
                  to see the stock movement across your warehouses.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Section (Matching Image 4) */}
          <div className="pt-8 border-t border-slate-100 max-w-3xl mx-auto text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Testimonial
            </div>

            <div className="relative min-h-[140px] flex flex-col items-center justify-center px-4">
              <blockquote className="text-base sm:text-lg lg:text-xl font-medium text-slate-800 italic leading-relaxed">
                "{testimonials[testimonialIndex].quote}"
              </blockquote>

              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-amber-400 shadow-xs flex items-center justify-center text-slate-600 font-bold">
                  {testimonials[testimonialIndex].author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {testimonials[testimonialIndex].author}
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    {testimonials[testimonialIndex].title}
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTestimonialIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === testimonialIndex ? 'w-6 bg-amber-500' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          6. BOTTOM CTA BANNER & ENTERPRISE DARK FOOTER (Image 5)
      ───────────────────────────────────────────────────────── */}
      {/* Warm Peach/Gold CTA Banner */}
      <section className="bg-[#FFF4EC] border-y border-amber-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Warehouse management made easy with StockSense
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="bg-[#E52E2E] hover:bg-[#C82323] text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Sign Up For Free
            </Link>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@stocksense.com', 'password123')}
              className="px-6 py-3 rounded-lg border border-slate-400/80 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold uppercase tracking-wider transition-colors shadow-2xs"
            >
              Explore Demo Account
            </button>
          </div>
        </div>
      </section>

      {/* Deep Slate Enterprise Footer (From Image 5) */}
      <footer className="bg-[#0E1118] text-slate-400 pt-16 pb-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 5-Column Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {/* Column 1: Explore */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Explore StockSense
              </h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><a href="#ledger" className="hover:text-white transition-colors">Purchasing & Receipts</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Inventory management</a></li>
                <li><a href="#multi-warehouse" className="hover:text-white transition-colors">Warehousing & Racks</a></li>
                <li><a href="#operations" className="hover:text-white transition-colors">Order fulfillment</a></li>
                <li><a href="#analytics" className="hover:text-white transition-colors">Automation and analytics</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">AI in StockSense</a></li>
                <li><span className="text-slate-500">StockSense for Windows</span></li>
              </ul>
            </div>

            {/* Column 2: Get Started */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Get Started
              </h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><Link to="/signup" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Pricing comparison</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Customer success stories</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Schedule a demo</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Jumpstart program</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Partner program</span></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Resources
              </h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><span className="hover:text-white cursor-pointer transition-colors">Help documentation</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Frequently asked questions</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Community Forum</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Webinars & Demos</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Developer REST APIs</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">What's new in v2.4</span></li>
              </ul>
            </div>

            {/* Column 4: Learn Hub */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Learn Hub
              </h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><span className="hover:text-white cursor-pointer transition-colors">Inventory Academy</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">What is inventory management?</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">What is warehouse management?</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">What is logistics management?</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Inventory dictionary</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Warehouse dictionary</span></li>
              </ul>
            </div>

            {/* Column 5: Integrations & Compliance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Platform Security
              </h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><span className="text-emerald-400 font-semibold">✓ 12-Round Bcrypt</span></li>
                <li><span className="text-emerald-400 font-semibold">✓ Dual-Token JWT Auth</span></li>
                <li><span className="text-emerald-400 font-semibold">✓ Rate-Limited Endpoints</span></li>
                <li><span className="text-emerald-400 font-semibold">✓ Immutable Stock Ledger</span></li>
                <li><span className="text-emerald-400 font-semibold">✓ PostgreSQL Parameterized</span></li>
                <li><span className="text-emerald-400 font-semibold">✓ Helmet Security Headers</span></li>
              </ul>
            </div>

            {/* Column 6: Contact Us On */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Contact Us On
              </h4>
              <div className="space-y-2.5 text-slate-400 font-medium">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div>Monday - Friday (9:00 AM - 7:00 PM IST)</div>
                    <div className="text-white font-semibold mt-0.5">Toll-free : 1800-STOCK-SENSE</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div>Mail us</div>
                    <a href="mailto:support@stocksense.com" className="text-white hover:underline font-semibold">
                      support@stocksense.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fine Line Divider & Bottom Legal */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              © 2026 StockSense Technologies Inc. Built with React, Tailwind CSS, PostgreSQL, and Socket.io.
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer">Security Center</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer">Cookie Preferences</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────
          7. FLOATING "ASK AI" ASSISTANT WIDGET (Matching "Ask Zia" in all 5 screenshots)
      ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowAiModal(!showAiModal)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl border border-slate-200 font-semibold text-xs transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 group-hover:text-zoho-red transition-colors">
            Ask StockSense AI
          </span>
        </button>

        {showAiModal && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-zoho-red flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-900">StockSense AI Copilot</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              StockSense AI analyzes 30 days of Stock Ledger records to forecast replenishment dates
              and detect inventory anomalies in real-time.
            </p>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Sample Insights:</div>
              <p className="text-slate-600">
                • <strong>Steel Rods:</strong> ~8 units/day consumed. At 24 units, ~3 days left. Reorder 200 units recommended.
              </p>
              <p className="text-slate-600">
                • <strong>Rack B Transfer:</strong> High velocity detected. Consider relocating to Aisle 1.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setShowAiModal(false);
                handleQuickLogin('manager@stocksense.com', 'password123');
              }}
              className="w-full text-xs font-bold bg-zoho-red hover:bg-zoho-redHover text-white"
            >
              Sign In to View Full AI Insights →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
