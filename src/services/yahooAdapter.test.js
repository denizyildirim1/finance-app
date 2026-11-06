import { YahooFinanceAdapter } from './yahooAdapter';

describe('YahooFinanceAdapter', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('fetches and normalizes quote list', async () => {
    const mockPayload = {
      quoteResponse: {
        result: [
          {
            symbol: 'IBM',
            regularMarketPrice: 191.2,
            regularMarketChange: 1.2,
            regularMarketChangePercent: 0.63
          }
        ]
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPayload
    });

    const adapter = new YahooFinanceAdapter('/api/test-yahoo');
    const quotes = await adapter.fetchQuotes(['IBM']);

    expect(global.fetch).toHaveBeenCalledWith('/api/test-yahoo/quote?symbols=IBM');
    expect(quotes).toHaveLength(1);
    expect(quotes[0].symbol).toBe('IBM');
    expect(quotes[0].price).toBe(191.2);
  });

  test('throws descriptive error on HTTP failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const adapter = new YahooFinanceAdapter();
    await expect(adapter.fetchQuotes(['IBM'])).rejects.toThrow('status: 500');
  });

  test('validates ticker symbol via search endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [{ symbol: 'CRM', shortname: 'Salesforce' }]
      })
    });

    const adapter = new YahooFinanceAdapter();
    const isValid = await adapter.validateSymbol('CRM');
    expect(isValid).toBe(true);
  });
});
