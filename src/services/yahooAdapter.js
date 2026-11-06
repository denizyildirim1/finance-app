import { normalizeQuote, normalizeYahooChartResponse } from './normalizer';

/**
 * Adapter for Yahoo Finance v7/v8 HTTP endpoints and proxy services.
 */
export class YahooFinanceAdapter {
  constructor(baseUrl = '/api/yahoo') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches real-time quote summaries for multiple symbols.
   */
  async fetchQuotes(symbols) {
    const symbolList = Array.isArray(symbols) ? symbols.join(',') : symbols;
    const url = `${this.baseUrl}/quote?symbols=${encodeURIComponent(symbolList)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo Finance quote request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const resultList = data?.quoteResponse?.result || data?.result || data || [];

    return resultList.map((item) => normalizeQuote(item));
  }

  /**
   * Fetches historical chart data for a symbol across a specified time range.
   * @param {string} symbol - Ticker symbol (e.g., 'IBM')
   * @param {'1d'|'5d'|'7d'|'1mo'|'3mo'|'1y'} range - Historical time range
   * @param {'1m'|'5m'|'15m'|'1d'|'1wk'} interval - Aggregation interval
   */
  async fetchChart(symbol, range = '3mo', interval = '1d') {
    const url = `${this.baseUrl}/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo Finance chart request for ${symbol} failed: ${response.status}`);
    }

    const data = await response.json();
    return normalizeYahooChartResponse(data, symbol);
  }

  /**
   * Validates if a symbol exists on Yahoo Finance.
   */
  async validateSymbol(symbol) {
    if (!symbol || typeof symbol !== 'string') return false;
    const cleanSymbol = symbol.trim().toUpperCase();

    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(cleanSymbol)}`;
      const response = await fetch(url);
      if (!response.ok) return false;

      const data = await response.json();
      const quotes = data?.quotes || [];
      return quotes.some((q) => q.symbol === cleanSymbol);
    } catch {
      return false;
    }
  }
}

export const defaultYahooAdapter = new YahooFinanceAdapter();
