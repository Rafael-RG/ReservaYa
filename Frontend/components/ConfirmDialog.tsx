import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: '🗑️',
      color: 'red',
      bgColor: 'bg-red-50/50',
      borderColor: 'border-red-200',
      buttonBg: 'bg-red-600',
      buttonHover: 'hover:bg-red-700',
      iconBg: 'bg-red-500',
      iconShadow: 'shadow-red-500/30'
    },
    warning: {
      icon: '⚠️',
      color: 'amber',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      buttonBg: 'bg-amber-600',
      buttonHover: 'hover:bg-amber-700',
      iconBg: 'bg-amber-500',
      iconShadow: 'shadow-amber-500/30'
    },
    info: {
      icon: 'ℹ️',
      color: 'blue',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-200',
      buttonBg: 'bg-blue-600',
      buttonHover: 'hover:bg-blue-700',
      iconBg: 'bg-blue-500',
      iconShadow: 'shadow-blue-500/30'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-10">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onCancel}
      ></div>
      
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header con icono */}
        <div className={`${config.bgColor} border-b-2 ${config.borderColor} p-8 flex items-center gap-6`}>
          <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-xl ${config.iconShadow}`}>
            <span className="text-4xl">{config.icon}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex-1">
            {title}
          </h3>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            {message}
          </p>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-5 rounded-[1.5rem] font-black text-xl text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-5 rounded-[1.5rem] font-black text-xl text-white ${config.buttonBg} ${config.buttonHover} shadow-xl transition-all active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
