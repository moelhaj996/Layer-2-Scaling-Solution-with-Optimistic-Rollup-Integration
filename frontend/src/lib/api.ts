import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Transaction {
  id: number;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  blockNumber: number;
  eventType: string;
  timestamp: string;
  status: string;
}

export interface GasComparison {
  operationType: string;
  l1GasCost: number;
  l2GasCost: number;
  savingsPercentage: number;
  timestamp: string;
}

export interface GasAnalytics {
  id: number;
  operationType: string;
  l1GasCostEth: number;
  l2GasCostEth: number;
  savingsPercentage: number;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  l1Connected: boolean;
  l2Connected: boolean;
}

// API functions
export const healthCheck = async (): Promise<HealthStatus> => {
  const response = await api.get('/api/health');
  return response.data;
};

export const getL1Transactions = async (page = 0, size = 20): Promise<Transaction[]> => {
  const response = await api.get(`/api/transactions/l1?page=${page}&size=${size}`);
  return response.data.content || response.data;
};

export const getL2Transactions = async (page = 0, size = 20): Promise<Transaction[]> => {
  const response = await api.get(`/api/transactions/l2?page=${page}&size=${size}`);
  return response.data.content || response.data;
};

export const getGasComparison = async (operationType = 'ERC20_TRANSFER'): Promise<GasComparison> => {
  const response = await api.get(`/api/analytics/gas-comparison?operationType=${operationType}`);
  return response.data;
};

export const getGasTrends = async (hours = 24): Promise<GasAnalytics[]> => {
  const response = await api.get(`/api/analytics/trends?hours=${hours}`);
  return response.data;
};

export const getSavingsSummary = async () => {
  const response = await api.get('/api/analytics/savings-summary');
  return response.data;
};

export default api;
