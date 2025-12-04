/**
 * Tests for useExecutionCycle Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExecutionCycle } from '../../../src/hooks/useExecutionCycle';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ExecutionMode } from '../../../src/types/plc';

// Mock ScanCycleService
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockPause = vi.fn();
const mockExecuteCycle = vi.fn();
const mockGetStats = vi.fn();

vi.mock('../../../src/services/scanCycle', () => ({
  ScanCycleService: {
    start: (...args: unknown[]) => mockStart(...args),
    stop: (...args: unknown[]) => mockStop(...args),
    pause: (...args: unknown[]) => mockPause(...args),
    executeCycle: (...args: unknown[]) => mockExecuteCycle(...args),
    getStats: (...args: unknown[]) => mockGetStats(...args),
  },
}));

// Mock constants
vi.mock('../../../src/utils/constants', () => ({
  PLC_CONFIG: {
    SCAN_CYCLE_MS: 100,
  },
}));

function renderUseExecutionCycle(options = {}) {
  return renderHook(() => useExecutionCycle(options), {
    wrapper: PLCStateProvider,
  });
}

describe('useExecutionCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementations
    mockStart.mockImplementation((state) => ({
      ...state,
      mode: ExecutionMode.RUNNING,
      cycleTime: 0,
    }));

    mockStop.mockImplementation((state) => ({
      ...state,
      mode: ExecutionMode.STOPPED,
    }));

    mockPause.mockImplementation((state) => ({
      ...state,
      mode: ExecutionMode.IDLE,
    }));

    mockExecuteCycle.mockImplementation((state) => ({
      ...state,
      cycleTime: state.cycleTime + 100,
    }));

    mockGetStats.mockReturnValue({
      cycleTime: 100,
      cycleCount: 10,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return control functions', () => {
      const { result } = renderUseExecutionCycle();

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.executeCycle).toBe('function');
      expect(typeof result.current.getStats).toBe('function');
    });

    it('should return initial mode as IDLE', () => {
      const { result } = renderUseExecutionCycle();
      expect(result.current.mode).toBe(ExecutionMode.IDLE);
    });

    it('should return isRunning as false initially', () => {
      const { result } = renderUseExecutionCycle();
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    it('should call ScanCycleService.start', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      expect(mockStart).toHaveBeenCalled();
    });

    it('should change mode to RUNNING', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      expect(result.current.mode).toBe(ExecutionMode.RUNNING);
    });

    it('should set isRunning to true', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
    });
  });

  describe('stop', () => {
    it('should call ScanCycleService.stop', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.stop();
      });

      expect(mockStop).toHaveBeenCalled();
    });

    it('should change mode to STOPPED', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.mode).toBe(ExecutionMode.STOPPED);
    });

    it('should set isRunning to false', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('pause', () => {
    it('should call ScanCycleService.pause', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.pause();
      });

      expect(mockPause).toHaveBeenCalled();
    });

    it('should change mode to IDLE', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.mode).toBe(ExecutionMode.IDLE);
    });

    it('should set isRunning to false', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('executeCycle', () => {
    it('should call ScanCycleService.executeCycle', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.executeCycle();
      });

      expect(mockExecuteCycle).toHaveBeenCalled();
    });

    it('should call onCycleComplete callback', () => {
      const onCycleComplete = vi.fn();
      const { result } = renderUseExecutionCycle({ onCycleComplete });

      act(() => {
        result.current.executeCycle();
      });

      expect(onCycleComplete).toHaveBeenCalled();
    });

    it('should handle errors and stop execution', () => {
      const onCycleError = vi.fn();
      mockExecuteCycle.mockImplementationOnce(() => {
        throw new Error('Cycle error');
      });

      const { result } = renderUseExecutionCycle({ onCycleError });

      act(() => {
        result.current.executeCycle();
      });

      expect(onCycleError).toHaveBeenCalledWith(expect.any(Error));
      expect(result.current.mode).toBe(ExecutionMode.STOPPED);
    });
  });

  describe('Automatic Execution', () => {
    it('should execute cycles automatically when RUNNING', async () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      // Fast-forward 100ms (one cycle)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockExecuteCycle).toHaveBeenCalled();
    });

    it('should execute multiple cycles', async () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      // Fast-forward 300ms (three cycles)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockExecuteCycle).toHaveBeenCalledTimes(3);
    });

    it('should not execute cycles when STOPPED', async () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      mockExecuteCycle.mockClear();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockExecuteCycle).not.toHaveBeenCalled();
    });

    it('should not execute cycles when IDLE', async () => {
      const { result } = renderUseExecutionCycle();

      mockExecuteCycle.mockClear();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockExecuteCycle).not.toHaveBeenCalled();
    });
  });

  describe('enabled Option', () => {
    it('should not execute cycles when disabled', async () => {
      const { result } = renderUseExecutionCycle({ enabled: false });

      act(() => {
        result.current.start();
      });

      mockExecuteCycle.mockClear();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockExecuteCycle).not.toHaveBeenCalled();
    });

    it('should execute manually even when disabled', () => {
      const { result } = renderUseExecutionCycle({ enabled: false });

      act(() => {
        result.current.executeCycle();
      });

      expect(mockExecuteCycle).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should call ScanCycleService.getStats', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.getStats();
      });

      expect(mockGetStats).toHaveBeenCalled();
    });

    it('should return stats object', () => {
      const { result } = renderUseExecutionCycle();

      const stats = result.current.getStats();

      expect(stats).toEqual({
        cycleTime: 100,
        cycleCount: 10,
      });
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const { result, unmount } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should clear interval when stopped', () => {
      const { result } = renderUseExecutionCycle();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Mode Transitions', () => {
    it('should transition IDLE → RUNNING → STOPPED', () => {
      const { result } = renderUseExecutionCycle();

      expect(result.current.mode).toBe(ExecutionMode.IDLE);

      act(() => {
        result.current.start();
      });
      expect(result.current.mode).toBe(ExecutionMode.RUNNING);

      act(() => {
        result.current.stop();
      });
      expect(result.current.mode).toBe(ExecutionMode.STOPPED);
    });

    it('should transition RUNNING → IDLE (pause)', () => {
      const { result } = renderUseExecutionCycle();

      act(() => {
        result.current.start();
      });
      expect(result.current.mode).toBe(ExecutionMode.RUNNING);

      act(() => {
        result.current.pause();
      });
      expect(result.current.mode).toBe(ExecutionMode.IDLE);
    });
  });
});
