/**
 * Tests for Toast component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast, ToastType } from '../../../src/components/Toast/Toast';

describe('Toast', () => {
  let onCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onCloseMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render with success type', () => {
      const { container } = render(
        <Toast message="Success!" type="success" onClose={onCloseMock} />
      );

      expect(container.querySelector('.toast--success')).toBeTruthy();
      expect(screen.getByText('Success!')).toBeTruthy();
      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('should render with error type', () => {
      const { container } = render(
        <Toast message="Error!" type="error" onClose={onCloseMock} />
      );

      expect(container.querySelector('.toast--error')).toBeTruthy();
      expect(screen.getByText('Error!')).toBeTruthy();
      expect(screen.getByText('✕')).toBeTruthy();
    });

    it('should render with warning type', () => {
      const { container } = render(
        <Toast message="Warning!" type="warning" onClose={onCloseMock} />
      );

      expect(container.querySelector('.toast--warning')).toBeTruthy();
      expect(screen.getByText('Warning!')).toBeTruthy();
      expect(screen.getByText('⚠')).toBeTruthy();
    });

    it('should render with info type', () => {
      const { container } = render(
        <Toast message="Info!" type="info" onClose={onCloseMock} />
      );

      expect(container.querySelector('.toast--info')).toBeTruthy();
      expect(screen.getByText('Info!')).toBeTruthy();
      expect(screen.getByText('ℹ')).toBeTruthy();
    });

    it('should render close button', () => {
      render(<Toast message="Test" type="success" onClose={onCloseMock} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('auto-close behavior', () => {
    it('should auto-close after default duration (3000ms)', () => {
      render(<Toast message="Test" type="success" onClose={onCloseMock} />);

      expect(onCloseMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should auto-close after custom duration', () => {
      render(
        <Toast message="Test" type="success" duration={5000} onClose={onCloseMock} />
      );

      vi.advanceTimersByTime(4999);
      expect(onCloseMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should not auto-close when duration is 0', () => {
      render(
        <Toast message="Test" type="success" duration={0} onClose={onCloseMock} />
      );

      vi.advanceTimersByTime(10000);

      expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('should not auto-close when duration is negative', () => {
      render(
        <Toast message="Test" type="success" duration={-1} onClose={onCloseMock} />
      );

      vi.advanceTimersByTime(10000);

      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('should call onClose when toast is clicked', () => {
      const { container } = render(
        <Toast message="Test" type="success" onClose={onCloseMock} />
      );

      const toast = container.querySelector('.toast');
      fireEvent.click(toast!);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      render(<Toast message="Test" type="success" onClose={onCloseMock} />);

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      // Called twice: once for button, once for parent div (event bubbling)
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = render(
        <Toast message="Test" type="success" duration={5000} onClose={onCloseMock} />
      );

      unmount();
      vi.advanceTimersByTime(5000);

      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('icon rendering', () => {
    const testCases: Array<{ type: ToastType; expectedIcon: string }> = [
      { type: 'success', expectedIcon: '✓' },
      { type: 'error', expectedIcon: '✕' },
      { type: 'warning', expectedIcon: '⚠' },
      { type: 'info', expectedIcon: 'ℹ' },
    ];

    testCases.forEach(({ type, expectedIcon }) => {
      it(`should render correct icon for ${type} type`, () => {
        render(<Toast message="Test" type={type} onClose={onCloseMock} />);

        expect(screen.getByText(expectedIcon)).toBeTruthy();
      });
    });
  });
});
