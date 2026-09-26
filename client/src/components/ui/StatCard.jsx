import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, badge, trend }) => {
  const colorMap = {
    blue: {
      box: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      gradient: 'from-indigo-600 to-blue-600',
      glow: 'group-hover:border-indigo-500/40',
    },
    amber: {
      box: 'bg-amber-50 text-amber-600 border-amber-100',
      gradient: 'from-amber-500 to-orange-600',
      glow: 'group-hover:border-amber-500/40',
    },
    rose: {
      box: 'bg-rose-50 text-rose-600 border-rose-100',
      gradient: 'from-rose-600 to-red-600',
      glow: 'group-hover:border-rose-500/40',
    },
    emerald: {
      box: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      gradient: 'from-emerald-600 to-teal-600',
      glow: 'group-hover:border-emerald-500/40',
    },
    purple: {
      box: 'bg-purple-50 text-purple-600 border-purple-100',
      gradient: 'from-purple-600 to-indigo-600',
      glow: 'group-hover:border-purple-500/40',
    },
  };

  const currentColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_15px_35px_-5px_rgba(37,99,235,0.12)] transition-all duration-300 relative overflow-hidden ${currentColor.glow}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          {title}
        </p>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${currentColor.box} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-sans">
          {value}
        </span>
        {badge && <div>{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-xs">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
