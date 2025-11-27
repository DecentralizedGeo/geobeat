'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('geobeat-demo-banner-dismissed-v1');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('geobeat-demo-banner-dismissed-v1', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
      <div className="flex items-center justify-between gap-4 px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100">
            DEMO
          </Badge>
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Based on 5-hour snapshot from <span className="font-semibold">November 23, 2024</span> at ETHGlobal Bangkok
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
          aria-label="Dismiss demo notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
