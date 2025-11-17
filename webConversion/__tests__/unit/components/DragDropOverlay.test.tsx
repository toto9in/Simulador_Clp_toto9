import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragDropOverlay } from '../../../src/components/DragDropOverlay/DragDropOverlay';

describe('DragDropOverlay', () => {
  describe('Rendering', () => {
    it('should not render when isVisible is false', () => {
      const { container } = render(<DragDropOverlay isVisible={false} />);

      const overlay = container.querySelector('.drag-drop-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should render when isVisible is true', () => {
      const { container } = render(<DragDropOverlay isVisible={true} />);

      const overlay = container.querySelector('.drag-drop-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should display file icon', () => {
      render(<DragDropOverlay isVisible={true} />);

      expect(screen.getByText('📁')).toBeTruthy();
    });

    it('should display main text', () => {
      render(<DragDropOverlay isVisible={true} />);

      expect(screen.getByText('Drop IL program file here')).toBeTruthy();
    });

    it('should display subtext with file type restriction', () => {
      render(<DragDropOverlay isVisible={true} />);

      expect(screen.getByText('.txt files only')).toBeTruthy();
    });
  });

  describe('State Changes', () => {
    it('should toggle visibility when prop changes', () => {
      const { container, rerender } = render(<DragDropOverlay isVisible={false} />);

      // Initially not visible
      expect(container.querySelector('.drag-drop-overlay')).toBeFalsy();

      // Update to visible
      rerender(<DragDropOverlay isVisible={true} />);
      expect(container.querySelector('.drag-drop-overlay')).toBeTruthy();

      // Update to hidden again
      rerender(<DragDropOverlay isVisible={false} />);
      expect(container.querySelector('.drag-drop-overlay')).toBeFalsy();
    });
  });

  describe('Structure', () => {
    it('should have content wrapper', () => {
      const { container } = render(<DragDropOverlay isVisible={true} />);

      const content = container.querySelector('.drag-drop-overlay__content');
      expect(content).toBeTruthy();
    });

    it('should have icon element', () => {
      const { container } = render(<DragDropOverlay isVisible={true} />);

      const icon = container.querySelector('.drag-drop-overlay__icon');
      expect(icon).toBeTruthy();
    });

    it('should have text element', () => {
      const { container } = render(<DragDropOverlay isVisible={true} />);

      const text = container.querySelector('.drag-drop-overlay__text');
      expect(text).toBeTruthy();
    });

    it('should have subtext element', () => {
      const { container } = render(<DragDropOverlay isVisible={true} />);

      const subtext = container.querySelector('.drag-drop-overlay__subtext');
      expect(subtext).toBeTruthy();
    });
  });
});
