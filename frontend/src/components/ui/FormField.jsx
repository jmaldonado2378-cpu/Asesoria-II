import React from 'react';

export function FormField({ label, icon, error, children, ...props }) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-2)' }}
        >
          {icon && <span className="flex items-center justify-center opacity-70">{icon}</span>}
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {children ? (
          children
        ) : (
          <input
            className="w-full px-3 py-2 text-sm rounded-md outline-none transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-1)',
              border: `1px solid ${hasError ? '#ef4444' : 'var(--border)'}`
            }}
            {...props}
          />
        )}
      </div>
      
      {error && (
        <div 
          className="text-xs mt-0.5 animate-in fade-in slide-in-from-top-1" 
          style={{ color: '#ef4444' }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
