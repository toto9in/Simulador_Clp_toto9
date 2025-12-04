import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScanCycleService } from '../../src/services/scanCycle';
import { MemoryService } from '../../src/services/memory';
import { createTestPLCState } from '../helpers/testHelpers';
import type { PLCState } from '../../src/types/plc';
import { ExecutionMode } from '../../src/types/plc';
import { PLC_CONFIG } from '../../src/utils/constants';

describe('ScanCycleService', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initialize', () => {
    it('should reset all outputs to false', () => {
      state.outputs['Q0.0'] = true;
      state.outputs['Q0.1'] = true;
      state.outputs['Q1.0'] = true;

      const newState = ScanCycleService.initialize(state);

      expect(newState.outputs['Q0.0']).toBe(false);
      expect(newState.outputs['Q0.1']).toBe(false);
      expect(newState.outputs['Q1.0']).toBe(false);
    });

    it('should reset accumulator to false', () => {
      state.accumulator = true;

      const newState = ScanCycleService.initialize(state);

      expect(newState.accumulator).toBe(false);
    });

    it('should reset scan count and cycle time', () => {
      state.scanCount = 100;
      state.cycleTime = 50;

      const newState = ScanCycleService.initialize(state);

      expect(newState.scanCount).toBe(0);
      expect(newState.cycleTime).toBe(0);
    });

    it('should reset all timers', () => {
      state.memoryVariables['T1'] = MemoryService.createTimer('T1', 'TON', 10);
      state.memoryVariables['T1'].accumulated = 5;
      state.memoryVariables['T1'].done = true;
      state.memoryVariables['T1'].enabled = true;

      const newState = ScanCycleService.initialize(state);

      expect(newState.memoryVariables['T1'].accumulated).toBe(0);
      expect(newState.memoryVariables['T1'].done).toBe(false);
      expect(newState.memoryVariables['T1'].enabled).toBe(false);
    });

    it('should reset all counters', () => {
      state.memoryVariables['C1'] = MemoryService.createCounter('C1', 'CTU', 10);
      state.memoryVariables['C1'].accumulated = 5;
      state.memoryVariables['C1'].done = false;

      const newState = ScanCycleService.initialize(state);

      expect(newState.memoryVariables['C1'].accumulated).toBe(0);
      expect(newState.memoryVariables['C1'].done).toBe(false);
    });

    it('should reset memory variables to false', () => {
      state.memoryVariables['M0'] = MemoryService.createMemoryVariable('M0');
      state.memoryVariables['M0'].currentValue = true;

      const newState = ScanCycleService.initialize(state);

      expect(newState.memoryVariables['M0'].currentValue).toBe(false);
    });

    it('should preserve input states', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;

      const newState = ScanCycleService.initialize(state);

      expect(newState.inputs['I0.0']).toBe(true);
      expect(newState.inputs['I0.1']).toBe(false);
    });
  });

  describe('start', () => {
    it('should initialize state and set mode to RUNNING', () => {
      state.mode = 'IDLE';
      state.outputs['Q0.0'] = true;
      state.scanCount = 100;

      const newState = ScanCycleService.start(state);

      expect(newState.mode).toBe(ExecutionMode.RUNNING);
      expect(newState.outputs['Q0.0']).toBe(false);
      expect(newState.scanCount).toBe(0);
    });

    it('should work from any initial mode', () => {
      const modes: ExecutionMode[] = ['IDLE', 'RUNNING', 'STOPPED'];

      modes.forEach((mode) => {
        state.mode = mode;
        const newState = ScanCycleService.start(state);
        expect(newState.mode).toBe(ExecutionMode.RUNNING);
      });
    });
  });

  describe('stop', () => {
    it('should set mode to STOPPED', () => {
      state.mode = 'RUNNING';

      const newState = ScanCycleService.stop(state);

      expect(newState.mode).toBe(ExecutionMode.STOPPED);
    });

    it('should preserve state except mode', () => {
      state.mode = 'RUNNING';
      state.scanCount = 100;
      state.cycleTime = 50;
      state.outputs['Q0.0'] = true;

      const newState = ScanCycleService.stop(state);

      expect(newState.mode).toBe(ExecutionMode.STOPPED);
      expect(newState.scanCount).toBe(100);
      expect(newState.cycleTime).toBe(50);
      expect(newState.outputs['Q0.0']).toBe(true);
    });
  });

  describe('pause', () => {
    it('should set mode to IDLE', () => {
      state.mode = 'RUNNING';

      const newState = ScanCycleService.pause(state);

      expect(newState.mode).toBe(ExecutionMode.IDLE);
    });

    it('should preserve state except mode', () => {
      state.mode = 'RUNNING';
      state.scanCount = 100;
      state.outputs['Q0.0'] = true;

      const newState = ScanCycleService.pause(state);

      expect(newState.mode).toBe(ExecutionMode.IDLE);
      expect(newState.scanCount).toBe(100);
      expect(newState.outputs['Q0.0']).toBe(true);
    });
  });

  describe('executeCycle', () => {
    beforeEach(() => {
      state.mode = 'RUNNING';
      state.programText = 'LD I0.0\nOUT Q0.0';
      state.scanCount = 0;
    });

    it('should not execute if not in RUNNING mode', () => {
      state.mode = 'IDLE';
      const originalState = { ...state };

      const newState = ScanCycleService.executeCycle(state);

      expect(newState).toEqual(originalState);
    });

    it('should execute program and update outputs', () => {
      state.inputs['I0.0'] = true;

      const newState = ScanCycleService.executeCycle(state);

      expect(newState.outputs['Q0.0']).toBe(true);
    });

    it('should increment scan count', () => {
      const newState = ScanCycleService.executeCycle(state);

      expect(newState.scanCount).toBe(1);
    });

    it('should calculate cycle time', () => {
      const newState = ScanCycleService.executeCycle(state);

      expect(newState.cycleTime).toBeGreaterThanOrEqual(0);
      expect(newState.cycleTime).toBeLessThan(100); // Should be fast
    });

    it('should update timers during execution', () => {
      vi.useFakeTimers();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      state.programText = 'LD I0.0\nTON T1 10\nLD T1\nOUT Q0.0';
      state.inputs['I0.0'] = true;

      // First cycle - start timer
      let newState = ScanCycleService.executeCycle(state);
      expect(newState.memoryVariables['T1']).toBeDefined();
      expect(newState.memoryVariables['T1'].accumulated).toBe(0);

      // Advance time and run another cycle
      vi.advanceTimersByTime(500);
      newState = ScanCycleService.executeCycle(newState);
      expect(newState.memoryVariables['T1'].accumulated).toBe(5);

      vi.useRealTimers();
    });

    it('should handle program execution errors gracefully', () => {
      state.programText = 'INVALID INSTRUCTION';

      const newState = ScanCycleService.executeCycle(state);

      expect(newState.mode).toBe(ExecutionMode.STOPPED);
      expect(console.error).toHaveBeenCalled();
    });

    it('should warn if cycle takes too long', () => {
      // Mock performance.now to simulate slow cycle
      const mockPerformance = vi.spyOn(performance, 'now');
      mockPerformance
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(PLC_CONFIG.SCAN_CYCLE_MS * 2);

      ScanCycleService.executeCycle(state);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Scan cycle took')
      );

      mockPerformance.mockRestore();
    });

    it('should execute multiple cycles correctly', () => {
      state.inputs['I0.0'] = true;

      let newState = state;
      for (let i = 0; i < 10; i++) {
        newState = ScanCycleService.executeCycle(newState);
      }

      expect(newState.scanCount).toBe(10);
      expect(newState.outputs['Q0.0']).toBe(true);
    });

    it('should preserve memory variables across cycles', () => {
      state.programText = 'LD I0.0\nCTU C1 5\nLD C1\nOUT Q0.0';
      state.inputs['I0.0'] = false;

      // Initialize counter
      let newState = ScanCycleService.executeCycle(state);

      // Toggle input to increment counter
      for (let i = 0; i < 6; i++) {
        newState.inputs['I0.0'] = true;
        newState = ScanCycleService.executeCycle(newState);
        newState.inputs['I0.0'] = false;
        newState = ScanCycleService.executeCycle(newState);
      }

      expect(newState.memoryVariables['C1'].accumulated).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return current scan statistics', () => {
      state.scanCount = 100;
      state.cycleTime = 75;

      const stats = ScanCycleService.getStats(state);

      expect(stats.scanCount).toBe(100);
      expect(stats.cycleTime).toBe(75);
      expect(stats.targetCycleTime).toBe(PLC_CONFIG.SCAN_CYCLE_MS);
    });

    it('should indicate if cycle is overtime', () => {
      state.cycleTime = PLC_CONFIG.SCAN_CYCLE_MS + 10;

      const stats = ScanCycleService.getStats(state);

      expect(stats.isOvertime).toBe(true);
    });

    it('should indicate if cycle is on time', () => {
      state.cycleTime = PLC_CONFIG.SCAN_CYCLE_MS - 10;

      const stats = ScanCycleService.getStats(state);

      expect(stats.isOvertime).toBe(false);
    });

    it('should return average cycle time (currently same as cycle time)', () => {
      state.cycleTime = 50;

      const stats = ScanCycleService.getStats(state);

      expect(stats.averageCycleTime).toBe(50);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete start-run-stop cycle', () => {
      // Start PLC
      let newState = ScanCycleService.start(state);
      expect(newState.mode).toBe(ExecutionMode.RUNNING);
      expect(newState.scanCount).toBe(0);

      // Run a few cycles
      newState.programText = 'LD I0.0\nOUT Q0.0';
      newState.inputs['I0.0'] = true;

      for (let i = 0; i < 5; i++) {
        newState = ScanCycleService.executeCycle(newState);
      }

      expect(newState.scanCount).toBe(5);
      expect(newState.outputs['Q0.0']).toBe(true);

      // Stop PLC
      newState = ScanCycleService.stop(newState);
      expect(newState.mode).toBe(ExecutionMode.STOPPED);

      // Verify state is preserved
      expect(newState.scanCount).toBe(5);
      expect(newState.outputs['Q0.0']).toBe(true);
    });

    it('should handle start-pause-start cycle', () => {
      let newState = ScanCycleService.start(state);
      newState.programText = 'LD I0.0\nOUT Q0.0';
      newState.inputs['I0.0'] = true;

      newState = ScanCycleService.executeCycle(newState);
      expect(newState.outputs['Q0.0']).toBe(true);

      // Pause
      newState = ScanCycleService.pause(newState);
      expect(newState.mode).toBe(ExecutionMode.IDLE);

      // Try to execute - should not run
      const pausedState = ScanCycleService.executeCycle(newState);
      expect(pausedState).toEqual(newState);

      // Resume
      newState = ScanCycleService.start(newState);
      expect(newState.mode).toBe(ExecutionMode.RUNNING);
      expect(newState.scanCount).toBe(0); // Reset on start
    });

    it('should handle timer operation across multiple cycles', () => {
      vi.useFakeTimers();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      state.programText = 'LD I0.0\nTON T1 10\nLD T1\nOUT Q0.0';
      state.inputs['I0.0'] = true;
      state = ScanCycleService.start(state);

      // Run cycles with time advancement
      for (let i = 0; i < 12; i++) {
        state = ScanCycleService.executeCycle(state);
        vi.advanceTimersByTime(100); // Advance 100ms per cycle
      }

      // Timer should be done after 1000ms (10 * 100ms)
      expect(state.memoryVariables['T1'].done).toBe(true);
      expect(state.outputs['Q0.0']).toBe(true);

      vi.useRealTimers();
    });
  });
});
