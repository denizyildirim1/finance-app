import {
  normalizeQuote,
  normalizeYahooChartResponse,
  alignMultiTickerSeries,
  normalizeIndexedSeries,
  calculateTrendStats
} from './normalizer';

describe('normalizer module', () => {
  describe('normalizeQuote', () => {
    test('handles standard quote object properly', () => {
      const raw = {
        symbol: 'IBM',
        shortName: 'International Business Machines',
        regularMarketPrice: 195.5,
        regularMarketChange: 2.5,
        regularMarketChangePercent: 1.29,
        regularMarketDayHigh: 196.0,
        regularMarketDayLow: 193.0,
        regularMarketVolume: 4200000,
        regularMarketPreviousClose: 193.0
      };
      const result = normalizeQuote(raw);
      expect(result).toEqual({
        symbol: 'IBM',
        name: 'International Business Machines',
        price: 195.5,
        change: 2.5,
        changePercent: 1.29,
        dayHigh: 196.0,
        dayLow: 193.0,
        volume: 4200000,
        previousClose: 193.0,
        currency: 'USD',
        marketCap: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null
      });
    });

    test('falls back safely for missing or partial quote data', () => {
      const result = normalizeQuote({}, { symbol: 'ORCL', name: 'Oracle Corp' });
      expect(result.symbol).toBe('ORCL');
      expect(result.name).toBe('Oracle Corp');
      expect(result.price).toBe(0);
      expect(result.change).toBe(0);
    });

    test('returns null for null raw input', () => {
      expect(normalizeQuote(null)).toBeNull();
    });
  });

  describe('normalizeYahooChartResponse', () => {
    test('parses v8 chart json structure accurately', () => {
      const mockChart = {
        chart: {
          result: [
            {
              meta: { symbol: 'IBM' },
              timestamp: [1700000000, 1700086400],
              indicators: {
                quote: [
                  {
                    open: [190.0, 192.0],
                    high: [194.0, 195.0],
                    low: [189.0, 191.0],
                    close: [193.5, 194.8],
                    volume: [1000000, 1200000]
                  }
                ]
              }
            }
          ]
        }
      };

      const rows = normalizeYahooChartResponse(mockChart);
      expect(rows.length).toBe(2);
      expect(rows[0].close).toBe(193.5);
      expect(rows[0].symbol).toBe('IBM');
      expect(rows[1].close).toBe(194.8);
    });

    test('skips null close values (market closed/no trades)', () => {
      const mockChart = {
        chart: {
          result: [
            {
              timestamp: [1700000000, 1700086400],
              indicators: {
                quote: [
                  {
                    open: [190.0, null],
                    high: [194.0, null],
                    low: [189.0, null],
                    close: [193.5, null],
                    volume: [1000000, null]
                  }
                ]
              }
            }
          ]
        }
      };

      const rows = normalizeYahooChartResponse(mockChart, 'MSFT');
      expect(rows.length).toBe(1);
      expect(rows[0].symbol).toBe('MSFT');
    });
  });

  describe('alignMultiTickerSeries', () => {
    test('merges separate ticker series by matching date', () => {
      const seriesMap = {
        IBM: [
          { date: '2025-01-01', close: 190 },
          { date: '2025-01-02', close: 192 }
        ],
        MSFT: [
          { date: '2025-01-01', close: 400 },
          { date: '2025-01-02', close: 405 }
        ]
      };

      const aligned = alignMultiTickerSeries(seriesMap);
      expect(aligned).toHaveLength(2);
      expect(aligned[0]).toEqual({ date: '2025-01-01', IBM: 190, MSFT: 400 });
      expect(aligned[1]).toEqual({ date: '2025-01-02', IBM: 192, MSFT: 405 });
    });
  });

  describe('normalizeIndexedSeries', () => {
    test('indexes multi-ticker historical rows to base-100', () => {
      const raw = [
        { date: '2025-01-01', IBM: 180, ORCL: 120 },
        { date: '2025-01-02', IBM: 198, ORCL: 114 }
      ];
      const indexed = normalizeIndexedSeries(raw, ['IBM', 'ORCL']);
      expect(indexed[0].IBM).toBe(100);
      expect(indexed[0].ORCL).toBe(100);
      expect(indexed[1].IBM).toBe(110);
      expect(indexed[1].ORCL).toBe(95);
    });

    test('returns empty array for empty series input', () => {
      expect(normalizeIndexedSeries([], ['IBM'])).toEqual([]);
      expect(normalizeIndexedSeries(null, ['IBM'])).toEqual([]);
    });
  });

  describe('calculateTrendStats', () => {
    test('computes start, end, high, low, and percent return', () => {
      const series = [
        { date: '2025-01-01', IBM: 100 },
        { date: '2025-01-02', IBM: 120 },
        { date: '2025-01-03', IBM: 90 },
        { date: '2025-01-04', IBM: 110 }
      ];

      const stats = calculateTrendStats(series, 'IBM');
      expect(stats.startPrice).toBe(100);
      expect(stats.endPrice).toBe(110);
      expect(stats.highPrice).toBe(120);
      expect(stats.lowPrice).toBe(90);
      expect(stats.diff).toBe(10);
      expect(stats.percentReturn).toBe(10);
    });

    test('returns zeroed stats for empty input', () => {
      const stats = calculateTrendStats([], 'IBM');
      expect(stats.startPrice).toBe(0);
      expect(stats.percentReturn).toBe(0);
    });
  });
});
