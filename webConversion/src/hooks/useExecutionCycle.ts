/**
 * Execution Cycle Custom Hook
 * Manages the 100ms PLC scan cycle
 * Replaces HomePageController.java functionality
 */

import { useEffect, useRef, useCallback } from 'react';
import { ExecutionMode } from '../types/plc';
import { ScanCycleService } from '../services/scanCycle';
import { PLC_CONFIG } from '../utils/constants';
import { usePLCState } from '../context/PLCStateContext';

/**
 * Execution cycle hook options
 */
interface UseExecutionCycleOptions {
  /**
   * Enable/disable the execution cycle
   * Default: true
   */
  enabled?: boolean;

  /**
   * Callback when cycle completes
   */
  onCycleComplete?: (cycleTime: number) => void;

  /**
   * Callback when cycle errors
   */
  onCycleError?: (error: Error) => void;
}

/**
 * Hook to manage PLC execution cycle
 *
 * Automatically runs scan cycle every 100ms when in RUNNING mode
 *
 * @param options - Hook configuration options
 * @returns Control functions for the execution cycle
 */
export function useExecutionCycle(options: UseExecutionCycleOptions = {}) {
  const { enabled = true, onCycleComplete, onCycleError } = options;
  const { state, dispatch } = usePLCState();
  const intervalRef = useRef<number | null>(null);

  // Use ref to always access the latest state (fixes stale closure bug)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Execute one scan cycle
   */
  const executeCycle = useCallback(() => {
    try {
      // Use stateRef.current to get the latest state, not captured state
      const newState = ScanCycleService.executeCycle(stateRef.current);

      // Update state with new values
      dispatch({
        type: 'UPDATE_STATE',
        state: newState,
      });

      // Call completion callback
      if (onCycleComplete) {
        onCycleComplete(newState.cycleTime);
      }
    } catch (error) {
      console.error('Execution cycle error:', error);

      // Stop execution on error
      dispatch({ type: 'SET_MODE', mode: ExecutionMode.STOPPED });

      // Call error callback
      if (onCycleError && error instanceof Error) {
        onCycleError(error);
      }
    }
  }, [dispatch, onCycleComplete, onCycleError]); // Removed 'state' from deps!

  /**
   * Start the execution cycle
   */
  const startCycle = useCallback(() => {
    // Initialize and start using latest state
    const initializedState = ScanCycleService.start(stateRef.current);
    dispatch({ type: 'UPDATE_STATE', state: initializedState });
  }, [dispatch]);

  /**
   * Stop the execution cycle
   */
  const stopCycle = useCallback(() => {
    const stoppedState = ScanCycleService.stop(stateRef.current);
    dispatch({ type: 'UPDATE_STATE', state: stoppedState });
  }, [dispatch]);

  /**
   * Pause the execution cycle
   */
  const pauseCycle = useCallback(() => {
    const pausedState = ScanCycleService.pause(stateRef.current);
    dispatch({ type: 'UPDATE_STATE', state: pausedState });
  }, [dispatch]);

  /**
   * Effect to manage interval based on execution mode
   */
  useEffect(() => {
    // Only run if enabled and in RUNNING mode
    if (!enabled || state.mode !== ExecutionMode.RUNNING) {
      // Clear interval if it exists
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start interval
    intervalRef.current = window.setInterval(() => {
      executeCycle();
    }, PLC_CONFIG.SCAN_CYCLE_MS);

    // Cleanup on unmount or mode change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, state.mode, executeCycle]); // executeCycle is now stable since it doesn't depend on state

  /**
   * Get current cycle statistics
   */
  const getStats = useCallback(() => {
    return ScanCycleService.getStats(stateRef.current);
  }, []);

  return {
    /** Start PLC execution */
    start: startCycle,
    /** Stop PLC execution */
    stop: stopCycle,
    /** Pause PLC execution */
    pause: pauseCycle,
    /** Execute single cycle manually */
    executeCycle,
    /** Get cycle statistics */
    getStats,
    /** Current execution mode */
    mode: state.mode,
    /** Whether cycle is running */
    isRunning: state.mode === ExecutionMode.RUNNING,
  };
}
