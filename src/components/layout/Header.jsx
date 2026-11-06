import React from 'react';

export const Header = ({ onRefresh, loading }) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-badge">IBM Finance Lab</div>
        <h1>Market Analytics Dashboard</h1>
      </div>
      <div className="header-actions">
        <div className="market-pill">
          <span className="live-dot" />
          <span>Market Live</span>
        </div>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh market data"
        >
          {loading ? 'Updating...' : '⟳ Refresh'}
        </button>
      </div>
    </header>
  );
};
