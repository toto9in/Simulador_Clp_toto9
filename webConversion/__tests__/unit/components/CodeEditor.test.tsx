/**
 * Tests for CodeEditor Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeEditor } from '../../../src/components/CodeEditor/CodeEditor';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ExecutionMode } from '../../../src/types/plc';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function renderCodeEditor(initialProgramText = '', mode = ExecutionMode.STOPPED) {
  const mockDispatch = vi.fn();

  return render(
    <PLCStateProvider>
      <CodeEditor />
    </PLCStateProvider>
  );
}

describe('CodeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render editor with title', () => {
      renderCodeEditor();
      expect(screen.getByText('editor.title')).toBeTruthy();
    });

    it('should render textarea', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeTruthy();
    });

    it('should render line numbers', () => {
      renderCodeEditor();
      const lineNumbers = screen.getByText('1');
      expect(lineNumbers).toBeTruthy();
    });

    it('should show footer with line and character count', () => {
      renderCodeEditor();
      expect(screen.getByText(/editor.lines/)).toBeTruthy();
      expect(screen.getByText(/editor.characters/)).toBeTruthy();
    });
  });

  describe('Text Input', () => {
    it('should convert input to uppercase', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'ld i0.0');

      await waitFor(() => {
        expect(textarea.value).toContain('LD');
      });
    });

    it('should handle multiple lines of text', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'ld i0.0{Enter}out q0.0');

      await waitFor(() => {
        expect(textarea.value).toContain('LD I0.0');
        expect(textarea.value).toContain('OUT Q0.0');
      });
    });

    it('should update character count when typing', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'TEST');

      await waitFor(() => {
        expect(screen.getByText(/4/)).toBeTruthy(); // 4 characters
      });
    });
  });

  describe('Line Numbers', () => {
    it('should update line count when adding new lines', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

      await waitFor(() => {
        expect(screen.getByText('3')).toBeTruthy();
      });
    });

    it('should show at least 1 line number for empty editor', () => {
      renderCodeEditor('');
      expect(screen.getByText('1')).toBeTruthy();
    });
  });

  describe('Tab Key Handling', () => {
    it('should insert spaces instead of tab character', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.click(textarea);
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(textarea.value).toBe('  '); // Two spaces
      });
    });

    it('should insert spaces at cursor position', async () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'LDOUT');

      // Set cursor position between LD and OUT
      textarea.setSelectionRange(2, 2);
      fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

      await waitFor(() => {
        expect(textarea.value).toContain('  '); // Should have spaces
      });
    });
  });

  describe('Disabled State', () => {
    it('should not show warning when not running', () => {
      renderCodeEditor('', ExecutionMode.STOPPED);
      expect(screen.queryByText('editor.disabledWhileRunning')).toBeFalsy();
    });
  });

  describe('Placeholder', () => {
    it('should show placeholder when empty', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('editor.placeholder');
    });
  });

  describe('Accessibility', () => {
    it('should have spellCheck disabled', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      // Check the attribute value (can be 'false' string or boolean false)
      const spellCheckValue = textarea.getAttribute('spellcheck');
      expect(spellCheckValue === 'false' || textarea.spellcheck === false).toBe(true);
    });

    it('should have autoCapitalize off', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.getAttribute('autocapitalize')).toBe('off');
    });

    it('should have autoCorrect off', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.getAttribute('autocorrect')).toBe('off');
    });
  });

  describe('Scroll Behavior', () => {
    it('should handle scroll event', () => {
      renderCodeEditor();
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      // Simulate scroll
      fireEvent.scroll(textarea, { target: { scrollTop: 100 } });

      // Test passes if no error is thrown
      expect(textarea).toBeTruthy();
    });
  });
});
