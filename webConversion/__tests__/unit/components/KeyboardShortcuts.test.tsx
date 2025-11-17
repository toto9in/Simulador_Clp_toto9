/**
 * Tests for KeyboardShortcuts Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { KeyboardShortcuts } from '../../../src/components/KeyboardShortcuts/KeyboardShortcuts';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ToastProvider } from '../../../src/context/ToastContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock FileIO Service
vi.mock('../../../src/services/fileIO', () => ({
  FileIOService: {
    saveProgramToFile: vi.fn().mockResolvedValue(undefined),
    openProgram: vi.fn().mockResolvedValue('LD I0.0\nOUT Q0.0'),
  },
}));

// Mock useKeyboardShortcuts hook
const mockUseKeyboardShortcuts = vi.fn();
vi.mock('../../../src/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: (shortcuts: unknown, enabled: boolean) => {
    mockUseKeyboardShortcuts(shortcuts, enabled);
  },
}));

function renderKeyboardShortcuts(props = {}) {
  const defaultProps = {
    onOpenHelp: vi.fn(),
    onOpenAbout: vi.fn(),
    onOpenDataTable: vi.fn(),
  };

  return render(
    <ToastProvider>
      <PLCStateProvider>
        <KeyboardShortcuts {...defaultProps} {...props} />
      </PLCStateProvider>
    </ToastProvider>
  );
}

describe('KeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render any visible UI', () => {
      const { container } = renderKeyboardShortcuts();
      expect(container.firstChild).toBeNull();
    });

    it('should initialize keyboard shortcuts hook', () => {
      renderKeyboardShortcuts();
      expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
    });

    it('should register shortcuts with enabled=true', () => {
      renderKeyboardShortcuts();
      const calls = mockUseKeyboardShortcuts.mock.calls;
      expect(calls[0][1]).toBe(true); // Second argument should be true
    });
  });

  describe('Shortcut Registration', () => {
    it('should register file operation shortcuts', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];
      expect(Array.isArray(shortcuts)).toBe(true);
      expect(shortcuts.length).toBeGreaterThan(0);

      // Check for Ctrl+S (Save)
      const saveShortcut = shortcuts.find(
        (s: { key: string; ctrl?: boolean }) => s.key === 's' && s.ctrl
      );
      expect(saveShortcut).toBeTruthy();
      expect(saveShortcut.description).toBe('Save program');

      // Check for Ctrl+O (Open)
      const openShortcut = shortcuts.find(
        (s: { key: string; ctrl?: boolean }) => s.key === 'o' && s.ctrl
      );
      expect(openShortcut).toBeTruthy();
      expect(openShortcut.description).toBe('Open program');
    });

    it('should register execution control shortcuts', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      // F5 - Toggle RUN/STOP
      const f5 = shortcuts.find((s: { key: string }) => s.key === 'F5');
      expect(f5).toBeTruthy();
      expect(f5.description).toBe('Toggle RUN/STOP');

      // F6 - PROGRAM mode
      const f6 = shortcuts.find((s: { key: string }) => s.key === 'F6');
      expect(f6).toBeTruthy();
      expect(f6.description).toBe('Switch to PROGRAM mode');

      // F7 - STOP
      const f7 = shortcuts.find((s: { key: string }) => s.key === 'F7');
      expect(f7).toBeTruthy();
      expect(f7.description).toBe('STOP execution');

      // F8 - RESET
      const f8 = shortcuts.find((s: { key: string }) => s.key === 'F8');
      expect(f8).toBeTruthy();
      expect(f8.description).toBe('RESET all variables');
    });

    it('should register view control shortcuts', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      // Ctrl+D - Data Table
      const ctrlD = shortcuts.find(
        (s: { key: string; ctrl?: boolean }) => s.key === 'd' && s.ctrl
      );
      expect(ctrlD).toBeTruthy();
      expect(ctrlD.description).toBe('Open Data Table');

      // F1 - Help
      const f1 = shortcuts.find((s: { key: string }) => s.key === 'F1');
      expect(f1).toBeTruthy();
      expect(f1.description).toBe('Open Help');

      // F2 - About
      const f2 = shortcuts.find((s: { key: string }) => s.key === 'F2');
      expect(f2).toBeTruthy();
      expect(f2.description).toBe('Open About');
    });

    it('should register Escape key', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];
      const escape = shortcuts.find((s: { key: string }) => s.key === 'Escape');

      expect(escape).toBeTruthy();
      expect(escape.description).toBe('Close dialogs');
    });
  });

  describe('Shortcut Handlers', () => {
    it('should have handler functions for all shortcuts', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      shortcuts.forEach((shortcut: { handler: unknown; key: string }) => {
        expect(typeof shortcut.handler).toBe('function');
      });
    });

    it('should call onOpenHelp when F1 handler is triggered', () => {
      const onOpenHelp = vi.fn();
      renderKeyboardShortcuts({ onOpenHelp });

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];
      const f1 = shortcuts.find((s: { key: string }) => s.key === 'F1');

      f1.handler();
      expect(onOpenHelp).toHaveBeenCalled();
    });

    it('should call onOpenAbout when F2 handler is triggered', () => {
      const onOpenAbout = vi.fn();
      renderKeyboardShortcuts({ onOpenAbout });

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];
      const f2 = shortcuts.find((s: { key: string }) => s.key === 'F2');

      f2.handler();
      expect(onOpenAbout).toHaveBeenCalled();
    });

    it('should call onOpenDataTable when Ctrl+D handler is triggered', () => {
      const onOpenDataTable = vi.fn();
      renderKeyboardShortcuts({ onOpenDataTable });

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];
      const ctrlD = shortcuts.find(
        (s: { key: string; ctrl?: boolean }) => s.key === 'd' && s.ctrl
      );

      ctrlD.handler();
      expect(onOpenDataTable).toHaveBeenCalled();
    });
  });

  describe('Shortcut Properties', () => {
    it('should have correct ctrl modifier for file operations', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      const ctrlShortcuts = shortcuts.filter((s: { ctrl?: boolean }) => s.ctrl);
      expect(ctrlShortcuts.length).toBeGreaterThan(0);

      // Verify Ctrl+S and Ctrl+O have ctrl: true
      const save = shortcuts.find((s: { key: string }) => s.key === 's');
      const open = shortcuts.find((s: { key: string }) => s.key === 'o');

      expect(save.ctrl).toBe(true);
      expect(open.ctrl).toBe(true);
    });

    it('should not have ctrl modifier for function keys', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      const functionKeys = ['F1', 'F2', 'F5', 'F6', 'F7', 'F8'];
      functionKeys.forEach(key => {
        const shortcut = shortcuts.find((s: { key: string }) => s.key === key);
        expect(shortcut.ctrl).toBeUndefined();
      });
    });
  });

  describe('Dependencies', () => {
    it('should update shortcuts when props change', () => {
      const { rerender } = renderKeyboardShortcuts({ onOpenHelp: vi.fn() });
      const callCount1 = mockUseKeyboardShortcuts.mock.calls.length;

      // Re-render with new props
      rerender(
        <ToastProvider>
          <PLCStateProvider>
            <KeyboardShortcuts
              onOpenHelp={vi.fn()}
              onOpenAbout={vi.fn()}
              onOpenDataTable={vi.fn()}
            />
          </PLCStateProvider>
        </ToastProvider>
      );

      const callCount2 = mockUseKeyboardShortcuts.mock.calls.length;
      expect(callCount2).toBeGreaterThan(callCount1);
    });
  });

  describe('Total Shortcuts Count', () => {
    it('should register expected number of shortcuts', () => {
      renderKeyboardShortcuts();

      const shortcuts = mockUseKeyboardShortcuts.mock.calls[0][0];

      // Should have at least 10 shortcuts:
      // Ctrl+S, Ctrl+O, F5, F6, F7, F8, Ctrl+D, F1, F2, Escape
      expect(shortcuts.length).toBeGreaterThanOrEqual(10);
    });
  });
});
