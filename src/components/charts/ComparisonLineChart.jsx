import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { formatDate } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-date">{formatDate(label)}</p>
        <div className="tooltip-items">
          {payload.map((entry) => (
            <div key={entry.name} className="tooltip-row" style={{ color: entry.color }}>
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-val">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ComparisonLineChart = ({
  data,
  companies,
  title = 'Relative Performance (Base = 100%)'
}) => {
  const [visibleSeries, setVisibleSeries] = useState(
    companies.reduce((acc, c) => ({ ...acc, [c.symbol]: true }), {})
  );

  const toggleSeries = (symbol) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  if (!data || !data.length) {
    return <div className="no-chart-data">No performance data available</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="header-text-group">
          <h3>{title}</h3>
          <span className="chart-subtext">Click badges below to toggle series visibility</span>
        </div>
        <div className="series-toggles" role="group" aria-label="Toggle series visibility">
          {companies.map((c) => {
            const isVisible = visibleSeries[c.symbol] !== false;
            return (
              <button
                key={c.symbol}
                type="button"
                className={`series-toggle-pill ${isVisible ? 'active' : 'inactive'}`}
                style={{
                  borderColor: c.color,
                  backgroundColor: isVisible ? `${c.color}15` : 'transparent',
                  color: isVisible ? c.color : '#8d8d8d'
                }}
                onClick={() => toggleSeries(c.symbol)}
                aria-pressed={isVisible}
              >
                <span
                  className="toggle-indicator"
                  style={{ backgroundColor: isVisible ? c.color : '#c6c6c6' }}
                />
                {c.symbol}
              </button>
            );
          })}
        </div>
      </div>
      <div className="chart-container" style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#57606a"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              unit="%"
              stroke="#57606a"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
            />
            {companies.map((c) => {
              if (visibleSeries[c.symbol] === false) return null;
              return (
                <Line
                  key={c.symbol}
                  type="monotone"
                  dataKey={c.symbol}
                  name={c.symbol}
                  stroke={c.color}
                  strokeWidth={c.isPrimary ? 3 : 1.75}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
