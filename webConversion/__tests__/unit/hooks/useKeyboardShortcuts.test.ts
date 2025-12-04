/**
 * Tests for useKeyboardShortcuts Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, KeyboardShortcut } from '../../../src/hooks/useKeyboardShortcuts';

function createKeyboardEvent(
  key: string,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey: options.ctrl || false,
    shiftKey: options.shift || false,
    altKey: options.alt || false,
    metaKey: options.meta || false,
    bubbles: true,
    cancelable: true,
  });
}

describe('useKeyboardShortcuts', () => {
  const mockHandler1 = vi.fn();
  const mockHandler2 = vi.fn();
  const mockHandler3 = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should register keyboard shortcuts', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save file',
        },
      ];

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useKeyboardShortcuts(shortcuts));

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save file',
        },
      ];

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Single Key Shortcuts', () => {
    it('should trigger handler for simple key press', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'a',
          handler: mockHandler1,
          description: 'Action A',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('a');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1);
    });

    it('should be case insensitive', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'A',
          handler: mockHandler1,
          description: 'Action A',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('a');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should handle function keys', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'F5',
          handler: mockHandler1,
          description: 'Refresh',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('F5');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should handle special keys', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'Escape',
          handler: mockHandler1,
          description: 'Close',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('Escape');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });
  });

  describe('Ctrl Modifier', () => {
    it('should trigger handler for Ctrl+Key', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should trigger handler for Meta+Key (Mac)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { meta: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should not trigger without Ctrl when Ctrl is required', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).not.toHaveBeenCalled();
    });
  });

  describe('Shift Modifier', () => {
    it('should trigger handler for Shift+Key', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'A',
          shift: true,
          handler: mockHandler1,
          description: 'Action',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('A', { shift: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should not trigger without Shift when Shift is required', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'A',
          shift: true,
          handler: mockHandler1,
          description: 'Action',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('A');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).not.toHaveBeenCalled();
    });
  });

  describe('Alt Modifier', () => {
    it('should trigger handler for Alt+Key', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'F4',
          alt: true,
          handler: mockHandler1,
          description: 'Close window',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('F4', { alt: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should not trigger without Alt when Alt is required', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'F4',
          alt: true,
          handler: mockHandler1,
          description: 'Close window',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('F4');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Modifiers', () => {
    it('should trigger handler for Ctrl+Shift+Key', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'S',
          ctrl: true,
          shift: true,
          handler: mockHandler1,
          description: 'Save As',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('S', { ctrl: true, shift: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should trigger handler for Ctrl+Alt+Key', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'Delete',
          ctrl: true,
          alt: true,
          handler: mockHandler1,
          description: 'Task Manager',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('Delete', { ctrl: true, alt: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should require all specified modifiers', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'K',
          ctrl: true,
          shift: true,
          handler: mockHandler1,
          description: 'Command',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Only Ctrl pressed
      const event1 = createKeyboardEvent('K', { ctrl: true });

      act(() => {
        window.dispatchEvent(event1);
      });

      expect(mockHandler1).not.toHaveBeenCalled();

      // Both Ctrl and Shift pressed
      const event2 = createKeyboardEvent('K', { ctrl: true, shift: true });

      act(() => {
        window.dispatchEvent(event2);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Shortcuts', () => {
    it('should handle multiple shortcuts', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
        {
          key: 'o',
          ctrl: true,
          handler: mockHandler2,
          description: 'Open',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event1 = createKeyboardEvent('s', { ctrl: true });
      act(() => {
        window.dispatchEvent(event1);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).not.toHaveBeenCalled();

      const event2 = createKeyboardEvent('o', { ctrl: true });
      act(() => {
        window.dispatchEvent(event2);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
    });

    it('should only trigger first matching shortcut', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save 1',
        },
        {
          key: 's',
          ctrl: true,
          handler: mockHandler2,
          description: 'Save 2',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).not.toHaveBeenCalled();
    });
  });

  describe('Event Prevention', () => {
    it('should prevent default when shortcut matches', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { ctrl: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default when no shortcut matches', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('a', { ctrl: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Enabled Option', () => {
    it('should not register shortcuts when disabled', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useKeyboardShortcuts(shortcuts, false));

      const calls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown');
      expect(calls.length).toBe(0);
    });

    it('should not trigger handlers when disabled', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts, false));

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).not.toHaveBeenCalled();
    });

    it('should default enabled to true', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });
  });

  describe('Common Shortcuts', () => {
    it('should handle Ctrl+S (Save)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should handle Ctrl+O (Open)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'o',
          ctrl: true,
          handler: mockHandler1,
          description: 'Open',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('o', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should handle F5 (Run)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'F5',
          handler: mockHandler1,
          description: 'Run',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('F5');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should handle Escape (Close)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'Escape',
          handler: mockHandler1,
          description: 'Close',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('Escape');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty shortcuts array', () => {
      const shortcuts: KeyboardShortcut[] = [];

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));

      expect(result).toBeDefined();

      const event = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event);
      });

      // Should not throw
      expect(mockHandler1).not.toHaveBeenCalled();
    });

    it('should handle rapid key presses', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event1 = createKeyboardEvent('s', { ctrl: true });
      const event2 = createKeyboardEvent('s', { ctrl: true });
      const event3 = createKeyboardEvent('s', { ctrl: true });

      act(() => {
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        window.dispatchEvent(event3);
      });

      expect(mockHandler1).toHaveBeenCalledTimes(3);
    });

    it('should handle shortcuts with no modifiers specified', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'Enter',
          handler: mockHandler1,
          description: 'Submit',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = createKeyboardEvent('Enter');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).toHaveBeenCalled();
    });

    it('should not trigger when extra modifiers are pressed', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          handler: mockHandler1,
          description: 'Save',
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Pressing Ctrl+Shift+S when shortcut is only Ctrl+S
      const event = createKeyboardEvent('s', { ctrl: true, shift: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler1).not.toHaveBeenCalled();
    });
  });
});
