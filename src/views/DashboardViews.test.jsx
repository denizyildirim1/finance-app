import React from 'react';
import { render, screen } from '@testing-library/react';
import { CurrentDayView } from './CurrentDayView';
import { SevenDayView } from './SevenDayView';
import { QuarterView } from './QuarterView';
import { DEFAULT_COMPANIES } from '../constants/config';
import { MOCK_QUOTES, MOCK_SEVEN_DAY_SERIES, MOCK_QUARTER_SERIES } from '../services/mockData';
import { normalizeQuote, normalizeIndexedSeries } from '../services/normalizer';

const normalizedQuotes = DEFAULT_COMPANIES.map((c) =>
  normalizeQuote(MOCK_QUOTES[c.symbol], c)
);

const sevenDayData = {
  raw: MOCK_SEVEN_DAY_SERIES,
  indexed: normalizeIndexedSeries(
    MOCK_SEVEN_DAY_SERIES,
    DEFAULT_COMPANIES.map((c) => c.symbol)
  )
};

const quarterData = {
  raw: MOCK_QUARTER_SERIES,
  indexed: normalizeIndexedSeries(
    MOCK_QUARTER_SERIES,
    DEFAULT_COMPANIES.map((c) => c.symbol)
  )
};

describe('Dashboard Views Component Tests', () => {
  describe('CurrentDayView', () => {
    test('renders market summary hero stats and metric cards for all companies', () => {
      render(
        <CurrentDayView quotes={normalizedQuotes} companies={DEFAULT_COMPANIES} />
      );

      expect(screen.getByText(/Current Day Market Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Performer Today/i)).toBeInTheDocument();
      expect(screen.getByText(/Peer Group Avg. Movement/i)).toBeInTheDocument();

      // Check IBM and competitor cards
      expect(screen.getAllByText('IBM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('MSFT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ORCL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SAP').length).toBeGreaterThan(0);
      expect(screen.getAllByText('CRM').length).toBeGreaterThan(0);
    });
  });

  describe('SevenDayView', () => {
    test('renders 7-day relative comparison chart and return breakdown table', () => {
      render(
        <SevenDayView historicalData={sevenDayData} companies={DEFAULT_COMPANIES} />
      );

      expect(screen.getByText(/Last 7 Days Trend Comparison/i)).toBeInTheDocument();
      expect(screen.getByText(/7-Day Leader/i)).toBeInTheDocument();
      expect(screen.getByText(/IBM 7-Day Return/i)).toBeInTheDocument();
      expect(screen.getByText(/7-Day Cumulative Return Breakdown/i)).toBeInTheDocument();
    });
  });

  describe('QuarterView', () => {
    test('renders quarterly comparison view, range volatility, and ranking analysis', () => {
      render(
        <QuarterView historicalData={quarterData} companies={DEFAULT_COMPANIES} />
      );

      expect(screen.getByText(/Last Quarter Comparison View/i)).toBeInTheDocument();
      expect(screen.getByText(/Quarter Top Performer/i)).toBeInTheDocument();
      expect(screen.getByText(/IBM 90-Day Return/i)).toBeInTheDocument();
      expect(screen.getByText(/90-Day Return & Range Analysis/i)).toBeInTheDocument();
    });
  });
});
