/**
 * Tests for HelpDialog Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpDialog } from '../../../src/components/HelpDialog/HelpDialog';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock assets
vi.mock('../../../src/utils/assets', () => ({
  ASSETS: {},
}));

describe('HelpDialog', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog with title', () => {
      render(<HelpDialog onClose={mockOnClose} />);
      expect(screen.getByText('help.title')).toBeTruthy();
    });

    it('should render close button', () => {
      render(<HelpDialog onClose={mockOnClose} />);
      const closeButton = screen.getByTitle('Close (Esc)');
      expect(closeButton).toBeTruthy();
    });

    it('should render instructions section', () => {
      render(<HelpDialog onClose={mockOnClose} />);
      expect(screen.getByText('help.instructions')).toBeTruthy();
    });

    it('should render keyboard shortcuts section', () => {
      render(<HelpDialog onClose={mockOnClose} />);
      expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy();
    });
  });

  describe('IL Instructions', () => {
    it('should render all basic instructions', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('LD')).toBeTruthy();
      expect(screen.getByText('LDN')).toBeTruthy();
      expect(screen.getByText('ST')).toBeTruthy();
      expect(screen.getByText('STN')).toBeTruthy();
      expect(screen.getByText('AND')).toBeTruthy();
      expect(screen.getByText('ANDN')).toBeTruthy();
      expect(screen.getByText('OR')).toBeTruthy();
      expect(screen.getByText('ORN')).toBeTruthy();
    });

    it('should render timer instructions', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('TON')).toBeTruthy();
      expect(screen.getByText('TOFF')).toBeTruthy();
    });

    it('should render counter instructions', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('CTU')).toBeTruthy();
      expect(screen.getByText('CTD')).toBeTruthy();
    });

    it('should show instruction examples', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('LD I0.0')).toBeTruthy();
      expect(screen.getByText('TON T0,50')).toBeTruthy();
      expect(screen.getByText('CTU C0,10')).toBeTruthy();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should show common shortcuts', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('Ctrl+S')).toBeTruthy();
      expect(screen.getByText('Save program')).toBeTruthy();

      expect(screen.getByText('F5')).toBeTruthy();
      expect(screen.getByText('Toggle RUN/STOP')).toBeTruthy();
    });

    it('should show function key shortcuts', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('F1')).toBeTruthy();
      expect(screen.getByText('F2')).toBeTruthy();
      expect(screen.getByText('F6')).toBeTruthy();
      expect(screen.getByText('F7')).toBeTruthy();
      expect(screen.getByText('F8')).toBeTruthy();
    });

    it('should show Esc key for closing dialogs', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('Esc')).toBeTruthy();
      expect(screen.getByText('Close dialogs')).toBeTruthy();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      const closeButton = screen.getByTitle('Close (Esc)');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      const overlay = screen.getByText('help.title').closest('.help-dialog-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not close when clicking dialog content', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      const dialog = screen.getByText('help.title').closest('.help-dialog');
      if (dialog) {
        fireEvent.click(dialog);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Content Structure', () => {
    it('should display instruction descriptions', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      expect(screen.getByText('help.ld')).toBeTruthy();
      expect(screen.getByText('help.and')).toBeTruthy();
      expect(screen.getByText('help.ton')).toBeTruthy();
    });

    it('should have proper section headings', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      const instructionsHeading = screen.getByText(/help.instructions/);
      const shortcutsHeading = screen.getByText(/Keyboard Shortcuts/);

      expect(instructionsHeading).toBeTruthy();
      expect(shortcutsHeading).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with title attribute', () => {
      render(<HelpDialog onClose={mockOnClose} />);

      const closeButton = screen.getByTitle('Close (Esc)');
      expect(closeButton.getAttribute('title')).toBe('Close (Esc)');
    });

    it('should show instruction examples in code format', () => {
      const { container } = render(<HelpDialog onClose={mockOnClose} />);

      const codeElements = container.querySelectorAll('code');
      expect(codeElements.length).toBeGreaterThan(0);
    });
  });
});
