import React from 'react';
import { formatCurrency, formatPercent, formatVolume } from '../../utils/formatters';

export const MetricCard = ({ quote, companyMeta }) => {
  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const isPrimary = companyMeta?.isPrimary;

  return (
    <div className={`metric-card ${isPrimary ? 'primary-card' : ''}`}>
      <div className="card-header">
        <div className="ticker-info">
          <span className="ticker-symbol" style={{ color: companyMeta?.color || '#0f62fe' }}>
            {quote.symbol}
          </span>
          <span className="company-name">{companyMeta?.name || quote.name}</span>
        </div>
        {isPrimary && <span className="primary-tag">Primary</span>}
      </div>

      <div className="card-body">
        <div className="current-price">{formatCurrency(quote.price)}</div>
        <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          <span className="change-arrow">{isPositive ? '▲' : '▼'}</span>
          <span>{formatCurrency(Math.abs(quote.change))}</span>
          <span className="change-pct">({formatPercent(quote.changePercent)})</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="footer-stat">
          <span className="stat-label">Day Range:</span>
          <span className="stat-value">{formatCurrency(quote.dayLow)} - {formatCurrency(quote.dayHigh)}</span>
        </div>
        <div className="footer-stat">
          <span className="stat-label">Volume:</span>
          <span className="stat-value">{formatVolume(quote.volume)}</span>
        </div>
      </div>
    </div>
  );
};
