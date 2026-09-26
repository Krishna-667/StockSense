import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, dark = false }) => {
  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        dark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-slate-800 shadow-2xl'
          : 'bg-white text-slate-900 border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(15,23,42,0.09)]'
      } ${className}`}
    >
      {(title || action) && (
        <div
          className={`px-6 py-4.5 border-b flex items-center justify-between ${
            dark ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100/80 bg-slate-50/40'
          }`}
        >
          <div>
            {title && (
              <h3 className={`font-bold text-base tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-xs mt-0.5 font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 sm:p-7">{children}</div>
    </div>
  );
};
