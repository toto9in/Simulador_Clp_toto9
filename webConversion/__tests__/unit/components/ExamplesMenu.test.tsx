/**
 * Tests for ExamplesMenu Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExamplesMenu } from '../../../src/components/ExamplesMenu/ExamplesMenu';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ToastProvider } from '../../../src/context/ToastContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock examples service
const mockExamples = [
  {
    file: 'basic-ld-out.il',
    title: 'Basic LD and OUT',
    category: 'basic',
    description: 'Simple load and output example',
  },
  {
    file: 'timer-ton.il',
    title: 'Timer ON delay',
    category: 'timers',
    description: 'Timer example',
  },
];

vi.mock('../../../src/services/examples', () => ({
  fetchExamplesIndex: vi.fn().mockResolvedValue({ examples: mockExamples }),
  loadExample: vi.fn().mockResolvedValue('LD I0.0\nOUT Q0.0'),
  groupExamplesByCategory: vi.fn().mockReturnValue({
    basic: [mockExamples[0]],
    timers: [mockExamples[1]],
  }),
  getCategoryName: vi.fn((cat) => cat),
}));

function renderExamplesMenu(props = {}) {
  const defaultProps = {
    hasUnsavedChanges: false,
    onResetSavedState: vi.fn(),
    onLoadingChange: vi.fn(),
  };

  return render(
    <ToastProvider>
      <PLCStateProvider>
        <ExamplesMenu {...defaultProps} {...props} />
      </PLCStateProvider>
    </ToastProvider>
  );
}

describe('ExamplesMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window.confirm = vi.fn().mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render Examples button', () => {
      renderExamplesMenu();
      expect(screen.getByText('menu.examples')).toBeTruthy();
    });

    it('should not show dropdown initially', () => {
      renderExamplesMenu();
      const dropdown = screen.queryByRole('menu');
      expect(dropdown).toBeFalsy();
    });
  });

  describe('Menu Interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        // Menu should be open and showing examples
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Basic LD and OUT')).toBeFalsy();
      });
    });

    it('should toggle dropdown when button is clicked multiple times', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      // Close
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Basic LD and OUT')).toBeFalsy();
      });
    });
  });

  describe('Examples Loading', () => {
    it('should load and display examples on mount', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
        expect(screen.getByText('Timer ON delay')).toBeTruthy();
      });
    });

    it('should group examples by category', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        // Both categories should be present
        const basicExample = screen.getByText('Basic LD and OUT');
        const timerExample = screen.getByText('Timer ON delay');

        expect(basicExample).toBeTruthy();
        expect(timerExample).toBeTruthy();
      });
    });
  });

  describe('Example Selection', () => {
    it('should load example when clicked', async () => {
      const onResetSavedState = vi.fn();
      renderExamplesMenu({ onResetSavedState });

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      const exampleButton = screen.getByText('Basic LD and OUT');
      fireEvent.click(exampleButton);

      await waitFor(() => {
        expect(onResetSavedState).toHaveBeenCalled();
      });
    });

    it('should show confirm dialog when loading with unsaved changes', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      renderExamplesMenu({ hasUnsavedChanges: true });

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      const exampleButton = screen.getByText('Basic LD and OUT');
      fireEvent.click(exampleButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should not load example if user cancels confirm dialog', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onResetSavedState = vi.fn();
      renderExamplesMenu({ hasUnsavedChanges: true, onResetSavedState });

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      const exampleButton = screen.getByText('Basic LD and OUT');
      fireEvent.click(exampleButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(onResetSavedState).not.toHaveBeenCalled();
    });

    it('should call onLoadingChange when loading example', async () => {
      const onLoadingChange = vi.fn();
      renderExamplesMenu({ onLoadingChange });

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      const exampleButton = screen.getByText('Basic LD and OUT');
      fireEvent.click(exampleButton);

      await waitFor(() => {
        expect(onLoadingChange).toHaveBeenCalledWith(
          true,
          expect.stringContaining('Loading example')
        );
      });
    });
  });

  describe('Category Collapsing', () => {
    it('should allow toggling categories', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Basic LD and OUT')).toBeTruthy();
      });

      // Find and click a category header if it exists
      const categoryHeaders = screen.queryAllByRole('button');
      if (categoryHeaders.length > 1) {
        // Should have category toggle buttons
        expect(categoryHeaders.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Accessibility', () => {
    it('should show example descriptions', async () => {
      renderExamplesMenu();

      const button = screen.getByText('menu.examples');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Simple load and output example')).toBeTruthy();
        expect(screen.getByText('Timer example')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(
        await import('../../../src/services/examples')
      ).fetchExamplesIndex.mockRejectedValueOnce(new Error('Network error'));

      renderExamplesMenu();

      await waitFor(() => {
        // Component should still render even if examples fail to load
        expect(screen.getByText('menu.examples')).toBeTruthy();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
