import React from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { formatCurrency, formatPercent, formatVolume } from '../utils/formatters';

export const CurrentDayView = ({ quotes, companies }) => {
  const metaMap = companies.reduce((acc, c) => ({ ...acc, [c.symbol]: c }), {});
  const ibmQuote = quotes.find((q) => q.symbol === 'IBM');
  const competitors = quotes.filter((q) => q.symbol !== 'IBM');

  // Sorted list for leaderboard
  const sortedQuotes = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const topGainer = sortedQuotes[0];
  const topDecliner = sortedQuotes[sortedQuotes.length - 1];
  const avgMovement =
    quotes.reduce((acc, q) => acc + q.changePercent, 0) / (quotes.length || 1);

  return (
    <div className="view-container current-day-view">
      <div className="section-title">
        <h2>Current Day Market Summary</h2>
        <span className="section-desc">
          Intraday snapshot and live valuation tracking for IBM &amp; major peers
        </span>
      </div>

      {/* Hero Overview Statistics */}
      <div className="hero-stats-row">
        <div className="stat-pill-card">
          <span className="pill-label">Top Performer Today</span>
          <div className="pill-val positive">
            {topGainer?.symbol} ({formatPercent(topGainer?.changePercent)})
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">Top Decliner Today</span>
          <div className="pill-val negative">
            {topDecliner?.symbol} ({formatPercent(topDecliner?.changePercent)})
          </div>
        </div>
        <div className="stat-pill-card">
          <span className="pill-label">Peer Group Avg. Movement</span>
          <div className={`pill-val ${avgMovement >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(avgMovement)}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        {ibmQuote && (
          <MetricCard quote={ibmQuote} companyMeta={metaMap['IBM']} />
        )}
        {competitors.map((q) => (
          <MetricCard key={q.symbol} quote={q} companyMeta={metaMap[q.symbol]} />
        ))}
      </div>

      {/* Intraday Leaderboard Table */}
      <div className="summary-table-card">
        <div className="table-card-header">
          <h3>Intraday Market Leaderboard</h3>
          <span className="card-subtext">Ranked in real-time by percentage price change</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Last Price</th>
                <th>Change ($)</th>
                <th>Change (%)</th>
                <th>Intraday Range</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotes.map((q, idx) => {
                const isPos = q.change >= 0;
                const meta = metaMap[q.symbol];
                return (
                  <tr key={q.symbol} className={meta?.isPrimary ? 'primary-row' : ''}>
                    <td><span className="rank-badge">#{idx + 1}</span></td>
                    <td className="company-cell font-medium">{meta?.name || q.name}</td>
                    <td>
                      <span className="table-ticker" style={{ color: meta?.color || '#0f62fe' }}>
                        {q.symbol}
                      </span>
                    </td>
                    <td className="font-semibold">{formatCurrency(q.price)}</td>
                    <td className={isPos ? 'positive' : 'negative'}>
                      {isPos ? '+' : ''}{formatCurrency(q.change)}
                    </td>
                    <td className={`font-semibold ${isPos ? 'positive' : 'negative'}`}>
                      {formatPercent(q.changePercent)}
                    </td>
                    <td className="range-cell">
                      {formatCurrency(q.dayLow)} - {formatCurrency(q.dayHigh)}
                    </td>
                    <td>{formatVolume(q.volume)}</td>
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
