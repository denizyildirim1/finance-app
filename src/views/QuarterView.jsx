import React from 'react';
import { ComparisonLineChart } from '../components/charts/ComparisonLineChart';
import { TrendAreaChart } from '../components/charts/TrendAreaChart';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const QuarterView = ({ historicalData, companies }) => {
  const { raw, indexed } = historicalData;

  const getQuarterStats = () => {
    if (!raw || raw.length < 2) return [];
    const firstDay = raw[0];
    const lastDay = raw[raw.length - 1];

    return companies
      .map((c) => {
        const prices = raw.map((r) => r[c.symbol]).filter(Boolean);
        const startPrice = firstDay[c.symbol] || 0;
        const endPrice = lastDay[c.symbol] || 0;
        const quarterHigh = Math.max(...prices);
        const quarterLow = Math.min(...prices);
        const diff = endPrice - startPrice;
        const pct = startPrice > 0 ? (diff / startPrice) * 100 : 0;
        const spread = quarterHigh - quarterLow;

        return {
          ...c,
          startPrice,
          endPrice,
          quarterHigh,
          quarterLow,
          spread,
          diff,
          pct
        };
      })
      .sort((a, b) => b.pct - a.pct);
  };

  const quarterStats = getQuarterStats();
  const leader = quarterStats[0];
  const laggard = quarterStats[quarterStats.length - 1];
  const ibmStats = quarterStats.find((s) => s.symbol === 'IBM');

  return (
    <div className="view-container quarter-view">
      <div className="section-title">
        <h2>Last Quarter Comparison View (3M)</h2>
        <span className="section-desc">
          Strategic 90-day comparative benchmark, volatility spectrum, and total return analysis
        </span>
      </div>

      {/* Quarter Stat Highlights */}
      <div className="hero-stats-row">
        <div className="stat-pill-card">
          <span className="pill-label">Quarter Top Performer</span>
          <div className="pill-val positive">
            {leader?.symbol} ({formatPercent(leader?.pct)})
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">IBM 90-Day Return</span>
          <div className={`pill-val ${ibmStats?.pct >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(ibmStats?.pct)}
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">Quarter Laggard</span>
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
          title="Quarterly Relative Comparison (Base = 100%)"
        />
        <TrendAreaChart
          data={raw}
          symbol="IBM"
          color="#0f62fe"
          title="IBM 90-Day Price Trajectory"
        />
      </div>

      {/* Quarterly Performance Table */}
      <div className="summary-table-card">
        <div className="table-card-header">
          <h3>90-Day Return &amp; Range Analysis</h3>
          <span className="card-subtext">
            Comprehensive quarterly price volatility, bounds, and absolute performance
          </span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Quarter Start</th>
                <th>Latest Price</th>
                <th>Quarter Range (Low - High)</th>
                <th>Period Volatility ($ Spread)</th>
                <th>Quarter Return</th>
              </tr>
            </thead>
            <tbody>
              {quarterStats.map((item, idx) => {
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
                      {formatCurrency(item.quarterLow)} - {formatCurrency(item.quarterHigh)}
                    </td>
                    <td>{formatCurrency(item.spread)}</td>
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
