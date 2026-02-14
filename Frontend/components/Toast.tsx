import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50/95',
      borderColor: 'border-green-300',
      textColor: 'text-green-900',
      iconBg: 'bg-green-500',
      progressBg: 'bg-green-500'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50/95',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      iconBg: 'bg-red-500',
      progressBg: 'bg-red-500'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-amber-50/95',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-900',
      iconBg: 'bg-amber-500',
      progressBg: 'bg-amber-500'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50/95',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      iconBg: 'bg-blue-500',
      progressBg: 'bg-blue-500'
    }
  };

  const typeConfig = config[type];

  return (
    <div className="fixed top-6 right-6 z-[300] animate-in slide-in-from-top-5 duration-300">
      <div className={`${typeConfig.bgColor} border-2 ${typeConfig.borderColor} rounded-[2rem] shadow-2xl backdrop-blur-sm overflow-hidden max-w-md`}>
        <div className="flex items-center gap-4 p-6">
          <div className={`w-12 h-12 ${typeConfig.iconBg} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
            <span className="text-2xl">{typeConfig.icon}</span>
          </div>
          <p className={`${typeConfig.textColor} font-bold text-base flex-1 leading-snug`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors shrink-0"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-black/5">
          <div 
            className={`h-full ${typeConfig.progressBg}`}
            style={{ 
              animation: `shrink ${duration}ms linear forwards`,
              transformOrigin: 'left'
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-[300] space-y-4">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 300 - index 
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
