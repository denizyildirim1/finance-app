/**
 * Normalizes raw quote responses into a standard application schema.
 */
export const normalizeQuote = (rawQuote, defaultMeta = {}) => {
  if (!rawQuote) return null;

  const symbol = rawQuote.symbol || defaultMeta.symbol || 'UNKNOWN';
  const name =
    rawQuote.shortName ||
    rawQuote.longName ||
    rawQuote.displayName ||
    rawQuote.name ||
    defaultMeta.name ||
    symbol;

  const price = Number(rawQuote.regularMarketPrice ?? rawQuote.price ?? rawQuote.currentPrice ?? 0);
  const change = Number(rawQuote.regularMarketChange ?? rawQuote.change ?? 0);
  const changePercent = Number(
    rawQuote.regularMarketChangePercent ?? rawQuote.changePercent ?? 0
  );

  return {
    symbol,
    name,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    dayHigh: Number((rawQuote.regularMarketDayHigh ?? rawQuote.dayHigh ?? price).toFixed(2)),
    dayLow: Number((rawQuote.regularMarketDayLow ?? rawQuote.dayLow ?? price).toFixed(2)),
    volume: Number(rawQuote.regularMarketVolume ?? rawQuote.volume ?? 0),
    previousClose: Number(
      (rawQuote.regularMarketPreviousClose ?? rawQuote.previousClose ?? (price - change)).toFixed(2)
    ),
    currency: rawQuote.currency || 'USD',
    marketCap: rawQuote.marketCap ?? null,
    fiftyTwoWeekHigh: rawQuote.fiftyTwoWeekHigh ? Number(rawQuote.fiftyTwoWeekHigh.toFixed(2)) : null,
    fiftyTwoWeekLow: rawQuote.fiftyTwoWeekLow ? Number(rawQuote.fiftyTwoWeekLow.toFixed(2)) : null
  };
};

/**
 * Normalizes a raw Yahoo Finance v8 chart JSON response into a date-sorted array of candles.
 */
export const normalizeYahooChartResponse = (chartData, fallbackSymbol = '') => {
  if (!chartData) return [];

  const result = chartData?.chart?.result?.[0] || chartData?.result?.[0] || chartData;
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    return [];
  }

  const { timestamp, indicators } = result;
  const quote = indicators.quote[0];
  const { open = [], high = [], low = [], close = [], volume = [] } = quote;

  const rows = [];
  for (let i = 0; i < timestamp.length; i++) {
    const rawClose = close[i];
    // Filter out market closures or null values
    if (rawClose !== null && rawClose !== undefined && !isNaN(rawClose)) {
      const date = new Date(timestamp[i] * 1000).toISOString().split('T')[0];
      rows.push({
        date,
        timestamp: timestamp[i],
        open: open[i] !== null ? Number(open[i].toFixed(2)) : Number(rawClose.toFixed(2)),
        high: high[i] !== null ? Number(high[i].toFixed(2)) : Number(rawClose.toFixed(2)),
        low: low[i] !== null ? Number(low[i].toFixed(2)) : Number(rawClose.toFixed(2)),
        close: Number(rawClose.toFixed(2)),
        volume: volume[i] || 0,
        symbol: fallbackSymbol || result.meta?.symbol || ''
      });
    }
  }

  return rows;
};

/**
 * Aligns and merges multiple individual ticker series into a unified tabular array by date.
 */
export const alignMultiTickerSeries = (seriesBySymbol) => {
  const dateMap = {};

  Object.entries(seriesBySymbol).forEach(([symbol, rows]) => {
    (rows || []).forEach((row) => {
      if (!dateMap[row.date]) {
        dateMap[row.date] = { date: row.date };
      }
      dateMap[row.date][symbol] = row.close ?? row[symbol];
    });
  });

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Normalizes historical data series into a base-100 indexed performance format
 * so stocks with different price points (e.g. IBM $190 vs MSFT $420) can be
 * compared directly on a unified scale.
 */
export const normalizeIndexedSeries = (series, symbols) => {
  if (!series || !series.length) return [];
  const baseRow = series[0];

  return series.map((row) => {
    const normalizedRow = { date: row.date };
    symbols.forEach((sym) => {
      const basePrice = baseRow[sym];
      const currentPrice = row[sym];
      if (basePrice && currentPrice !== undefined) {
        normalizedRow[sym] = Number(((currentPrice / basePrice) * 100).toFixed(2));
        normalizedRow[`${sym}_raw`] = currentPrice;
      }
    });
    return normalizedRow;
  });
};

/**
 * Computes return and range statistics for a given company series over a time window.
 */
export const calculateTrendStats = (series, symbol) => {
  if (!series || !series.length) {
    return { startPrice: 0, endPrice: 0, highPrice: 0, lowPrice: 0, diff: 0, percentReturn: 0 };
  }

  const prices = series.map((r) => r[symbol] ?? r.close).filter((p) => p !== undefined && p !== null);
  if (!prices.length) {
    return { startPrice: 0, endPrice: 0, highPrice: 0, lowPrice: 0, diff: 0, percentReturn: 0 };
  }

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const diff = Number((endPrice - startPrice).toFixed(2));
  const percentReturn = startPrice > 0 ? Number(((diff / startPrice) * 100).toFixed(2)) : 0;

  return {
    startPrice,
    endPrice,
    highPrice,
    lowPrice,
    diff,
    percentReturn
  };
};
