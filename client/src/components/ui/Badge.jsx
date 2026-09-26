import React from 'react';

const badgeStyles = {
  // Statuses
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Ready: 'bg-blue-50 text-blue-700 border-blue-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',

  // Stock status
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200',

  // Operation types
  RECEIPT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DELIVERY: 'bg-rose-50 text-rose-700 border-rose-200',
  TRANSFER_IN: 'bg-sky-50 text-sky-700 border-sky-200',
  TRANSFER_OUT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ADJUSTMENT: 'bg-amber-50 text-amber-700 border-amber-200',

  // Urgency
  CRITICAL: 'bg-red-100 text-red-800 border-red-300 font-semibold',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  NORMAL: 'bg-green-100 text-green-800 border-green-300',

  // Roles
  MANAGER: 'bg-purple-50 text-purple-700 border-purple-200',
  STAFF: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const Badge = ({ variant, children, className = '' }) => {
  const style = badgeStyles[variant] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};
