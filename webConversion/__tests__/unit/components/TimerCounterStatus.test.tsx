import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerCounterStatus } from '../../../src/components/TimerCounterStatus/TimerCounterStatus';
import type { PLCState } from '../../../src/types/plc';

// Mock the context
vi.mock('../../../src/context/PLCStateContext', () => ({
  usePLCState: vi.fn(),
}));

import { usePLCState } from '../../../src/context/PLCStateContext';

describe('TimerCounterStatus', () => {
  describe('Empty state', () => {
    beforeEach(() => {
      const emptyState: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {},
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: emptyState,
        dispatch: vi.fn(),
      });
    });

    it('should render timers section with count 0', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Timers (0)')).toBeTruthy();
    });

    it('should render counters section with count 0', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Counters (0)')).toBeTruthy();
    });

    it('should show empty message for timers', () => {
      render(<TimerCounterStatus />);

      const emptyMessages = screen.getAllByText('Nenhum timer em uso');
      expect(emptyMessages.length).toBeGreaterThan(0);
    });

    it('should show empty message for counters', () => {
      render(<TimerCounterStatus />);

      const emptyMessages = screen.getAllByText('Nenhum contador em uso');
      expect(emptyMessages.length).toBeGreaterThan(0);
    });

    it('should not render memory section when no memory variables', () => {
      render(<TimerCounterStatus />);

      expect(screen.queryByText(/Memory \(/)).toBeFalsy();
    });
  });

  describe('With timers', () => {
    beforeEach(() => {
      const stateWithTimers: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          T0: {
            id: 'T0',
            type: 'TIMER',
            timerType: 'TON',
            currentValue: true,
            preset: 10,
            accumulated: 5,
            enabled: true,
            done: false,
          },
          T1: {
            id: 'T1',
            type: 'TIMER',
            timerType: 'TOFF',
            currentValue: false,
            preset: 20,
            accumulated: 20,
            enabled: false,
            done: true,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithTimers,
        dispatch: vi.fn(),
      });
    });

    it('should show correct timer count', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Timers (2)')).toBeTruthy();
    });

    it('should display timer IDs', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('T0')).toBeTruthy();
      expect(screen.getByText('T1')).toBeTruthy();
    });

    it('should display timer types', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('TON')).toBeTruthy();
      expect(screen.getByText('TOFF')).toBeTruthy();
    });

    it('should display EN values', () => {
      const { container } = render(<TimerCounterStatus />);

      const statusItems = container.querySelectorAll('.status-item');
      expect(statusItems.length).toBe(2);
    });

    it('should display accumulated values', () => {
      render(<TimerCounterStatus />);

      // Both timers should show their accumulated values
      const accLabels = screen.getAllByText('ACC:');
      expect(accLabels.length).toBeGreaterThan(0);
    });

    it('should display preset values', () => {
      render(<TimerCounterStatus />);

      const preLabels = screen.getAllByText('PRE:');
      expect(preLabels.length).toBeGreaterThan(0);
    });

    it('should display DN values', () => {
      const { container } = render(<TimerCounterStatus />);

      const dnLabels = screen.getAllByText('DN:');
      expect(dnLabels.length).toBeGreaterThan(0);
    });

    it('should apply active class to done timer', () => {
      const { container } = render(<TimerCounterStatus />);

      const activeItems = container.querySelectorAll('.status-item--active');
      expect(activeItems.length).toBeGreaterThan(0);
    });

    it('should show progress bar', () => {
      const { container } = render(<TimerCounterStatus />);

      const progressBars = container.querySelectorAll('.status-progress__bar');
      expect(progressBars.length).toBe(2);
    });

    it('should calculate progress bar width correctly', () => {
      const { container } = render(<TimerCounterStatus />);

      const progressBars = container.querySelectorAll('.status-progress__bar');

      // T0: 5/10 = 50%
      const t0Progress = (progressBars[0] as HTMLElement).style.width;
      expect(t0Progress).toBe('50%');

      // T1: 20/20 = 100%
      const t1Progress = (progressBars[1] as HTMLElement).style.width;
      expect(t1Progress).toBe('100%');
    });
  });

  describe('With counters', () => {
    beforeEach(() => {
      const stateWithCounters: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          C0: {
            id: 'C0',
            type: 'COUNTER',
            counterType: 'CTU',
            currentValue: true,
            preset: 10,
            accumulated: 3,
            enabled: true,
            done: false,
          },
          C1: {
            id: 'C1',
            type: 'COUNTER',
            counterType: 'CTD',
            currentValue: false,
            preset: 5,
            accumulated: 5,
            enabled: false,
            done: true,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithCounters,
        dispatch: vi.fn(),
      });
    });

    it('should show correct counter count', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Counters (2)')).toBeTruthy();
    });

    it('should display counter IDs', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('C0')).toBeTruthy();
      expect(screen.getByText('C1')).toBeTruthy();
    });

    it('should display counter types', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('CTU')).toBeTruthy();
      expect(screen.getByText('CTD')).toBeTruthy();
    });

    it('should display CU label for counters', () => {
      render(<TimerCounterStatus />);

      const cuLabels = screen.getAllByText('CU:');
      expect(cuLabels.length).toBe(2);
    });

    it('should apply active class to done counter', () => {
      const { container } = render(<TimerCounterStatus />);

      const activeItems = container.querySelectorAll('.status-item--active');
      expect(activeItems.length).toBeGreaterThan(0);
    });
  });

  describe('With memory variables', () => {
    beforeEach(() => {
      const stateWithMemory: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          M0: {
            id: 'M0',
            type: 'MEMORY',
            currentValue: true,
            preset: 0,
            accumulated: 0,
            enabled: false,
            done: false,
          },
          M1: {
            id: 'M1',
            type: 'MEMORY',
            currentValue: false,
            preset: 0,
            accumulated: 0,
            enabled: false,
            done: false,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithMemory,
        dispatch: vi.fn(),
      });
    });

    it('should render memory section', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Memory (2)')).toBeTruthy();
    });

    it('should display memory IDs', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('M0')).toBeTruthy();
      expect(screen.getByText('M1')).toBeTruthy();
    });

    it('should display memory values', () => {
      const { container } = render(<TimerCounterStatus />);

      const memoryItems = container.querySelectorAll('.status-item--compact');
      expect(memoryItems.length).toBe(2);
    });

    it('should apply active class to memory with value true', () => {
      const { container } = render(<TimerCounterStatus />);

      const activeMemory = container.querySelectorAll('.status-item--compact.status-item--active');
      expect(activeMemory.length).toBeGreaterThan(0);
    });
  });

  describe('Mixed state', () => {
    beforeEach(() => {
      const mixedState: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          T0: {
            id: 'T0',
            type: 'TIMER',
            timerType: 'TON',
            currentValue: false,
            preset: 10,
            accumulated: 0,
            enabled: false,
            done: false,
          },
          C0: {
            id: 'C0',
            type: 'COUNTER',
            counterType: 'CTU',
            currentValue: false,
            preset: 5,
            accumulated: 0,
            enabled: false,
            done: false,
          },
          M0: {
            id: 'M0',
            type: 'MEMORY',
            currentValue: true,
            preset: 0,
            accumulated: 0,
            enabled: false,
            done: false,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: mixedState,
        dispatch: vi.fn(),
      });
    });

    it('should display all three sections', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('Timers (1)')).toBeTruthy();
      expect(screen.getByText('Counters (1)')).toBeTruthy();
      expect(screen.getByText('Memory (1)')).toBeTruthy();
    });

    it('should filter variables correctly', () => {
      render(<TimerCounterStatus />);

      expect(screen.getByText('T0')).toBeTruthy();
      expect(screen.getByText('C0')).toBeTruthy();
      expect(screen.getByText('M0')).toBeTruthy();
    });
  });
});
