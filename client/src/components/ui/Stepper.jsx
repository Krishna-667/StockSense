import React from 'react';
import { Check } from 'lucide-react';

export const Stepper = ({ steps, currentStep, status }) => {
  const isCancelled = status === 'Cancelled';

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = !isCancelled && (currentStep > stepNumber || status === 'Done');
          const isCurrent = !isCancelled && currentStep === stepNumber && status !== 'Done';

          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all ${
                    isCancelled
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isCancelled
                      ? 'text-rose-500'
                      : isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-brand-600 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </span>
                {step.desc && (
                  <span className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</span>
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 mb-6 transition-colors ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
