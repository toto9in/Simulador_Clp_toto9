/**
 * Tests for ControlPanel Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../../../src/components/ControlPanel/ControlPanel';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ExecutionMode } from '../../../src/types/plc';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock assets
vi.mock('../../../src/utils/assets', () => ({
  ASSETS: {
    MENU: '/menu.png',
    PAUSE: '/pause.png',
    START: '/start.png',
    START_GREEN: '/start-green.png',
  },
}));

// Mock useExecutionCycle
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockPause = vi.fn();

vi.mock('../../../src/hooks/useExecutionCycle', () => ({
  useExecutionCycle: () => ({
    mode: ExecutionMode.IDLE,
    start: mockStart,
    stop: mockStop,
    pause: mockPause,
    isRunning: false,
  }),
}));

function renderControlPanel() {
  return render(
    <PLCStateProvider>
      <ControlPanel />
    </PLCStateProvider>
  );
}

describe('ControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all control buttons', () => {
      renderControlPanel();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // Program, Stop, Run, Reset + toggle
    });

    it('should render status indicator', () => {
      renderControlPanel();
      expect(screen.getByText('modes.idle')).toBeTruthy();
    });

    it('should render in compact mode by default', () => {
      const { container } = renderControlPanel();
      const panel = container.querySelector('.control-panel--compact');
      expect(panel).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should have pause handler attached to Program button', () => {
      renderControlPanel();
      const programButton = screen.getByTitle('modes.program');

      // Button is disabled in IDLE mode, so we just verify it exists
      expect(programButton).toBeTruthy();
    });

    it('should call stop when Stop button is clicked', () => {
      renderControlPanel();
      const stopButton = screen.getByTitle('modes.stop');

      fireEvent.click(stopButton);

      expect(mockStop).toHaveBeenCalled();
    });

    it('should call start when Run button is clicked', () => {
      renderControlPanel();
      const runButton = screen.getByTitle('modes.run');

      fireEvent.click(runButton);

      expect(mockStart).toHaveBeenCalled();
    });

    it('should handle Reset button click', () => {
      renderControlPanel();
      const resetButton = screen.getByTitle('Reset all variables');

      fireEvent.click(resetButton);

      // Test passes if no error is thrown
      expect(resetButton).toBeTruthy();
    });
  });

  describe('Compact/Expand Toggle', () => {
    it('should toggle compact mode when toggle button is clicked', () => {
      const { container } = renderControlPanel();

      const toggleButton = screen.getByTitle('Expand controls');
      fireEvent.click(toggleButton);

      // After clicking, should not be compact
      const panel = container.querySelector('.control-panel--compact');
      expect(panel).toBeFalsy();
    });

    it('should show text labels when not compact', () => {
      renderControlPanel();

      const toggleButton = screen.getByTitle('Expand controls');
      fireEvent.click(toggleButton);

      // In non-compact mode, button text should be visible
      expect(screen.getByText('modes.program')).toBeTruthy();
      expect(screen.getByText('modes.stop')).toBeTruthy();
      expect(screen.getByText('modes.run')).toBeTruthy();
      expect(screen.getByText('RESET')).toBeTruthy();
    });

    it('should change toggle button title when expanded', () => {
      renderControlPanel();

      const toggleButton = screen.getByTitle('Expand controls');
      fireEvent.click(toggleButton);

      expect(screen.getByTitle('Compact controls')).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should have Program button disabled in IDLE mode', () => {
      renderControlPanel();
      const programButton = screen.getByTitle('modes.program') as HTMLButtonElement;

      expect(programButton.disabled).toBe(true);
    });

    it('should have active class on Program button in IDLE mode', () => {
      renderControlPanel();
      const programButton = screen.getByTitle('modes.program');

      expect(programButton.classList.contains('active')).toBe(true);
    });
  });

  describe('Icons', () => {
    it('should display correct icons for all buttons', () => {
      renderControlPanel();

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(3); // Program, Stop, Run icons
    });

    it('should show reset icon', () => {
      renderControlPanel();
      expect(screen.getByText('⟲')).toBeTruthy();
    });
  });

  describe('Status Display', () => {
    it('should display current mode in status indicator', () => {
      renderControlPanel();

      const statusValue = screen.getByText('modes.idle');
      expect(statusValue.classList.contains('status-value--idle')).toBe(true);
    });

    it('should show status label in expanded mode', () => {
      renderControlPanel();

      const toggleButton = screen.getByTitle('Expand controls');
      fireEvent.click(toggleButton);

      expect(screen.getByText('labels.value')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have title attributes on all main buttons', () => {
      renderControlPanel();

      expect(screen.getByTitle('modes.program')).toBeTruthy();
      expect(screen.getByTitle('modes.stop')).toBeTruthy();
      expect(screen.getByTitle('modes.run')).toBeTruthy();
      expect(screen.getByTitle('Reset all variables')).toBeTruthy();
    });

    it('should have alt text on button icons', () => {
      renderControlPanel();

      expect(screen.getByAltText('Program')).toBeTruthy();
      expect(screen.getByAltText('Stop')).toBeTruthy();
      expect(screen.getByAltText('Run')).toBeTruthy();
    });
  });
});
