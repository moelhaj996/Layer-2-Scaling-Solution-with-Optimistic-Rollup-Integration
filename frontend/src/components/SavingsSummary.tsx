'use client';

import { useEffect, useState } from 'react';
import { getSavingsSummary } from '@/lib/api';

interface SavingsSummaryData {
  totalSavings: number;
  avgSavings: number;
}

export default function SavingsSummary() {
  const [data, setData] = useState<SavingsSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await getSavingsSummary();
        setData(summary);
      } catch (error) {
        console.error('Error fetching savings summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur rounded-xl p-6 border border-green-700/50 mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="h-12 bg-slate-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur rounded-xl p-6 border border-green-700/50 mt-6">
      <h2 className="text-lg font-semibold text-green-400 mb-4">
        💰 Total Gas Savings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-2">Average Savings</div>
          <div className="text-4xl font-bold text-green-400">
            {data?.avgSavings?.toFixed(1) || '0'}%
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-2">Total Saved (ETH)</div>
          <div className="text-4xl font-bold text-green-400">
            {data?.totalSavings?.toFixed(6) || '0.000000'}
          </div>
        </div>
      </div>
    </div>
  );
}
