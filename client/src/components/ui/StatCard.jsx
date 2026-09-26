import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, badge, trend }) => {
  const textColorMap = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    rose: 'text-zoho-red',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
  };

  const selectedTextColor = textColorMap[color] || textColorMap.blue;

  return (
    <div className="bg-white rounded-lg border border-zoho-border p-4 shadow-zoho-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className={`text-2xl font-bold tracking-tight ${selectedTextColor}`}>
          {value}
        </span>
        {badge && <div>{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {subtitle && <span className="text-[11px] text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
