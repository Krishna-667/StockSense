import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Boxes, ShieldCheck, UserCheck, ArrowRight, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MANAGER', 'STAFF']),
});

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Account created successfully! Welcome to StockSense.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
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
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-zoho-red hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md w-full mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Start Your Enterprise Journey
          </h1>
          <div className="fine-line-accent mx-auto my-3" />
          <p className="text-sm text-slate-600 font-normal">
            Real-time multi-warehouse inventory management with double-entry stock ledger
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  }`}
                  placeholder="Alex Rivera"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
            </div>

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
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red transition-colors ${
                    errors.password ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Role Responsibility
              </label>
              <select
                {...register('role')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-zoho-red/20 focus:border-zoho-red bg-white font-medium"
              >
                <option value="STAFF">Warehouse Staff (Pick, Pack, Transfers, Drafts)</option>
                <option value="MANAGER">Inventory Manager (Full Validation, Stock Ledger & Admin)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight pt-1">
              By creating an account, you agree to our{' '}
              <span className="text-zoho-red hover:underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-zoho-red hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider bg-zoho-red hover:bg-zoho-redHover text-white rounded-lg shadow-sm hover:shadow-md transition-all mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-zoho-red hover:underline">
              Sign in to workspace
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
