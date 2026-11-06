import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

describe('MetricCard UI component', () => {
  const sampleQuote = {
    symbol: 'IBM',
    name: 'International Business Machines',
    price: 191.45,
    change: 2.15,
    changePercent: 1.13,
    dayHigh: 192.3,
    dayLow: 189.8,
    volume: 3820000
  };

  const sampleMeta = {
    symbol: 'IBM',
    name: 'International Business Machines',
    color: '#0f62fe',
    isPrimary: true
  };

  test('renders company symbol, price, and primary badge', () => {
    render(<MetricCard quote={sampleQuote} companyMeta={sampleMeta} />);
    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('$191.45')).toBeInTheDocument();
    expect(screen.getByText(/Primary/i)).toBeInTheDocument();
    expect(screen.getByText(/3.82M/i)).toBeInTheDocument();
  });

  test('renders positive delta with upward arrow', () => {
    render(<MetricCard quote={sampleQuote} companyMeta={sampleMeta} />);
    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.getByText('(+1.13%)')).toBeInTheDocument();
  });

  test('renders negative delta correctly', () => {
    const negativeQuote = {
      ...sampleQuote,
      symbol: 'MSFT',
      change: -3.2,
      changePercent: -0.75
    };
    render(
      <MetricCard
        quote={negativeQuote}
        companyMeta={{ symbol: 'MSFT', name: 'Microsoft', isPrimary: false }}
      />
    );
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('(-0.75%)')).toBeInTheDocument();
  });

  test('renders nothing when quote is null', () => {
    const { container } = render(<MetricCard quote={null} companyMeta={sampleMeta} />);
    expect(container.firstChild).toBeNull();
  });
});
