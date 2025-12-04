/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner?.classList.contains('loading-spinner--medium')).toBe(true);
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner?.classList.contains('loading-spinner--small')).toBe(true);
  });

  it('should render with medium size', () => {
    const { container } = render(<LoadingSpinner size="medium" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner?.classList.contains('loading-spinner--medium')).toBe(true);
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner?.classList.contains('loading-spinner--large')).toBe(true);
  });

  it('should render message when provided', () => {
    const message = 'Loading data...';
    render(<LoadingSpinner message={message} />);

    expect(screen.getByText(message)).toBeTruthy();
  });

  it('should not render message when not provided', () => {
    const { container } = render(<LoadingSpinner />);

    const messageElement = container.querySelector('.loading-spinner__message');
    expect(messageElement).toBeFalsy();
  });

  it('should render without overlay by default', () => {
    const { container } = render(<LoadingSpinner />);

    const overlay = container.querySelector('.loading-spinner-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should render with overlay when overlay prop is true', () => {
    const { container } = render(<LoadingSpinner overlay={true} />);

    const overlay = container.querySelector('.loading-spinner-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should render spinner circle', () => {
    const { container } = render(<LoadingSpinner />);

    const circle = container.querySelector('.loading-spinner__circle');
    expect(circle).toBeTruthy();
  });

  it('should render all elements when all props provided', () => {
    const message = 'Please wait...';
    const { container } = render(
      <LoadingSpinner size="large" message={message} overlay={true} />
    );

    expect(container.querySelector('.loading-spinner-overlay')).toBeTruthy();
    expect(container.querySelector('.loading-spinner--large')).toBeTruthy();
    expect(container.querySelector('.loading-spinner__circle')).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });
});
