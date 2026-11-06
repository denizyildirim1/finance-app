export const DEFAULT_COMPANIES = [
  { symbol: 'IBM', name: 'International Business Machines', color: '#0f62fe', isPrimary: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', color: '#0078d4', isPrimary: false },
  { symbol: 'ORCL', name: 'Oracle Corporation', color: '#c74634', isPrimary: false },
  { symbol: 'SAP', name: 'SAP SE', color: '#008fd3', isPrimary: false },
  { symbol: 'CRM', name: 'Salesforce, Inc.', color: '#00a1e0', isPrimary: false }
];

export const TIME_WINDOWS = {
  CURRENT_DAY: '1D',
  SEVEN_DAYS: '7D',
  QUARTER: '3M'
};

export const TIME_WINDOW_LABELS = {
  [TIME_WINDOWS.CURRENT_DAY]: 'Current Day',
  [TIME_WINDOWS.SEVEN_DAYS]: 'Last 7 Days',
  [TIME_WINDOWS.QUARTER]: 'Last Quarter'
};
