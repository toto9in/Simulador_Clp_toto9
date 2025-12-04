/**
 * Tests for ToastContainer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../../../src/components/Toast/ToastContainer';
import type { ToastMessage } from '../../../src/hooks/useToast';

// Mock Toast component
vi.mock('../../../src/components/Toast/Toast', () => ({
  Toast: ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => (
    <div data-testid={`toast-${type}`} onClick={onClose}>
      {message}
    </div>
  ),
}));

describe('ToastContainer', () => {
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null when no toasts', () => {
      const { container } = render(
        <ToastContainer toasts={[]} onRemove={mockOnRemove} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render container when toasts exist', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Test message', type: 'success', duration: 3000 },
      ];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={mockOnRemove} />
      );

      const toastContainer = container.querySelector('.toast-container');
      expect(toastContainer).toBeTruthy();
    });

    it('should render single toast', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Success message', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByText('Success message')).toBeTruthy();
    });

    it('should render multiple toasts', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'First toast', type: 'success', duration: 3000 },
        { id: '2', message: 'Second toast', type: 'error', duration: 3000 },
        { id: '3', message: 'Third toast', type: 'info', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByText('First toast')).toBeTruthy();
      expect(screen.getByText('Second toast')).toBeTruthy();
      expect(screen.getByText('Third toast')).toBeTruthy();
    });
  });

  describe('Toast Types', () => {
    it('should render success toast', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Success!', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('toast-success')).toBeTruthy();
    });

    it('should render error toast', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Error!', type: 'error', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('toast-error')).toBeTruthy();
    });

    it('should render info toast', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Info!', type: 'info', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('toast-info')).toBeTruthy();
    });

    it('should render warning toast', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Warning!', type: 'warning', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('toast-warning')).toBeTruthy();
    });
  });

  describe('Toast Properties', () => {
    it('should pass message to Toast component', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Custom message', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByText('Custom message')).toBeTruthy();
    });

    it('should pass type to Toast component', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Test', type: 'error', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('toast-error')).toBeTruthy();
    });

    it('should use unique keys for each toast', () => {
      const toasts: ToastMessage[] = [
        { id: 'unique-1', message: 'First', type: 'success', duration: 3000 },
        { id: 'unique-2', message: 'Second', type: 'info', duration: 3000 },
      ];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={mockOnRemove} />
      );

      const toastElements = container.querySelectorAll('[data-testid^="toast-"]');
      expect(toastElements.length).toBe(2);
    });
  });

  describe('onRemove Callback', () => {
    it('should pass onRemove callback to Toast components', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Test', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      // The Toast mock component has onClick that calls onClose
      const toast = screen.getByTestId('toast-success');
      toast.click();

      expect(mockOnRemove).toHaveBeenCalledWith('1');
    });

    it('should call onRemove with correct toast id', () => {
      const toasts: ToastMessage[] = [
        { id: 'toast-123', message: 'Test', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      const toast = screen.getByTestId('toast-success');
      toast.click();

      expect(mockOnRemove).toHaveBeenCalledWith('toast-123');
    });

    it('should handle removal of specific toast from multiple toasts', () => {
      const toasts: ToastMessage[] = [
        { id: 'first', message: 'First', type: 'success', duration: 3000 },
        { id: 'second', message: 'Second', type: 'error', duration: 3000 },
        { id: 'third', message: 'Third', type: 'info', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      // Click the second toast
      const secondToast = screen.getByTestId('toast-error');
      secondToast.click();

      expect(mockOnRemove).toHaveBeenCalledWith('second');
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dynamic Toast List', () => {
    it('should update when toast list changes', () => {
      const initialToasts: ToastMessage[] = [
        { id: '1', message: 'First', type: 'success', duration: 3000 },
      ];

      const { rerender } = render(
        <ToastContainer toasts={initialToasts} onRemove={mockOnRemove} />
      );

      expect(screen.getByText('First')).toBeTruthy();

      // Add more toasts
      const updatedToasts: ToastMessage[] = [
        { id: '1', message: 'First', type: 'success', duration: 3000 },
        { id: '2', message: 'Second', type: 'info', duration: 3000 },
      ];

      rerender(<ToastContainer toasts={updatedToasts} onRemove={mockOnRemove} />);

      expect(screen.getByText('First')).toBeTruthy();
      expect(screen.getByText('Second')).toBeTruthy();
    });

    it('should remove container when all toasts are removed', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: 'Test', type: 'success', duration: 3000 },
      ];

      const { container, rerender } = render(
        <ToastContainer toasts={toasts} onRemove={mockOnRemove} />
      );

      expect(container.querySelector('.toast-container')).toBeTruthy();

      // Remove all toasts
      rerender(<ToastContainer toasts={[]} onRemove={mockOnRemove} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle toast with empty message', () => {
      const toasts: ToastMessage[] = [
        { id: '1', message: '', type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      const toast = screen.getByTestId('toast-success');
      expect(toast).toBeTruthy();
    });

    it('should handle toast with very long message', () => {
      const longMessage = 'A'.repeat(500);
      const toasts: ToastMessage[] = [
        { id: '1', message: longMessage, type: 'success', duration: 3000 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={mockOnRemove} />);

      expect(screen.getByText(longMessage)).toBeTruthy();
    });

    it('should handle many toasts at once', () => {
      const manyToasts: ToastMessage[] = Array.from({ length: 10 }, (_, i) => ({
        id: `toast-${i}`,
        message: `Message ${i}`,
        type: 'success' as const,
        duration: 3000,
      }));

      const { container } = render(
        <ToastContainer toasts={manyToasts} onRemove={mockOnRemove} />
      );

      const toastElements = container.querySelectorAll('[data-testid^="toast-"]');
      expect(toastElements.length).toBe(10);
    });
  });
});
