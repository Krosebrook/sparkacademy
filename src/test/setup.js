import '@testing-library/jest-dom';

/**
 * Test Setup File
 * 
 * Safe addition: Sets up testing environment with jest-dom matchers
 * Does not affect production code
 */

// Mock window.matchMedia for hooks that use it (like useIsMobile)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
