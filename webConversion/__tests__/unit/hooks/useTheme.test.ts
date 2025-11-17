/**
 * Tests for useTheme Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../../src/hooks/useTheme';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock document.documentElement.setAttribute
const mockSetAttribute = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true,
});

function renderUseTheme() {
  return renderHook(() => useTheme(), {
    wrapper: PLCStateProvider,
  });
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockSetAttribute.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return default theme (1)', () => {
      const { result } = renderUseTheme();
      expect(result.current.theme).toBe(1);
    });

    it('should provide setTheme function', () => {
      const { result } = renderUseTheme();
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('should provide nextTheme function', () => {
      const { result } = renderUseTheme();
      expect(typeof result.current.nextTheme).toBe('function');
    });
  });

  describe('setTheme', () => {
    it('should change theme to 2', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(2);
      });

      expect(result.current.theme).toBe(2);
    });

    it('should change theme to 3', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(3);
      });

      expect(result.current.theme).toBe(3);
    });

    it('should change theme to 4', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(4);
      });

      expect(result.current.theme).toBe(4);
    });

    it('should save theme to localStorage', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(3);
      });

      expect(localStorage.getItem('plc-theme')).toBe('3');
    });

    it('should update document attribute when theme changes', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(2);
      });

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', '2');
    });
  });

  describe('nextTheme', () => {
    it('should cycle from theme 1 to 2', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.nextTheme();
      });

      expect(result.current.theme).toBe(2);
    });

    it('should cycle from theme 2 to 3', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(2);
      });

      act(() => {
        result.current.nextTheme();
      });

      expect(result.current.theme).toBe(3);
    });

    it('should cycle from theme 3 to 4', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(3);
      });

      act(() => {
        result.current.nextTheme();
      });

      expect(result.current.theme).toBe(4);
    });

    it('should cycle from theme 4 back to 1', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(4);
      });

      act(() => {
        result.current.nextTheme();
      });

      expect(result.current.theme).toBe(1);
    });

    it('should save next theme to localStorage', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.nextTheme();
      });

      expect(localStorage.getItem('plc-theme')).toBe('2');
    });
  });

  describe('Theme Persistence', () => {
    it('should load theme from localStorage on mount', () => {
      localStorage.setItem('plc-theme', '3');

      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(3);
    });

    it('should ignore invalid theme from localStorage', () => {
      localStorage.setItem('plc-theme', '5');

      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(1); // Should use default
    });

    it('should ignore theme 0 from localStorage', () => {
      localStorage.setItem('plc-theme', '0');

      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(1); // Should use default
    });

    it('should ignore non-numeric theme from localStorage', () => {
      localStorage.setItem('plc-theme', 'invalid');

      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(1); // Should use default
    });

    it('should work when localStorage is empty', () => {
      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(1);
    });
  });

  describe('Document Attribute', () => {
    it('should set data-theme attribute on document root', () => {
      renderUseTheme();

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', '1');
    });

    it('should update data-theme when theme changes', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(4);
      });

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', '4');
    });
  });

  describe('Theme Cycling', () => {
    it('should complete full cycle 1→2→3→4→1', () => {
      const { result } = renderUseTheme();

      expect(result.current.theme).toBe(1);

      act(() => {
        result.current.nextTheme();
      });
      expect(result.current.theme).toBe(2);

      act(() => {
        result.current.nextTheme();
      });
      expect(result.current.theme).toBe(3);

      act(() => {
        result.current.nextTheme();
      });
      expect(result.current.theme).toBe(4);

      act(() => {
        result.current.nextTheme();
      });
      expect(result.current.theme).toBe(1);
    });
  });

  describe('Multiple Theme Changes', () => {
    it('should handle rapid theme changes', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.setTheme(2);
        result.current.setTheme(3);
        result.current.setTheme(4);
      });

      expect(result.current.theme).toBe(4);
      expect(localStorage.getItem('plc-theme')).toBe('4');
    });

    it('should handle multiple next theme calls', () => {
      const { result } = renderUseTheme();

      act(() => {
        result.current.nextTheme();
      });

      act(() => {
        result.current.nextTheme();
      });

      act(() => {
        result.current.nextTheme();
      });

      expect(result.current.theme).toBe(4);
    });
  });
});
