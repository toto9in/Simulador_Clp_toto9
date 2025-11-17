/**
 * Memory Service
 * Manages memory variables, timers, and counters
 * Converted from src/ilcompiler/memoryvariable/MemoryVariable.java
 */

import type { MemoryVariable } from '../types/plc';
import { PLC_CONFIG, VALIDATION } from '../utils/constants';

/**
 * Service for managing PLC memory variables
 */
export class MemoryService {
  /**
   * Create a new memory variable
   */
  static createMemoryVariable(id: string): MemoryVariable {
    return {
      id,
      type: 'MEMORY',
      currentValue: false,
      preset: 0,
      accumulated: 0,
      enabled: false,
      done: false,
    };
  }

  /**
   * Create a new timer
   */
  static createTimer(id: string, timerType: 'TON' | 'TOFF', preset: number): MemoryVariable {
    if (preset < VALIDATION.MIN_TIMER_PRESET || preset > VALIDATION.MAX_TIMER_PRESET) {
      throw new Error(
        `Timer preset must be between ${VALIDATION.MIN_TIMER_PRESET} and ${VALIDATION.MAX_TIMER_PRESET}`
      );
    }

    return {
      id,
      type: 'TIMER',
      timerType,
      currentValue: false,
      preset,
      accumulated: 0,
      enabled: false,
      done: false,
      startTime: undefined,
    };
  }

  /**
   * Create a new counter
   */
  static createCounter(id: string, counterType: 'CTU' | 'CTD', preset: number): MemoryVariable {
    if (preset < VALIDATION.MIN_COUNTER_PRESET || preset > VALIDATION.MAX_COUNTER_PRESET) {
      throw new Error(
        `Counter preset must be between ${VALIDATION.MIN_COUNTER_PRESET} and ${VALIDATION.MAX_COUNTER_PRESET}`
      );
    }

    return {
      id,
      type: 'COUNTER',
      counterType,
      currentValue: false,
      preset,
      accumulated: 0,
      enabled: false,
      done: false,
      previousEnable: false, // Initialize for edge detection
    };
  }

  /**
   * Update timer state based on enable input
   * Called every scan cycle (100ms)
   */
  static updateTimer(timer: MemoryVariable, enabled: boolean): void {
    if (timer.type !== 'TIMER') {
      throw new Error(`Variable ${timer.id} is not a timer`);
    }

    const now = Date.now();

    // Timer On Delay (TON)
    if (timer.timerType === 'TON') {
      if (enabled && !timer.enabled) {
        // Rising edge - start timer
        timer.startTime = now;
        timer.accumulated = 0;
        timer.done = false;
      } else if (enabled && timer.enabled) {
        // Timer running - update accumulated time
        if (timer.startTime !== undefined) {
          const elapsed = now - timer.startTime;
          timer.accumulated = Math.floor(elapsed / PLC_CONFIG.TIMER_BASE_MS);

          // Check if timer done (both preset and accumulated are in units of TIMER_BASE_MS)
          if (timer.accumulated >= timer.preset) {
            timer.accumulated = timer.preset;
            timer.done = true;
          }
        }
      } else if (!enabled) {
        // TON behavior: When disabled, reset timing
        timer.startTime = undefined;
        timer.accumulated = 0;
        timer.done = false;
      }
    }

    // Timer Off Delay (TOFF)
    else if (timer.timerType === 'TOFF') {
      if (enabled) {
        // TOFF behavior: When enabled, output is immediately ON
        timer.done = true;
        timer.startTime = undefined;
        timer.accumulated = 0;
      } else if (!enabled && timer.enabled) {
        // Falling edge - start delay timer
        timer.startTime = now;
        timer.accumulated = 0;
        timer.done = true; // TOFF stays ON during delay
      } else if (!enabled && !timer.enabled) {
        // Timer running - update accumulated time
        if (timer.startTime !== undefined) {
          const elapsed = now - timer.startTime;
          timer.accumulated = Math.floor(elapsed / PLC_CONFIG.TIMER_BASE_MS);

          // Check if delay expired (both preset and accumulated are in units of TIMER_BASE_MS)
          if (timer.accumulated >= timer.preset) {
            timer.accumulated = timer.preset;
            timer.done = false; // TOFF turns OFF after delay
          }
        }
      }
    }

    timer.enabled = enabled;
  }

  /**
   * Increment counter (CTU)
   */
  static incrementCounter(counter: MemoryVariable): void {
    if (counter.type !== 'COUNTER') {
      throw new Error(`Variable ${counter.id} is not a counter`);
    }

    if (counter.counterType !== 'CTU') {
      throw new Error(`Counter ${counter.id} is not a CTU (count up) counter`);
    }

    counter.accumulated++;
    this.updateCounterDone(counter);
  }

  /**
   * Decrement counter (CTD)
   */
  static decrementCounter(counter: MemoryVariable): void {
    if (counter.type !== 'COUNTER') {
      throw new Error(`Variable ${counter.id} is not a counter`);
    }

    if (counter.counterType !== 'CTD') {
      throw new Error(`Counter ${counter.id} is not a CTD (count down) counter`);
    }

    counter.accumulated--;
    this.updateCounterDone(counter);
  }

  /**
   * Update counter done bit based on accumulated vs preset
   */
  private static updateCounterDone(counter: MemoryVariable): void {
    if (counter.counterType === 'CTU') {
      // Count Up: done when accumulated >= preset
      counter.done = counter.accumulated >= counter.preset;
    } else if (counter.counterType === 'CTD') {
      // Count Down: done when accumulated <= 0
      counter.done = counter.accumulated <= 0;
    }
  }

  /**
   * Reset counter accumulated value
   */
  static resetCounter(counter: MemoryVariable): void {
    if (counter.type !== 'COUNTER') {
      throw new Error(`Variable ${counter.id} is not a counter`);
    }

    if (counter.counterType === 'CTU') {
      counter.accumulated = 0;
    } else if (counter.counterType === 'CTD') {
      counter.accumulated = counter.preset;
    }

    this.updateCounterDone(counter);
  }

  /**
   * Reset timer
   */
  static resetTimer(timer: MemoryVariable): void {
    if (timer.type !== 'TIMER') {
      throw new Error(`Variable ${timer.id} is not a timer`);
    }

    timer.accumulated = 0;
    timer.done = false;
    timer.enabled = false;
    timer.startTime = undefined;
  }

  /**
   * Get formatted string representation of memory variable
   * Used for data table display
   */
  static toString(memVar: MemoryVariable): string {
    const { id, type, currentValue, accumulated, preset, done } = memVar;

    if (type === 'MEMORY') {
      return `Memory ${id}: State=${currentValue}`;
    } else if (type === 'TIMER') {
      const timerType = memVar.timerType === 'TON' ? 'Timer On' : 'Timer Off';
      return `${timerType} ${id}: EN=${currentValue}, Accum=${accumulated}, Preset=${preset}, DN=${done}`;
    } else if (type === 'COUNTER') {
      const counterType = memVar.counterType === 'CTU' ? 'Counter Up' : 'Counter Down';
      return `${counterType} ${id}: Accum=${accumulated}, Preset=${preset}, DN=${done}`;
    }

    return `Unknown memory type: ${id}`;
  }

  /**
   * Update all timers in state
   * Called every scan cycle
   */
  static updateAllTimers(memoryVariables: Record<string, MemoryVariable>): void {
    for (const key in memoryVariables) {
      const memVar = memoryVariables[key];
      if (memVar.type === 'TIMER') {
        this.updateTimer(memVar, memVar.currentValue);
      }
    }
  }
}
