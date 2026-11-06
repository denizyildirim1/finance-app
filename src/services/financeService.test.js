import { FinanceService } from './financeService';

describe('FinanceService', () => {
  let service;

  beforeEach(() => {
    service = new FinanceService(null, true); // Use mock mode explicitly
  });

  test('initializes with default tracked companies including IBM', () => {
    const companies = service.getTrackedCompanies();
    expect(companies.length).toBe(5);
    const ibm = companies.find((c) => c.symbol === 'IBM');
    expect(ibm).toBeDefined();
    expect(ibm.isPrimary).toBe(true);
  });

  test('allows dynamically registering and removing a new company', () => {
    service.addTrackedCompany({ symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#ea4335' });
    let companies = service.getTrackedCompanies();
    expect(companies.some((c) => c.symbol === 'GOOGL')).toBe(true);

    service.removeTrackedCompany('GOOGL');
    companies = service.getTrackedCompanies();
    expect(companies.some((c) => c.symbol === 'GOOGL')).toBe(false);
  });

  test('retrieves normalized quotes for default companies', async () => {
    const quotes = await service.getQuotes();
    expect(quotes.length).toBe(5);
    const ibmQuote = quotes.find((q) => q.symbol === 'IBM');
    expect(ibmQuote.price).toBeGreaterThan(0);
    expect(ibmQuote.name).toBe('International Business Machines');
  });

  test('retrieves and normalizes 7-day historical indexed series', async () => {
    const hist = await service.getHistoricalData(['IBM', 'MSFT'], '7D');
    expect(hist.raw.length).toBe(7);
    expect(hist.indexed.length).toBe(7);
    // Base 100 on start date
    expect(hist.indexed[0].IBM).toBe(100);
    expect(hist.indexed[0].MSFT).toBe(100);
  });

  test('computes company trend summary stats for quarter', async () => {
    const summary = await service.getCompanyTrendSummary('IBM', '3M');
    expect(summary.startPrice).toBeGreaterThan(0);
    expect(summary.endPrice).toBeGreaterThan(0);
    expect(summary.highPrice).toBeGreaterThanOrEqual(summary.lowPrice);
  });

  test('validates ticker symbols correctly', async () => {
    const valid = await service.validateTicker('IBM');
    expect(valid).toBe(true);

    const invalid = await service.validateTicker('');
    expect(invalid).toBe(false);
  });
});
