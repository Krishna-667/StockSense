import React from 'react';

export const ProgressBar = ({ current, target = 100, label, showValue = true, uom = '' }) => {
  const percentage = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-700';

  if (current <= 0) {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-700';
  } else if (current <= target * 0.5) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
  } else if (current <= target) {
    colorClass = 'bg-amber-400';
    textClass = 'text-amber-600';
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-slate-600 truncate mr-2">{label}</span>}
          {showValue && (
            <span className={`font-semibold ${textClass}`}>
              {current} {uom} {target ? `/ ${target} ${uom}` : ''}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
