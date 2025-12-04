import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsiblePanel } from '../../../src/components/CollapsiblePanel/CollapsiblePanel';

describe('CollapsiblePanel', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      render(
        <CollapsiblePanel title="Test Panel">
          <div>Content</div>
        </CollapsiblePanel>
      );

      expect(screen.getByText('Test Panel')).toBeTruthy();
    });

    it('should render children when expanded', () => {
      render(
        <CollapsiblePanel title="Test Panel">
          <div>Test Content</div>
        </CollapsiblePanel>
      );

      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel" className="custom-class">
          <div>Content</div>
        </CollapsiblePanel>
      );

      const panel = container.querySelector('.custom-class');
      expect(panel).toBeTruthy();
    });
  });

  describe('Collapsed State', () => {
    it('should be expanded by default', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel">
          <div>Content</div>
        </CollapsiblePanel>
      );

      const panel = container.querySelector('.collapsible-panel--collapsed');
      expect(panel).toBeFalsy();
      expect(screen.getByText('Content')).toBeTruthy();
    });

    it('should start collapsed when defaultCollapsed is true', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel" defaultCollapsed={true}>
          <div>Content</div>
        </CollapsiblePanel>
      );

      const panel = container.querySelector('.collapsible-panel--collapsed');
      expect(panel).toBeTruthy();
      expect(screen.queryByText('Content')).toBeFalsy();
    });

    it('should not render children when collapsed', () => {
      render(
        <CollapsiblePanel title="Test Panel" defaultCollapsed={true}>
          <div>Hidden Content</div>
        </CollapsiblePanel>
      );

      expect(screen.queryByText('Hidden Content')).toBeFalsy();
    });
  });

  describe('User Interactions', () => {
    it('should toggle collapse state on header click', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel">
          <div>Toggle Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');

      // Initially expanded
      expect(screen.getByText('Toggle Content')).toBeTruthy();

      // Click to collapse
      fireEvent.click(header);
      expect(screen.queryByText('Toggle Content')).toBeFalsy();
      expect(container.querySelector('.collapsible-panel--collapsed')).toBeTruthy();

      // Click to expand again
      fireEvent.click(header);
      expect(screen.getByText('Toggle Content')).toBeTruthy();
      expect(container.querySelector('.collapsible-panel--collapsed')).toBeFalsy();
    });

    it('should toggle on Enter key press', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel">
          <div>Keyboard Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');

      // Press Enter to collapse
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(screen.queryByText('Keyboard Content')).toBeFalsy();
      expect(container.querySelector('.collapsible-panel--collapsed')).toBeTruthy();

      // Press Enter to expand
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(screen.getByText('Keyboard Content')).toBeTruthy();
    });

    it('should toggle on Space key press', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel">
          <div>Space Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');

      // Press Space to collapse
      fireEvent.keyDown(header, { key: ' ' });
      expect(screen.queryByText('Space Content')).toBeFalsy();
      expect(container.querySelector('.collapsible-panel--collapsed')).toBeTruthy();
    });

    it('should not toggle on other key presses', () => {
      render(
        <CollapsiblePanel title="Test Panel">
          <div>Other Keys Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');

      // Press random key
      fireEvent.keyDown(header, { key: 'a' });
      expect(screen.getByText('Other Keys Content')).toBeTruthy();
    });
  });

  describe('Icon Rotation', () => {
    it('should rotate icon when collapsed', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel" defaultCollapsed={true}>
          <div>Content</div>
        </CollapsiblePanel>
      );

      const icon = container.querySelector('.collapsible-panel__icon');
      expect(icon).toBeTruthy();

      const style = (icon as HTMLElement).style;
      expect(style.transform).toContain('rotate(0deg)');
    });

    it('should rotate icon when expanded', () => {
      const { container } = render(
        <CollapsiblePanel title="Test Panel">
          <div>Content</div>
        </CollapsiblePanel>
      );

      const icon = container.querySelector('.collapsible-panel__icon');
      expect(icon).toBeTruthy();

      const style = (icon as HTMLElement).style;
      expect(style.transform).toContain('rotate(90deg)');
    });
  });

  describe('Accessibility', () => {
    it('should have button role on header', () => {
      render(
        <CollapsiblePanel title="Test Panel">
          <div>Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');
      expect(header).toBeTruthy();
    });

    it('should be keyboard accessible with tabIndex', () => {
      render(
        <CollapsiblePanel title="Test Panel">
          <div>Content</div>
        </CollapsiblePanel>
      );

      const header = screen.getByRole('button');
      expect(header.getAttribute('tabIndex')).toBe('0');
    });
  });
});
