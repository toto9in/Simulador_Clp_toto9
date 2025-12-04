/**
 * Tests for useToast Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../../../src/hooks/useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now for consistent IDs
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    // Mock Math.random for consistent IDs
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('Initial State', () => {
    it('should return empty toasts array initially', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('should return all toast methods', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.addToast).toBe('function');
      expect(typeof result.current.removeToast).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.info).toBe('function');
    });
  });

  describe('addToast', () => {
    it('should add a toast with specified type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('success');
    });

    it('should generate unique ID for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Toast 1', 'success');
      });

      const firstId = result.current.toasts[0].id;

      // Change mock values for next call
      vi.spyOn(Date, 'now').mockReturnValue(1234567891);
      vi.spyOn(Math, 'random').mockReturnValue(0.6);

      act(() => {
        result.current.addToast('Toast 2', 'error');
      });

      const secondId = result.current.toasts[1].id;

      expect(firstId).not.toBe(secondId);
      expect(result.current.toasts).toHaveLength(2);
    });

    it('should set default duration to 3000ms', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 'info');
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 'warning', 5000);
      });

      expect(result.current.toasts[0].duration).toBe(5000);
    });

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Toast 1', 'success');
        result.current.addToast('Toast 2', 'error');
        result.current.addToast('Toast 3', 'info');
      });

      expect(result.current.toasts).toHaveLength(3);
    });
  });

  describe('removeToast', () => {
    it('should remove toast by ID', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 'success');
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should remove only specified toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Toast 1', 'success');
      });

      const firstId = result.current.toasts[0].id;

      vi.spyOn(Date, 'now').mockReturnValue(1234567891);
      vi.spyOn(Math, 'random').mockReturnValue(0.6);

      act(() => {
        result.current.addToast('Toast 2', 'error');
      });

      act(() => {
        result.current.removeToast(firstId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Toast 2');
    });

    it('should handle removing non-existent toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 'success');
      });

      act(() => {
        result.current.removeToast('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(1);
    });

    it('should handle removing from empty list', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.removeToast('some-id');
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('success', () => {
    it('should add success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });

    it('should use default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message', 5000);
      });

      expect(result.current.toasts[0].duration).toBe(5000);
    });
  });

  describe('error', () => {
    it('should add error toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].message).toBe('Error message');
    });

    it('should use default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message', 10000);
      });

      expect(result.current.toasts[0].duration).toBe(10000);
    });
  });

  describe('warning', () => {
    it('should add warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].message).toBe('Warning message');
    });

    it('should use default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message', 7000);
      });

      expect(result.current.toasts[0].duration).toBe(7000);
    });
  });

  describe('info', () => {
    it('should add info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].message).toBe('Info message');
    });

    it('should use default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message', 4000);
      });

      expect(result.current.toasts[0].duration).toBe(4000);
    });
  });

  describe('Multiple Toast Types', () => {
    it('should handle multiple toast types simultaneously', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success!');
        result.current.error('Error!');
        result.current.warning('Warning!');
        result.current.info('Info!');
      });

      expect(result.current.toasts).toHaveLength(4);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[1].type).toBe('error');
      expect(result.current.toasts[2].type).toBe('warning');
      expect(result.current.toasts[3].type).toBe('info');
    });

    it('should maintain toast order', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('First');
        result.current.warning('Second');
        result.current.success('Third');
      });

      expect(result.current.toasts[0].message).toBe('First');
      expect(result.current.toasts[1].message).toBe('Second');
      expect(result.current.toasts[2].message).toBe('Third');
    });
  });

  describe('Toast Management', () => {
    it('should handle rapid toast additions', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        for (let i = 0; i < 10; i++) {
          vi.spyOn(Date, 'now').mockReturnValue(1234567890 + i);
          vi.spyOn(Math, 'random').mockReturnValue(0.5 + i * 0.01);
          result.current.success(`Toast ${i}`);
        }
      });

      expect(result.current.toasts).toHaveLength(10);
    });

    it('should handle rapid toast removals', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Toast 1');
      });

      const id1 = result.current.toasts[0].id;

      vi.spyOn(Date, 'now').mockReturnValue(1234567891);
      vi.spyOn(Math, 'random').mockReturnValue(0.6);

      act(() => {
        result.current.success('Toast 2');
      });

      const id2 = result.current.toasts[1].id;

      vi.spyOn(Date, 'now').mockReturnValue(1234567892);
      vi.spyOn(Math, 'random').mockReturnValue(0.7);

      act(() => {
        result.current.success('Toast 3');
      });

      act(() => {
        result.current.removeToast(id1);
        result.current.removeToast(id2);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Toast 3');
    });

    it('should handle removing all toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Toast 1');
      });

      const id1 = result.current.toasts[0].id;

      vi.spyOn(Date, 'now').mockReturnValue(1234567891);
      vi.spyOn(Math, 'random').mockReturnValue(0.6);

      act(() => {
        result.current.error('Toast 2');
      });

      const id2 = result.current.toasts[1].id;

      act(() => {
        result.current.removeToast(id1);
        result.current.removeToast(id2);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('Toast IDs', () => {
    it('should generate IDs with toast prefix', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Test');
      });

      expect(result.current.toasts[0].id).toContain('toast-');
    });

    it('should include timestamp in ID', () => {
      vi.spyOn(Date, 'now').mockReturnValue(9999999999);

      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Test');
      });

      expect(result.current.toasts[0].id).toContain('9999999999');
    });

    it('should include random component in ID', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.123456);

      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Test');
      });

      expect(result.current.toasts[0].id).toContain('0.123456');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('');
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useToast());

      const longMessage = 'A'.repeat(1000);

      act(() => {
        result.current.info(longMessage);
      });

      expect(result.current.toasts[0].message).toBe(longMessage);
    });

    it('should handle special characters in messages', () => {
      const { result } = renderHook(() => useToast());

      const specialMessage = 'Test 🚦 <div>HTML</div> "quotes" \'single\' & ampersand';

      act(() => {
        result.current.warning(specialMessage);
      });

      expect(result.current.toasts[0].message).toBe(specialMessage);
    });

    it('should handle zero duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test', 'info', 0);
      });

      expect(result.current.toasts[0].duration).toBe(0);
    });

    it('should handle very large duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test', 'info', 999999);
      });

      expect(result.current.toasts[0].duration).toBe(999999);
    });
  });

  describe('Use Cases', () => {
    it('should handle file save success notification', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('File saved successfully');
      });

      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('File saved successfully');
    });

    it('should handle compilation error notification', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Compilation failed: Invalid instruction at line 5');
      });

      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].message).toContain('Compilation failed');
    });

    it('should handle unsaved changes warning', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('You have unsaved changes');
      });

      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].message).toBe('You have unsaved changes');
    });

    it('should handle info notifications', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Program loaded from examples');
      });

      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].message).toBe('Program loaded from examples');
    });
  });

  describe('Callback Stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useToast());

      const initialAddToast = result.current.addToast;
      const initialRemoveToast = result.current.removeToast;
      const initialSuccess = result.current.success;
      const initialError = result.current.error;
      const initialWarning = result.current.warning;
      const initialInfo = result.current.info;

      rerender();

      expect(result.current.addToast).toBe(initialAddToast);
      expect(result.current.removeToast).toBe(initialRemoveToast);
      expect(result.current.success).toBe(initialSuccess);
      expect(result.current.error).toBe(initialError);
      expect(result.current.warning).toBe(initialWarning);
      expect(result.current.info).toBe(initialInfo);
    });
  });
});
