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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Sidebar = () => {
  const { user, logout, isManager } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products & Catalog', icon: Boxes },
    { to: '/receipts', label: 'Receipts (In)', icon: ArrowDownToLine },
    { to: '/deliveries', label: 'Deliveries (Out)', icon: ArrowUpFromLine },
    { to: '/transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
    { to: '/adjustments', label: 'Stock Adjustments', icon: SlidersHorizontal },
    { to: '/ledger', label: 'Stock Ledger', icon: BookOpenText },
    { to: '/settings', label: 'Warehouses & Setup', icon: Warehouse },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col shrink-0 border-r border-navy-800 min-h-screen">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-navy-800/80">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-lg leading-tight">StockSense</h1>
          <p className="text-[11px] text-slate-400 font-medium">Inventory Cloud ERP</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Operations
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Role */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-950/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isManager ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 font-medium">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-medium">
                    <UserCheck className="w-3 h-3 text-blue-400" /> Staff
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
