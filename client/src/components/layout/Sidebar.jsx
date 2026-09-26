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
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout, isManager } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Inventory', icon: Boxes },
    { to: '/receipts', label: 'Purchases (In)', icon: ArrowDownToLine },
    { to: '/deliveries', label: 'Sales (Out)', icon: ArrowUpFromLine },
    { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
    { to: '/adjustments', label: 'Adjustments', icon: SlidersHorizontal },
    { to: '/ledger', label: 'Reports (Ledger)', icon: BookOpenText },
    { to: '/settings', label: 'Settings & Setup', icon: Warehouse },
  ];

  return (
    <aside className="w-64 bg-zoho-sidebar text-zoho-sidebarText flex flex-col shrink-0 border-r border-slate-800 min-h-screen relative z-40 select-none">
      {/* Zoho Inventory Style Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-md bg-zoho-red flex items-center justify-center text-white shadow-xs">
          <Package className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-base leading-tight font-sans">
            StockSense
          </h1>
          <p className="text-[10px] font-medium text-slate-400">Inventory ERP</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zoho-red text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-zoho-sidebarHover hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 m-2 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Operator'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {isManager ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-2.5 h-2.5 text-rose-400" /> Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                    <UserCheck className="w-2.5 h-2.5 text-blue-400" /> Staff
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
