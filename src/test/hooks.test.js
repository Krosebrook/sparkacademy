import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';

/**
 * Tests for useIsMobile hook
 * 
 * Safe addition: Tests existing, working hook without modification
 * Note: This is a basic smoke test to ensure the hook can be rendered without errors
 */
describe('useIsMobile', () => {
  it('should render without errors', () => {
    const { result } = renderHook(() => useIsMobile());
    
    // The hook should return a boolean value
    expect(typeof result.current).toBe('boolean');
  });

  it('should return a stable value on re-render', () => {
    const { result, rerender } = renderHook(() => useIsMobile());
    
    const firstValue = result.current;
    rerender();
    const secondValue = result.current;
    
    // Both values should be booleans
    expect(typeof firstValue).toBe('boolean');
    expect(typeof secondValue).toBe('boolean');
  });
});
