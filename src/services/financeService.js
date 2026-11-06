import {
  MOCK_QUOTES,
  MOCK_SEVEN_DAY_SERIES,
  MOCK_QUARTER_SERIES,
  generateDynamicQuote,
  generateHistoricalSeries
} from './mockData';
import {
  normalizeQuote,
  normalizeIndexedSeries,
  alignMultiTickerSeries,
  calculateTrendStats
} from './normalizer';
import { defaultYahooAdapter } from './yahooAdapter';
import { DEFAULT_COMPANIES } from '../constants/config';

export class FinanceService {
  constructor(adapter = defaultYahooAdapter, useMock = null) {
    this.adapter = adapter;
    this.useMock =
      useMock !== null
        ? useMock
        : process.env.REACT_APP_USE_MOCK !== 'false';
    this.trackedCompanies = [...DEFAULT_COMPANIES];
  }

  getTrackedCompanies() {
    return [...this.trackedCompanies];
  }

  addTrackedCompany(company) {
    if (!company || !company.symbol) return;
    const cleanSymbol = company.symbol.trim().toUpperCase();
    const exists = this.trackedCompanies.some((c) => c.symbol === cleanSymbol);
    if (!exists) {
      this.trackedCompanies.push({
        symbol: cleanSymbol,
        name: company.name || cleanSymbol,
        color: company.color || '#6366f1',
        isPrimary: Boolean(company.isPrimary)
      });
    }
  }

  removeTrackedCompany(symbol) {
    const cleanSymbol = symbol.trim().toUpperCase();
    this.trackedCompanies = this.trackedCompanies.filter((c) => c.symbol !== cleanSymbol);
  }

  resetTrackedCompanies() {
    this.trackedCompanies = [...DEFAULT_COMPANIES];
  }

  async getQuotes(companiesOrSymbols = this.trackedCompanies) {
    const list = companiesOrSymbols.map((item) =>
      typeof item === 'string' ? { symbol: item.toUpperCase() } : item
    );
    const symbols = list.map((c) => c.symbol);

    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return list.map((c) => {
        const raw = MOCK_QUOTES[c.symbol] || generateDynamicQuote(c.symbol);
        return normalizeQuote(raw, c);
      });
    }

    try {
      const liveQuotes = await this.adapter.fetchQuotes(symbols);
      const quoteMap = liveQuotes.reduce((acc, q) => ({ ...acc, [q.symbol]: q }), {});
      return list.map((c) => quoteMap[c.symbol] || normalizeQuote(generateDynamicQuote(c.symbol), c));
    } catch (err) {
      console.warn('Live Yahoo quote request failed, using mock data:', err.message);
      return list.map((c) => normalizeQuote(generateDynamicQuote(c.symbol), c));
    }
  }

  async getHistoricalData(symbols, range = '7D') {
    const cleanSymbols = symbols.map((s) => s.toUpperCase());

    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const days = range === '7D' ? 7 : 65;
      const customTicker = cleanSymbols.find((s) => !MOCK_QUOTES[s]);
      const rawSeries = customTicker
        ? generateHistoricalSeries(MOCK_QUOTES, days, customTicker)
        : range === '7D'
        ? MOCK_SEVEN_DAY_SERIES
        : MOCK_QUARTER_SERIES;

      return {
        raw: rawSeries,
        indexed: normalizeIndexedSeries(rawSeries, cleanSymbols)
      };
    }

    try {
      const yahooRange = range === '7D' ? '7d' : '3mo';
      const seriesPromises = cleanSymbols.map(async (sym) => {
        const rows = await this.adapter.fetchChart(sym, yahooRange, '1d');
        return { symbol: sym, rows };
      });

      const results = await Promise.all(seriesPromises);
      const seriesBySymbol = results.reduce((acc, r) => ({ ...acc, [r.symbol]: r.rows }), {});
      const alignedRaw = alignMultiTickerSeries(seriesBySymbol);

      return {
        raw: alignedRaw,
        indexed: normalizeIndexedSeries(alignedRaw, cleanSymbols)
      };
    } catch (err) {
      console.warn('Live Yahoo chart request failed, falling back to mock fixtures:', err.message);
      const days = range === '7D' ? 7 : 65;
      const customTicker = cleanSymbols.find((s) => !MOCK_QUOTES[s]);
      const rawSeries = customTicker
        ? generateHistoricalSeries(MOCK_QUOTES, days, customTicker)
        : range === '7D'
        ? MOCK_SEVEN_DAY_SERIES
        : MOCK_QUARTER_SERIES;

      return {
        raw: rawSeries,
        indexed: normalizeIndexedSeries(rawSeries, cleanSymbols)
      };
    }
  }

  async getCompanyTrendSummary(symbol, range = '7D') {
    const { raw } = await this.getHistoricalData([symbol], range);
    return calculateTrendStats(raw, symbol.toUpperCase());
  }

  async validateTicker(symbol) {
    if (!symbol || typeof symbol !== 'string') return false;
    const clean = symbol.trim().toUpperCase();
    if (clean.length < 1 || clean.length > 6) return false;

    if (this.useMock) {
      return Boolean(MOCK_QUOTES[clean] || /^[A-Z]{1,5}$/.test(clean));
    }

    return this.adapter.validateSymbol(clean);
  }
}

export const financeService = new FinanceService();
