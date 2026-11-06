import '@testing-library/jest-dom';

// Polyfill ResizeObserver for Recharts in JSDOM environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
