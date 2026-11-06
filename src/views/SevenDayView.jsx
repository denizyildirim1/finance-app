import React from 'react';
import { ComparisonLineChart } from '../components/charts/ComparisonLineChart';
import { TrendAreaChart } from '../components/charts/TrendAreaChart';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const SevenDayView = ({ historicalData, companies }) => {
  const { raw, indexed } = historicalData;

  const getWeekStats = () => {
    if (!raw || raw.length < 2) return [];
    const firstDay = raw[0];
    const lastDay = raw[raw.length - 1];

    return companies
      .map((c) => {
        const prices = raw.map((r) => r[c.symbol]).filter(Boolean);
        const startPrice = firstDay[c.symbol] || 0;
        const endPrice = lastDay[c.symbol] || 0;
        const highPrice = prices.length ? Math.max(...prices) : endPrice;
        const lowPrice = prices.length ? Math.min(...prices) : startPrice;
        const diff = endPrice - startPrice;
        const pct = startPrice > 0 ? (diff / startPrice) * 100 : 0;
        return {
          ...c,
          startPrice,
          endPrice,
          highPrice,
          lowPrice,
          diff,
          pct
        };
      })
      .sort((a, b) => b.pct - a.pct);
  };

  const weekStats = getWeekStats();
  const leader = weekStats[0];
  const laggard = weekStats[weekStats.length - 1];
  const ibmStats = weekStats.find((s) => s.symbol === 'IBM');

  return (
    <div className="view-container seven-day-view">
      <div className="section-title">
        <h2>Last 7 Days Trend Comparison</h2>
        <span className="section-desc">
          Normalized short-term momentum, relative trajectory, and trailing return analysis
        </span>
      </div>

      {/* 7-Day Stat Highlights */}
      <div className="hero-stats-row">
        <div className="stat-pill-card">
          <span className="pill-label">7-Day Leader</span>
          <div className="pill-val positive">
            {leader?.symbol} ({formatPercent(leader?.pct)})
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">IBM 7-Day Return</span>
          <div className={`pill-val ${ibmStats?.pct >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(ibmStats?.pct)}
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">7-Day Trailing Laggard</span>
          <div className="pill-val negative">
            {laggard?.symbol} ({formatPercent(laggard?.pct)})
          </div>
        </div>
      </div>

      {/* Dual Charts Grid */}
      <div className="charts-grid-duo">
        <ComparisonLineChart
          data={indexed}
          companies={companies}
          title="7-Day Relative Performance (Base = 100%)"
        />
        <TrendAreaChart
          data={raw}
          symbol="IBM"
          color="#0f62fe"
          title="IBM 7-Day Price Trajectory"
        />
      </div>

      {/* 7-Day Performance Table */}
      <div className="summary-table-card">
        <div className="table-card-header">
          <h3>7-Day Cumulative Return Breakdown</h3>
          <span className="card-subtext">Comprehensive 7-day price drift and period range</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>7D Start Price</th>
                <th>Latest Price</th>
                <th>Period Range (Low - High)</th>
                <th>Net Dollar Diff</th>
                <th>Cumulative Return</th>
              </tr>
            </thead>
            <tbody>
              {weekStats.map((item, idx) => {
                const isPos = item.diff >= 0;
                return (
                  <tr key={item.symbol} className={item.isPrimary ? 'primary-row' : ''}>
                    <td><span className="rank-badge">#{idx + 1}</span></td>
                    <td className="company-cell font-medium">{item.name}</td>
                    <td>
                      <span className="table-ticker" style={{ color: item.color }}>
                        {item.symbol}
                      </span>
                    </td>
                    <td>{formatCurrency(item.startPrice)}</td>
                    <td className="font-semibold">{formatCurrency(item.endPrice)}</td>
                    <td className="range-cell">
                      {formatCurrency(item.lowPrice)} - {formatCurrency(item.highPrice)}
                    </td>
                    <td className={isPos ? 'positive' : 'negative'}>
                      {isPos ? '+' : ''}{formatCurrency(item.diff)}
                    </td>
                    <td className={`font-semibold ${isPos ? 'positive' : 'negative'}`}>
                      {formatPercent(item.pct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
