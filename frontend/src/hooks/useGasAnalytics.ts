import { useState, useEffect } from 'react';
import { getGasComparison, getGasTrends, GasComparison, GasAnalytics } from '@/lib/api';

export function useGasAnalytics() {
  const [current, setCurrent] = useState<GasComparison | null>(null);
  const [trends, setTrends] = useState<GasAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [comparisonData, trendsData] = await Promise.all([
          getGasComparison(),
          getGasTrends(24),
        ]);

        setCurrent(comparisonData);
        setTrends(trendsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching gas analytics:', err);
        setError('Failed to fetch gas analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return { current, trends, isLoading, error };
}
