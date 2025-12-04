/**
 * PLC Scan Cycle Service
 * Implements the PLC scan cycle: Read Inputs → Execute Program → Update Outputs
 * Based on the cycle described in Controllers/HomePageController.java
 */

import type { PLCState } from '../types/plc';
import { ExecutionMode } from '../types/plc';
import { Interpreter } from './interpreter';
import { MemoryService } from './memory';
import { PLC_CONFIG } from '../utils/constants';

/**
 * PLC Scan Cycle Service
 * Manages the 100ms execution cycle
 */
export class ScanCycleService {
  /**
   * Execute one complete PLC scan cycle
   *
   * Steps:
   * 0. Check if in RUN mode
   * 1. Read inputs (already in state - from UI interactions)
   * 2. Execute user program and update outputs
   * 3. Update timers
   *
   * @param state - Current PLC state
   * @returns Updated PLC state
   */
  static executeCycle(state: PLCState): PLCState {
    // Only execute if in RUNNING mode
    if (state.mode !== ExecutionMode.RUNNING) {
      return state;
    }

    const startTime = performance.now();

    try {
      // DEBUG: Log inputs at start of cycle
      if (state.scanCount % 10 === 0) { // Log every 10 cycles to avoid spam
        console.log('=== SCAN CYCLE', state.scanCount, '===');
        console.log('INPUTS:', {
          'I0.0': state.inputs['I0.0'],
          'I0.1': state.inputs['I0.1'],
          'I1.0': state.inputs['I1.0'],
          'I1.1': state.inputs['I1.1'],
        });
      }

      // Step 2: Execute user program
      const newState = Interpreter.executeProgram(state);

      // DEBUG: Log timers BEFORE update
      if (state.scanCount % 10 === 0) {
        const timers = Object.values(newState.memoryVariables).filter(v => v.type === 'TIMER');
        if (timers.length > 0) {
          console.log('TIMERS BEFORE UPDATE:');
          timers.forEach(t => {
            console.log(`  ${t.id}: currentValue=${t.currentValue}, enabled=${t.enabled}, acc=${t.accumulated}, preset=${t.preset}, done=${t.done}, startTime=${t.startTime}`);
          });
        }
      }

      // Step 3: Update timers based on their enable conditions
      MemoryService.updateAllTimers(newState.memoryVariables);

      // DEBUG: Log outputs and timers AFTER execution
      if (state.scanCount % 10 === 0) {
        console.log('OUTPUTS:', {
          'Q0.0': newState.outputs['Q0.0'],
          'Q0.1': newState.outputs['Q0.1'],
          'Q0.2': newState.outputs['Q0.2'],
          'Q0.3': newState.outputs['Q0.3'],
          'Q1.0': newState.outputs['Q1.0'],
        });

        // Log timers with detailed info AFTER update
        const timers = Object.values(newState.memoryVariables).filter(v => v.type === 'TIMER');
        if (timers.length > 0) {
          console.log('TIMERS AFTER UPDATE:');
          timers.forEach(t => {
            console.log(`  ${t.id}: currentValue=${t.currentValue}, enabled=${t.enabled}, acc=${t.accumulated}, preset=${t.preset}, done=${t.done}, startTime=${t.startTime}`);
          });
        }
      }

      // Step 4: Calculate cycle time
      const endTime = performance.now();
      const cycleTime = endTime - startTime;

      // Update cycle stats
      newState.cycleTime = cycleTime;
      newState.scanCount = state.scanCount + 1;

      // Warn if cycle took too long
      if (cycleTime > PLC_CONFIG.SCAN_CYCLE_MS * 1.5) {
        console.warn(
          `Scan cycle took ${cycleTime.toFixed(2)}ms (target: ${PLC_CONFIG.SCAN_CYCLE_MS}ms)`
        );
      }

      return newState;
    } catch (error) {
      console.error('Error during scan cycle:', error);
      // On error, stop execution
      return {
        ...state,
        mode: ExecutionMode.STOPPED,
        cycleTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Initialize PLC (Step 0 of cycle)
   * Reset all outputs and memory variables
   *
   * @param state - Current PLC state
   * @returns Initialized PLC state
   */
  static initialize(state: PLCState): PLCState {
    // Reset all outputs to false
    const outputs: Record<string, boolean> = {};
    for (const key in state.outputs) {
      outputs[key] = false;
    }

    // Clear memory variables (but keep definitions from program)
    // Reset timers and counters
    const memoryVariables = { ...state.memoryVariables };
    for (const key in memoryVariables) {
      const memVar = memoryVariables[key];
      if (memVar.type === 'TIMER') {
        MemoryService.resetTimer(memVar);
      } else if (memVar.type === 'COUNTER') {
        MemoryService.resetCounter(memVar);
      } else {
        memVar.currentValue = false;
      }
    }

    return {
      ...state,
      outputs,
      memoryVariables,
      accumulator: false,
      scanCount: 0,
      cycleTime: 0,
    };
  }

  /**
   * Start PLC execution
   * Initialize system and set mode to RUNNING
   *
   * @param state - Current PLC state
   * @returns State ready for execution
   */
  static start(state: PLCState): PLCState {
    const initializedState = this.initialize(state);
    return {
      ...initializedState,
      mode: ExecutionMode.RUNNING,
    };
  }

  /**
   * Stop PLC execution
   * Set mode to STOPPED
   *
   * @param state - Current PLC state
   * @returns Stopped state
   */
  static stop(state: PLCState): PLCState {
    return {
      ...state,
      mode: ExecutionMode.STOPPED,
    };
  }

  /**
   * Pause PLC execution
   * Set mode to IDLE (program mode)
   *
   * @param state - Current PLC state
   * @returns Paused state
   */
  static pause(state: PLCState): PLCState {
    return {
      ...state,
      mode: ExecutionMode.IDLE,
    };
  }

  /**
   * Get scan cycle statistics
   *
   * @param state - Current PLC state
   * @returns Scan cycle stats
   */
  static getStats(state: PLCState): {
    scanCount: number;
    cycleTime: number;
    averageCycleTime: number;
    targetCycleTime: number;
    isOvertime: boolean;
  } {
    return {
      scanCount: state.scanCount,
      cycleTime: state.cycleTime,
      averageCycleTime: state.cycleTime, // Could be enhanced with moving average
      targetCycleTime: PLC_CONFIG.SCAN_CYCLE_MS,
      isOvertime: state.cycleTime > PLC_CONFIG.SCAN_CYCLE_MS,
    };
  }
}
