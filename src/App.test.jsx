import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { normalizeQuote, normalizeIndexedSeries } from './services/normalizer';

describe('App Smoke and Tab Navigation', () => {
  test('renders header and initial navigation tabs', async () => {
    render(<App />);
    expect(screen.getByText(/Market Analytics Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Last 7 Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Quarter/i)).toBeInTheDocument();

    // Wait for mock data to resolve
    await waitFor(() => {
      const ibmElements = screen.getAllByText('IBM');
      expect(ibmElements.length).toBeGreaterThan(0);
    });
  });

  test('switches tabs smoothly when clicked', async () => {
    render(<App />);
    const sevenDayTab = screen.getByRole('tab', { name: /Last 7 Days/i });
    fireEvent.click(sevenDayTab);
    expect(sevenDayTab).toHaveClass('active');

    const quarterTab = screen.getByRole('tab', { name: /Last Quarter/i });
    fireEvent.click(quarterTab);
    expect(quarterTab).toHaveClass('active');
  });
});

describe('Normalizer Unit Tests', () => {
  test('normalizes quote correctly', () => {
    const raw = {
      symbol: 'IBM',
      regularMarketPrice: 190.5,
      regularMarketChange: 1.5,
      regularMarketChangePercent: 0.79,
      regularMarketDayHigh: 191.0,
      regularMarketDayLow: 189.0,
      regularMarketVolume: 3500000,
      regularMarketPreviousClose: 189.0
    };
    const normalized = normalizeQuote(raw);
    expect(normalized.symbol).toBe('IBM');
    expect(normalized.price).toBe(190.5);
    expect(normalized.change).toBe(1.5);
    expect(normalized.changePercent).toBe(0.79);
  });

  test('indexes multi-ticker historical series to base-100', () => {
    const series = [
      { date: '2025-01-01', IBM: 100, MSFT: 200 },
      { date: '2025-01-02', IBM: 110, MSFT: 190 }
    ];
    const indexed = normalizeIndexedSeries(series, ['IBM', 'MSFT']);
    expect(indexed[0].IBM).toBe(100);
    expect(indexed[0].MSFT).toBe(100);
    expect(indexed[1].IBM).toBe(110);
    expect(indexed[1].MSFT).toBe(95);
  });
});
