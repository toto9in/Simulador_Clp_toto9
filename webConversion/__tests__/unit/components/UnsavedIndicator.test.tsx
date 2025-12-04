import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnsavedIndicator } from '../../../src/components/UnsavedIndicator/UnsavedIndicator';

describe('UnsavedIndicator', () => {
  describe('Rendering', () => {
    it('should not render when hasUnsavedChanges is false', () => {
      const { container } = render(<UnsavedIndicator hasUnsavedChanges={false} />);

      const indicator = container.querySelector('.unsaved-indicator');
      expect(indicator).toBeFalsy();
    });

    it('should render when hasUnsavedChanges is true', () => {
      const { container } = render(<UnsavedIndicator hasUnsavedChanges={true} />);

      const indicator = container.querySelector('.unsaved-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should display dot indicator', () => {
      const { container } = render(<UnsavedIndicator hasUnsavedChanges={true} />);

      const dot = container.querySelector('.unsaved-indicator__dot');
      expect(dot).toBeTruthy();
      expect(dot?.textContent).toBe('●');
    });

    it('should display text message', () => {
      render(<UnsavedIndicator hasUnsavedChanges={true} />);

      expect(screen.getByText('Unsaved changes')).toBeTruthy();
    });

    it('should have tooltip with message', () => {
      const { container } = render(<UnsavedIndicator hasUnsavedChanges={true} />);

      const indicator = container.querySelector('.unsaved-indicator');
      expect(indicator?.getAttribute('title')).toBe('You have unsaved changes');
    });
  });

  describe('State Changes', () => {
    it('should toggle visibility when prop changes', () => {
      const { container, rerender } = render(<UnsavedIndicator hasUnsavedChanges={false} />);

      // Initially not visible
      expect(container.querySelector('.unsaved-indicator')).toBeFalsy();

      // Update to visible
      rerender(<UnsavedIndicator hasUnsavedChanges={true} />);
      expect(container.querySelector('.unsaved-indicator')).toBeTruthy();

      // Update to hidden again
      rerender(<UnsavedIndicator hasUnsavedChanges={false} />);
      expect(container.querySelector('.unsaved-indicator')).toBeFalsy();
    });
  });
});
