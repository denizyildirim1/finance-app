import { formatCurrency, formatPercent, formatVolume, formatDate } from './formatters';

describe('formatters utility module', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly as USD', () => {
      expect(formatCurrency(191.45)).toBe('$191.45');
      expect(formatCurrency(420)).toBe('$420.00');
    });

    test('formats zero and negative numbers', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-15.5)).toBe('-$15.50');
    });

    test('handles null, undefined, or NaN safely', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency(NaN)).toBe('$0.00');
    });
  });

  describe('formatPercent', () => {
    test('adds plus sign for positive percentages', () => {
      expect(formatPercent(1.23)).toBe('+1.23%');
      expect(formatPercent(15.0)).toBe('+15.00%');
    });

    test('formats zero and negative percentages', () => {
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(-2.456)).toBe('-2.46%');
    });

    test('handles null or invalid input safely', () => {
      expect(formatPercent(null)).toBe('0.00%');
      expect(formatPercent(undefined)).toBe('0.00%');
    });
  });

  describe('formatVolume', () => {
    test('formats billions, millions, and thousands', () => {
      expect(formatVolume(1500000000)).toBe('1.50B');
      expect(formatVolume(4200000)).toBe('4.20M');
      expect(formatVolume(75000)).toBe('75.0K');
      expect(formatVolume(500)).toBe('500');
    });

    test('handles zero and null volume safely', () => {
      expect(formatVolume(0)).toBe('0');
      expect(formatVolume(null)).toBe('0');
      expect(formatVolume(undefined)).toBe('0');
    });
  });

  describe('formatDate', () => {
    test('formats ISO date string into short month/day', () => {
      const formatted = formatDate('2025-03-15');
      expect(formatted).toMatch(/Mar/);
    });

    test('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });
});
