import React from 'react';

const badgeStyles = {
  // Statuses
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Ready: 'bg-blue-50 text-blue-700 border-blue-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',

  // Stock status
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
  LOW_STOCK: 'bg-rose-50 text-rose-600 border-rose-200 font-semibold',
  OUT_OF_STOCK: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',

  // Operation types
  RECEIPT: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERY: 'bg-amber-50 text-amber-700 border-amber-200',
  TRANSFER_IN: 'bg-slate-100 text-slate-700 border-slate-200',
  TRANSFER_OUT: 'bg-slate-100 text-slate-700 border-slate-200',
  ADJUSTMENT: 'bg-purple-50 text-purple-700 border-purple-200',

  // Urgency
  CRITICAL: 'bg-rose-600 text-white font-bold border-rose-700',
  HIGH: 'bg-amber-500 text-white font-bold border-amber-600',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
  NORMAL: 'bg-emerald-50 text-emerald-800 border-emerald-200',

  // Roles
  MANAGER: 'bg-zoho-red text-white font-semibold',
  STAFF: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold',
};

export const Badge = ({ variant, children, className = '' }) => {
  const style = badgeStyles[variant] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] tracking-tight font-medium border ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};
