import React, { useState, useEffect, useCallback } from 'react';
import { financeService } from '../services/financeService';
import { MetricCard } from '../components/common/MetricCard';
import { TrendAreaChart } from '../components/charts/TrendAreaChart';
import { ComparisonLineChart } from '../components/charts/ComparisonLineChart';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SUGGESTED_TICKERS } from '../constants/config';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const CustomCompanyView = () => {
  const [searchTerm, setSearchTerm] = useState('AAPL');
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeRange, setActiveRange] = useState('7D');
  const [quote, setQuote] = useState(null);
  const [historicalData, setHistoricalData] = useState({ raw: [], indexed: [] });
  const [trendStats, setTrendStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanyData = useCallback(async (symbolToFetch, rangeToFetch) => {
    const clean = symbolToFetch.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a valid stock ticker symbol.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isValid = await financeService.validateTicker(clean);
      if (!isValid) {
        throw new Error(`Symbol "${clean}" could not be found or is unavailable.`);
      }

      // Fetch quote and comparison against IBM benchmark
      const [quoteList, histResult] = await Promise.all([
        financeService.getQuotes([{ symbol: clean, name: clean, isPrimary: false }]),
        financeService.getHistoricalData(['IBM', clean], rangeToFetch)
      ]);

      const foundQuote = quoteList[0];
      setQuote(foundQuote);
      setHistoricalData(histResult);
      setActiveSymbol(clean);

      const stats = await financeService.getCompanyTrendSummary(clean, rangeToFetch);
      setTrendStats(stats);
    } catch (err) {
      setError(err.message || `Failed to fetch data for ${clean}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData(activeSymbol, activeRange);
  }, [fetchCompanyData, activeSymbol, activeRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanyData(searchTerm, activeRange);
  };

  const handleQuickPick = (sym) => {
    setSearchTerm(sym);
    fetchCompanyData(sym, activeRange);
  };

  const comparisonCompanies = [
    { symbol: 'IBM', name: 'International Business Machines', color: '#0f62fe', isPrimary: true },
    { symbol: activeSymbol, name: quote?.name || activeSymbol, color: '#10b981', isPrimary: false }
  ];

  return (
    <div className="view-container custom-company-view">
      <div className="section-title">
        <h2>Custom Company Analysis &amp; Graph</h2>
        <span className="section-desc">
          Search any ticker symbol to analyze real-time valuation and benchmark against IBM
        </span>
      </div>

      {/* Search Bar & Quick Ticker Pills */}
      <div className="search-control-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="ticker-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              placeholder="Enter ticker (e.g., AAPL, NVDA, GOOGL)"
              maxLength={6}
              aria-label="Stock ticker symbol"
            />
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Analyze Ticker'}
          </button>
        </form>

        <div className="quick-picks-container">
          <span className="quick-pick-label">Quick Suggestions:</span>
          <div className="quick-pill-list">
            {SUGGESTED_TICKERS.map((t) => (
              <button
                key={t.symbol}
                type="button"
                className={`quick-pill ${activeSymbol === t.symbol ? 'active' : ''}`}
                onClick={() => handleQuickPick(t.symbol)}
              >
                {t.symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-card" role="alert">
          <div className="error-title">Lookup Notice</div>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => {
              setSearchTerm('AAPL');
              fetchCompanyData('AAPL', activeRange);
            }}
          >
            Reset to Default (AAPL)
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton count={3} />}

      {/* Data Presentation */}
      {!loading && !error && quote && (
        <div className="custom-results-section">
          {/* Top Bar with Quote Card and Period Controls */}
          <div className="custom-overview-grid">
            <div className="quote-display-col">
              <MetricCard
                quote={quote}
                companyMeta={{
                  symbol: activeSymbol,
                  name: quote.name,
                  color: '#10b981',
                  isPrimary: false
                }}
              />
            </div>

            {trendStats && (
              <div className="trend-stats-summary-card">
                <div className="summary-header">
                  <h4>{activeRange === '7D' ? '7-Day' : 'Quarterly'} Return Statistics</h4>
                  <div className="range-switcher" role="group" aria-label="Select time range">
                    <button
                      className={`range-pill-btn ${activeRange === '7D' ? 'active' : ''}`}
                      onClick={() => setActiveRange('7D')}
                    >
                      7D
                    </button>
                    <button
                      className={`range-pill-btn ${activeRange === '3M' ? 'active' : ''}`}
                      onClick={() => setActiveRange('3M')}
                    >
                      3M (Quarter)
                    </button>
                  </div>
                </div>

                <div className="stats-metric-row">
                  <div className="stat-item">
                    <span className="stat-label">Starting Price</span>
                    <span className="stat-val">{formatCurrency(trendStats.startPrice)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Period High</span>
                    <span className="stat-val">{formatCurrency(trendStats.highPrice)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Period Low</span>
                    <span className="stat-val">{formatCurrency(trendStats.lowPrice)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Period Return</span>
                    <span className={`stat-val ${trendStats.diff >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercent(trendStats.percentReturn)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Charts Grid */}
          <div className="charts-grid-duo">
            <TrendAreaChart
              data={historicalData.raw}
              symbol={activeSymbol}
              color="#10b981"
              title={`${activeSymbol} Price Movement (${activeRange})`}
            />
            <ComparisonLineChart
              data={historicalData.indexed}
              companies={comparisonCompanies}
              title={`${activeSymbol} vs. IBM Benchmark (Base = 100%)`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
