'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface TransactionData {
  transactionHash?: string;
  from?: string;
  to?: string;
  amount?: string;
  status?: string;
}

export default function RealtimeUpdates() {
  const { data: l1Data, isConnected: l1Connected } = useWebSocket<TransactionData>('l1-transactions');
  const { data: l2Data, isConnected: l2Connected } = useWebSocket<TransactionData>('l2-transactions');
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);

  useEffect(() => {
    if (l1Data) {
      const notification = {
        id: Date.now(),
        message: `New L1 transaction: ${l1Data.transactionHash?.slice(0, 10)}...`,
        type: 'l1',
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    }
  }, [l1Data]);

  useEffect(() => {
    if (l2Data) {
      const notification = {
        id: Date.now(),
        message: `New L2 transaction: ${l2Data.transactionHash?.slice(0, 10)}...`,
        type: 'l2',
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    }
  }, [l2Data]);

  return (
    <>
      {/* WebSocket Status Indicator (Hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <div className="text-xs text-slate-400 mb-1">WebSocket Status</div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  l1Connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-xs text-slate-300">L1</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  l2Connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-xs text-slate-300">L2</span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Stack */}
      <div className="fixed top-20 right-4 space-y-2 z-50">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`animate-slide-in-right bg-slate-800 border ${
              notif.type === 'l1' ? 'border-blue-500' : 'border-green-500'
            } rounded-lg p-4 shadow-lg min-w-[300px]`}
          >
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  notif.type === 'l1' ? 'bg-blue-500' : 'bg-green-500'
                }`}
              ></div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {notif.type === 'l1' ? 'Layer 1' : 'Layer 2'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
