import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  BookOpenText,
  Warehouse,
  LogOut,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout, isManager } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products Catalog', icon: Boxes },
    { to: '/receipts', label: 'Inbound Receipts', icon: ArrowDownToLine },
    { to: '/deliveries', label: 'Outbound Deliveries', icon: ArrowUpFromLine },
    { to: '/transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
    { to: '/adjustments', label: 'Stock Adjustments', icon: SlidersHorizontal },
    { to: '/ledger', label: 'Stock Ledger', icon: BookOpenText },
    { to: '/settings', label: 'Warehouses & Setup', icon: Warehouse },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 min-h-screen relative z-40 select-none">
      {/* StockSense Brand Logo Header (No Slash) */}
      <div className="h-20 flex items-center px-6 gap-3.5 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Boxes className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-white font-sans flex items-center gap-1">
            Stock<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Sense</span>
          </h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Inventory ERP Node</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Core Modules</span>
          <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-lg shadow-indigo-500/25 font-bold scale-[1.01]'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 m-3 rounded-2xl border border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 ring-1 ring-white/10 shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Operator'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isManager ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    <UserCheck className="w-3 h-3 text-blue-400" /> Staff
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
