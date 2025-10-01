'use client';

import { useEffect, useState } from 'react';
import { healthCheck, HealthStatus } from '@/lib/api';

export default function NetworkStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const status = await healthCheck();
        setHealth(status);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth({ status: 'DOWN', l1Connected: false, l2Connected: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-slate-700 rounded w-24"></div>
          <div className="h-4 bg-slate-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Network Status</h2>
        <div className="flex space-x-4">
          {/* L1 Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                health?.l1Connected ? 'bg-green-500' : 'bg-red-500'
              } ${health?.l1Connected ? 'animate-pulse' : ''}`}
            ></div>
            <span className="text-sm text-slate-300">L1 Sepolia</span>
          </div>

          {/* L2 Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                health?.l2Connected ? 'bg-green-500' : 'bg-red-500'
              } ${health?.l2Connected ? 'animate-pulse' : ''}`}
            ></div>
            <span className="text-sm text-slate-300">L2 Optimism</span>
          </div>

          {/* Backend Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                health?.status === 'UP' ? 'bg-green-500' : 'bg-red-500'
              } ${health?.status === 'UP' ? 'animate-pulse' : ''}`}
            ></div>
            <span className="text-sm text-slate-300">Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
