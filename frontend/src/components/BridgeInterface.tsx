'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { L1_BRIDGE_ADDRESS, L2_BRIDGE_ADDRESS, L1_TOKEN_ADDRESS, L2_TOKEN_ADDRESS, L1_BRIDGE_ABI, L2_BRIDGE_ABI, ERC20_ABI } from '@/lib/contracts';

export default function BridgeInterface() {
  const { address, chain } = useAccount();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isDepositing, setIsDepositing] = useState(true);

  // Contract interactions
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: isDepositing ? L1_TOKEN_ADDRESS : L2_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance } = useReadContract({
    address: isDepositing ? L1_TOKEN_ADDRESS : L2_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && isDepositing ? [address, L1_BRIDGE_ADDRESS] : undefined,
  });

  const handleApprove = async () => {
    if (!amount) return;

    try {
      writeContract({
        address: L1_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [L1_BRIDGE_ADDRESS, parseEther(amount)],
      });
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !recipient) return;

    try {
      writeContract({
        address: L1_BRIDGE_ADDRESS,
        abi: L1_BRIDGE_ABI,
        functionName: 'depositToL2',
        args: [recipient as `0x${string}`, parseEther(amount)],
      });
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !recipient) return;

    try {
      writeContract({
        address: L2_BRIDGE_ADDRESS,
        abi: L2_BRIDGE_ABI,
        functionName: 'initiateWithdrawal',
        args: [recipient as `0x${string}`, parseEther(amount)],
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const needsApproval = isDepositing && allowance !== undefined && !!amount &&
    BigInt(allowance as bigint) < parseEther(amount);

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Bridge Assets</h2>

      {/* Network Check */}
      {address && chain && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-400">
            Connected to: <span className="font-semibold">{chain.name}</span>
          </div>
        </div>
      )}

      {/* Tab Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsDepositing(true)}
          className={`flex-1 py-2 px-4 rounded-lg transition ${
            isDepositing
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Deposit to L2
        </button>
        <button
          onClick={() => setIsDepositing(false)}
          className={`flex-1 py-2 px-4 rounded-lg transition ${
            !isDepositing
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Withdraw to L1
        </button>
      </div>

      {/* Balance Display */}
      {tokenBalance !== undefined && (
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Your Balance</div>
          <div className="text-lg font-semibold text-white">
            {formatEther(tokenBalance as bigint)} TEST
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Recipient Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      {!address ? (
        <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Please connect your wallet to use the bridge
          </p>
        </div>
      ) : (
        <>
          {needsApproval && (
            <button
              onClick={handleApprove}
              disabled={!amount || isPending || isConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition mb-2"
            >
              {isPending || isConfirming ? 'Approving...' : 'Approve Token'}
            </button>
          )}

          <button
            onClick={isDepositing ? handleDeposit : handleWithdraw}
            disabled={!amount || !recipient || isPending || isConfirming || needsApproval}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
          >
            {isPending || isConfirming
              ? 'Processing...'
              : isDepositing
              ? 'Deposit to L2'
              : 'Withdraw to L1'}
          </button>
        </>
      )}

      {/* Success Message */}
      {isSuccess && hash && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-400 text-sm">
            Transaction successful!
          </p>
          <p className="text-green-300 text-xs mt-1 font-mono break-all">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          {isDepositing
            ? '⏱️ Deposits typically take 1-2 minutes to finalize on L2'
            : '⏱️ Withdrawals require a 7-day challenge period before finalizing on L1'}
        </p>
      </div>
    </div>
  );
}
