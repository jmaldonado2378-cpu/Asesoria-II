import React, { useState, useEffect } from 'react';
import { onConnectionChange } from '../../api/httpClient.js';

export function ConnectionBanner() {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsubscribe = onConnectionChange((status) => {
      setIsRetrying(status);
    });
    
    return () => unsubscribe();
  }, []);

  if (!isRetrying) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-center py-1.5 px-4 text-xs font-semibold tracking-wide animate-in slide-in-from-top-full"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        color: 'var(--accent)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--accent)' }}></span>
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--accent)' }}></span>
        </span>
        Conectando al servidor...
      </div>
    </div>
  );
}
