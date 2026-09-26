import React from 'react';

const badgeStyles = {
  // Statuses
  Draft: 'bg-slate-100 text-slate-800 border-slate-200',
  Waiting: 'bg-amber-100/70 text-amber-900 border-amber-300/60',
  Ready: 'bg-emerald-100/70 text-emerald-900 border-emerald-300/60',
  Done: 'bg-axion-sage text-white border-axion-sage',
  Cancelled: 'bg-rose-100 text-rose-900 border-rose-200',

  // Stock status
  IN_STOCK: 'bg-axion-sage text-white border-axion-sage font-medium',
  LOW_STOCK: 'bg-amber-100 text-amber-950 border-amber-300 font-semibold',
  OUT_OF_STOCK: 'bg-rose-100 text-rose-950 border-rose-300 font-semibold',

  // Operation types
  RECEIPT: 'bg-axion-sage/15 text-axion-sage border-axion-sage/30',
  DELIVERY: 'bg-rose-50 text-rose-700 border-rose-200',
  TRANSFER_IN: 'bg-slate-100 text-slate-800 border-slate-300',
  TRANSFER_OUT: 'bg-slate-100 text-slate-800 border-slate-300',
  ADJUSTMENT: 'bg-amber-50 text-amber-800 border-amber-200',

  // Urgency
  CRITICAL: 'bg-rose-600 text-white border-rose-700 font-bold',
  HIGH: 'bg-amber-500 text-white border-amber-600 font-bold',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-300',
  NORMAL: 'bg-emerald-100 text-emerald-900 border-emerald-200',

  // Roles
  MANAGER: 'bg-axion-dark text-white border-axion-dark font-semibold',
  STAFF: 'bg-axion-sand text-axion-dark border-axion-border font-semibold',
};

export const Badge = ({ variant, children, className = '' }) => {
  const style = badgeStyles[variant] || 'bg-slate-100 text-slate-800 border-slate-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] tracking-tight font-medium border ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};
