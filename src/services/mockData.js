export const MOCK_QUOTES = {
  IBM: {
    symbol: 'IBM',
    name: 'International Business Machines',
    price: 191.45,
    change: 2.15,
    changePercent: 1.13,
    dayHigh: 192.30,
    dayLow: 189.80,
    volume: 3820000,
    previousClose: 189.30
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 420.55,
    change: -1.80,
    changePercent: -0.43,
    dayHigh: 424.10,
    dayLow: 418.90,
    volume: 18450000,
    previousClose: 422.35
  },
  ORCL: {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    price: 138.20,
    change: 1.65,
    changePercent: 1.21,
    dayHigh: 139.00,
    dayLow: 136.50,
    volume: 6420000,
    previousClose: 136.55
  },
  SAP: {
    symbol: 'SAP',
    name: 'SAP SE',
    price: 198.80,
    change: 0.90,
    changePercent: 0.45,
    dayHigh: 199.50,
    dayLow: 197.10,
    volume: 2150000,
    previousClose: 197.90
  },
  CRM: {
    symbol: 'CRM',
    name: 'Salesforce, Inc.',
    price: 275.30,
    change: -3.40,
    changePercent: -1.22,
    dayHigh: 279.80,
    dayLow: 273.90,
    volume: 4890000,
    previousClose: 278.70
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 228.40,
    change: 3.10,
    changePercent: 1.38,
    dayHigh: 229.80,
    dayLow: 226.10,
    volume: 45200000,
    previousClose: 225.30
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 124.75,
    change: 4.85,
    changePercent: 4.05,
    dayHigh: 126.00,
    dayLow: 121.50,
    volume: 68900000,
    previousClose: 119.90
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 178.60,
    change: -0.90,
    changePercent: -0.50,
    dayHigh: 180.20,
    dayLow: 177.30,
    volume: 19800000,
    previousClose: 179.50
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 186.20,
    change: 2.40,
    changePercent: 1.31,
    dayHigh: 187.50,
    dayLow: 184.10,
    volume: 29400000,
    previousClose: 183.80
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 585.90,
    change: 7.20,
    changePercent: 1.24,
    dayHigh: 589.00,
    dayLow: 580.50,
    volume: 12300000,
    previousClose: 578.70
  }
};

export const generateDynamicQuote = (symbol) => {
  const clean = symbol.toUpperCase();
  if (MOCK_QUOTES[clean]) return MOCK_QUOTES[clean];

  const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = Number(((hash % 300) + 50).toFixed(2));
  const change = Number((((hash % 100) - 45) / 10).toFixed(2));
  const changePercent = Number(((change / basePrice) * 100).toFixed(2));

  return {
    symbol: clean,
    name: `${clean} Technologies Corp.`,
    price: basePrice,
    change,
    changePercent,
    dayHigh: Number((basePrice * 1.02).toFixed(2)),
    dayLow: Number((basePrice * 0.98).toFixed(2)),
    volume: (hash % 10 + 1) * 2000000,
    previousClose: Number((basePrice - change).toFixed(2))
  };
};

export const generateHistoricalSeries = (baseQuotes, days, customSymbol = null) => {
  const dates = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const quotesMap = { ...baseQuotes };
  if (customSymbol && !quotesMap[customSymbol]) {
    quotesMap[customSymbol] = generateDynamicQuote(customSymbol);
  }

  return dates.map((date, idx) => {
    const row = { date };
    Object.keys(quotesMap).forEach((symbol) => {
      const q = quotesMap[symbol];
      const factor = 1 + Math.sin(idx * 0.4 + symbol.charCodeAt(0)) * 0.04 + (idx / days) * 0.05;
      const rawPrice = Number((q.price * factor).toFixed(2));
      row[symbol] = rawPrice;
    });
    return row;
  });
};

export const MOCK_SEVEN_DAY_SERIES = generateHistoricalSeries(MOCK_QUOTES, 7);
export const MOCK_QUARTER_SERIES = generateHistoricalSeries(MOCK_QUOTES, 65);
