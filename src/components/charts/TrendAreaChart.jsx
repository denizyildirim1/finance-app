import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TrendAreaChart = ({ data, symbol = 'IBM', color = '#0f62fe', title = 'Historical Trend' }) => {
  if (!data || !data.length) {
    return <div className="no-chart-data">No trend data available</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title} ({symbol})</h3>
        <span className="chart-subtext">Price movement over selected period</span>
      </div>
      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#57606a"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(v) => `$${v}`}
              stroke="#57606a"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(val) => [formatCurrency(val), symbol]}
              labelFormatter={(lbl) => formatDate(lbl)}
            />
            <Area
              type="monotone"
              dataKey={symbol}
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
