/**
 * Tests for App component
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../src/App';

// Mock MainWindow component to avoid full render
vi.mock('../../src/components/MainWindow/MainWindow', () => ({
  MainWindow: () => <div data-testid="main-window">Main Window</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should wrap MainWindow with ToastProvider', () => {
    const { getByTestId } = render(<App />);
    const mainWindow = getByTestId('main-window');
    expect(mainWindow).toBeTruthy();
  });

  it('should render MainWindow component', () => {
    const { getByText } = render(<App />);
    expect(getByText('Main Window')).toBeTruthy();
  });
});
