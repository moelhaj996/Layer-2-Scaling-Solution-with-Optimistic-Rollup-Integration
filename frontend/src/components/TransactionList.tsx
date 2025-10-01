'use client';

import { useEffect, useState } from 'react';
import { getL1Transactions, getL2Transactions, Transaction } from '@/lib/api';

export default function TransactionList() {
  const [activeTab, setActiveTab] = useState<'l1' | 'l2'>('l1');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = activeTab === 'l1'
          ? await getL1Transactions(0, 10)
          : await getL2Transactions(0, 10);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, [activeTab]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    try {
      const eth = Number(amount) / 1e18;
      return eth.toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('l1')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'l1'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            L1
          </button>
          <button
            onClick={() => setActiveTab('l2')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'l2'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            L2
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No transactions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  TX Hash
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  From
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  To
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                >
                  <td className="py-3 px-4">
                    <a
                      href={`https://${activeTab === 'l1' ? 'sepolia' : 'sepolia-optimism'}.etherscan.io/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                    >
                      {formatAddress(tx.transactionHash)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                    {formatAddress(tx.fromAddress)}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                    {formatAddress(tx.toAddress)}
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {formatAmount(tx.amount)} TEST
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {tx.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'CONFIRMED'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
