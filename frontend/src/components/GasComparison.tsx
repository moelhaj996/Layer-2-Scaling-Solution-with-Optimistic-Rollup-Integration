'use client';

import { useGasAnalytics } from '@/hooks/useGasAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GasComparison() {
  const { current, trends, isLoading, error } = useGasAnalytics();

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <div className="text-red-400">Error loading gas analytics</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Gas Cost Comparison</h2>

      {/* Current Comparison */}
      {current && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">L1 Cost</div>
              <div className="text-2xl font-bold text-white">
                {current.l1GasCost.toFixed(6)} ETH
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">L2 Cost</div>
              <div className="text-2xl font-bold text-green-400">
                {current.l2GasCost.toFixed(6)} ETH
              </div>
            </div>
          </div>

          {/* Savings Badge */}
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-6">
            <div className="text-center">
              <div className="text-sm text-green-400 mb-1">Gas Savings</div>
              <div className="text-3xl font-bold text-green-400">
                {current.savingsPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </>
      )}

      {/* Historical Chart */}
      {trends && trends.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{
                  value: 'Cost (ETH)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#9CA3AF',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="l1GasCostEth"
                stroke="#EF4444"
                name="L1 Gas Cost"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="l2GasCostEth"
                stroke="#10B981"
                name="L2 Gas Cost"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-400">
          No trend data available yet
        </div>
      )}
    </div>
  );
}
