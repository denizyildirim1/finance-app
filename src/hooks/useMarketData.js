import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../services/financeService';
import { DEFAULT_COMPANIES } from '../constants/config';

export const useMarketData = (timeWindow = '1D', customCompanies = null) => {
  const [companies] = useState(customCompanies || DEFAULT_COMPANIES);
  const [quotes, setQuotes] = useState([]);
  const [historicalData, setHistoricalData] = useState({ raw: [], indexed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const symbols = companies.map((c) => c.symbol);
      if (timeWindow === '1D') {
        const qData = await financeService.getQuotes(companies);
        setQuotes(qData);
      } else {
        const [qData, hData] = await Promise.all([
          financeService.getQuotes(companies),
          financeService.getHistoricalData(symbols, timeWindow)
        ]);
        setQuotes(qData);
        setHistoricalData(hData);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve market data');
    } finally {
      setLoading(false);
    }
  }, [companies, timeWindow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    companies,
    quotes,
    historicalData,
    loading,
    error,
    refresh: fetchData
  };
};
