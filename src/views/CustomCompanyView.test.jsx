import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomCompanyView } from './CustomCompanyView';

describe('CustomCompanyView Component Tests', () => {
  test('renders search input, suggestion pills, and loads default AAPL data', async () => {
    render(<CustomCompanyView />);

    expect(screen.getByText(/Custom Company Analysis & Graph/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter ticker/i)).toBeInTheDocument();

    // Verify quick suggestion pills
    expect(screen.getByRole('button', { name: 'AAPL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NVDA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GOOGL' })).toBeInTheDocument();

    // Wait for initial default ticker (AAPL) to resolve and search button to become enabled
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyze Ticker/i })).toBeInTheDocument();
    });
  });

  test('updates active ticker when quick suggestion pill is clicked', async () => {
    render(<CustomCompanyView />);

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    const nvdaBtn = screen.getByRole('button', { name: 'NVDA' });
    fireEvent.click(nvdaBtn);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeInTheDocument();
    });
  });

  test('switches time range between 7D and 3M', async () => {
    render(<CustomCompanyView />);

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    const quarterBtn = screen.getByRole('button', { name: /3M \(Quarter\)/i });
    fireEvent.click(quarterBtn);
    expect(quarterBtn).toHaveClass('active');
  });

  test('handles invalid symbol input gracefully with error notice', async () => {
    render(<CustomCompanyView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Analyze Ticker/i })).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Enter ticker/i);
    const searchBtn = screen.getByRole('button', { name: /Analyze Ticker/i });

    // Enter empty or whitespace ticker symbol
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Lookup Notice/i)).toBeInTheDocument();
    });
  });
});
