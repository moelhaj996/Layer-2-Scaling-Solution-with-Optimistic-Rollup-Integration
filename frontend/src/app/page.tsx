'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import BridgeInterface from '@/components/BridgeInterface';
import GasComparison from '@/components/GasComparison';
import TransactionList from '@/components/TransactionList';
import NetworkStatus from '@/components/NetworkStatus';
import SavingsSummary from '@/components/SavingsSummary';
import RealtimeUpdates from '@/components/RealtimeUpdates';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              L2 Scaling Solution
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Optimistic Rollup Bridge Dashboard
            </p>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Network Status */}
        <NetworkStatus />

        {/* Savings Summary */}
        <SavingsSummary />

        {/* Bridge & Gas Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <BridgeInterface />
          <GasComparison />
        </div>

        {/* Transactions List */}
        <TransactionList />

        {/* Real-time Updates (hidden component for WebSocket) */}
        <RealtimeUpdates />
      </main>
    </div>
  );
}
