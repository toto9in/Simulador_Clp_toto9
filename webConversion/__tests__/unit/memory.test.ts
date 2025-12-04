import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryService } from '../../src/services/memory';
import type { MemoryVariable } from '../../src/types/plc';
import { VALIDATION, PLC_CONFIG } from '../../src/utils/constants';

describe('MemoryService', () => {
  describe('createMemoryVariable', () => {
    it('should create a basic memory variable', () => {
      const memVar = MemoryService.createMemoryVariable('M0');

      expect(memVar.id).toBe('M0');
      expect(memVar.type).toBe('MEMORY');
      expect(memVar.currentValue).toBe(false);
      expect(memVar.preset).toBe(0);
      expect(memVar.accumulated).toBe(0);
      expect(memVar.enabled).toBe(false);
      expect(memVar.done).toBe(false);
    });
  });

  describe('createTimer', () => {
    it('should create a TON timer with valid preset', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 50);

      expect(timer.id).toBe('T1');
      expect(timer.type).toBe('TIMER');
      expect(timer.timerType).toBe('TON');
      expect(timer.preset).toBe(50);
      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(false);
      expect(timer.enabled).toBe(false);
      expect(timer.startTime).toBeUndefined();
    });

    it('should create a TOFF timer with valid preset', () => {
      const timer = MemoryService.createTimer('T2', 'TOFF', 100);

      expect(timer.id).toBe('T2');
      expect(timer.type).toBe('TIMER');
      expect(timer.timerType).toBe('TOFF');
      expect(timer.preset).toBe(100);
    });

    it('should throw error if preset is too low', () => {
      expect(() => {
        MemoryService.createTimer('T1', 'TON', VALIDATION.MIN_TIMER_PRESET - 1);
      }).toThrow('Timer preset must be between');
    });

    it('should throw error if preset is too high', () => {
      expect(() => {
        MemoryService.createTimer('T1', 'TON', VALIDATION.MAX_TIMER_PRESET + 1);
      }).toThrow('Timer preset must be between');
    });

    it('should accept minimum valid preset', () => {
      const timer = MemoryService.createTimer('T1', 'TON', VALIDATION.MIN_TIMER_PRESET);
      expect(timer.preset).toBe(VALIDATION.MIN_TIMER_PRESET);
    });

    it('should accept maximum valid preset', () => {
      const timer = MemoryService.createTimer('T1', 'TON', VALIDATION.MAX_TIMER_PRESET);
      expect(timer.preset).toBe(VALIDATION.MAX_TIMER_PRESET);
    });
  });

  describe('createCounter', () => {
    it('should create a CTU counter with valid preset', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', 10);

      expect(counter.id).toBe('C1');
      expect(counter.type).toBe('COUNTER');
      expect(counter.counterType).toBe('CTU');
      expect(counter.preset).toBe(10);
      expect(counter.accumulated).toBe(0);
      expect(counter.done).toBe(false);
      expect(counter.previousEnable).toBe(false);
    });

    it('should create a CTD counter with valid preset', () => {
      const counter = MemoryService.createCounter('C2', 'CTD', 5);

      expect(counter.id).toBe('C2');
      expect(counter.type).toBe('COUNTER');
      expect(counter.counterType).toBe('CTD');
      expect(counter.preset).toBe(5);
    });

    it('should throw error if preset is too low', () => {
      expect(() => {
        MemoryService.createCounter('C1', 'CTU', VALIDATION.MIN_COUNTER_PRESET - 1);
      }).toThrow('Counter preset must be between');
    });

    it('should throw error if preset is too high', () => {
      expect(() => {
        MemoryService.createCounter('C1', 'CTU', VALIDATION.MAX_COUNTER_PRESET + 1);
      }).toThrow('Counter preset must be between');
    });

    it('should accept minimum valid preset', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', VALIDATION.MIN_COUNTER_PRESET);
      expect(counter.preset).toBe(VALIDATION.MIN_COUNTER_PRESET);
    });

    it('should accept maximum valid preset', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', VALIDATION.MAX_COUNTER_PRESET);
      expect(counter.preset).toBe(VALIDATION.MAX_COUNTER_PRESET);
    });
  });

  describe('updateTimer - TON (Timer On Delay)', () => {
    let timer: MemoryVariable;

    beforeEach(() => {
      timer = MemoryService.createTimer('T1', 'TON', 10);
      vi.useFakeTimers();
    });

    it('should start timer on rising edge', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      MemoryService.updateTimer(timer, true);

      expect(timer.enabled).toBe(true);
      expect(timer.startTime).toBe(startTime);
      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(false);
    });

    it('should update accumulated time while running', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Start timer
      MemoryService.updateTimer(timer, true);

      // Advance time by 500ms (5 * 100ms = 5 units)
      vi.advanceTimersByTime(500);
      MemoryService.updateTimer(timer, true);

      expect(timer.accumulated).toBe(5);
      expect(timer.done).toBe(false);
    });

    it('should set done bit when preset reached', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Start timer with preset of 10 (1000ms)
      MemoryService.updateTimer(timer, true);

      // Advance time by 1000ms
      vi.advanceTimersByTime(1000);
      MemoryService.updateTimer(timer, true);

      expect(timer.accumulated).toBe(10);
      expect(timer.done).toBe(true);
    });

    it('should not exceed preset value', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      MemoryService.updateTimer(timer, true);

      // Advance time beyond preset
      vi.advanceTimersByTime(2000);
      MemoryService.updateTimer(timer, true);

      expect(timer.accumulated).toBe(10); // Should cap at preset
      expect(timer.done).toBe(true);
    });

    it('should reset timer when input goes false', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Start timer
      MemoryService.updateTimer(timer, true);
      vi.advanceTimersByTime(500);
      MemoryService.updateTimer(timer, true);

      expect(timer.accumulated).toBeGreaterThan(0);

      // Disable timer
      MemoryService.updateTimer(timer, false);

      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(false);
      expect(timer.startTime).toBeUndefined();
      expect(timer.enabled).toBe(false);
    });

    it('should throw error if not a timer', () => {
      const memVar = MemoryService.createMemoryVariable('M0');

      expect(() => {
        MemoryService.updateTimer(memVar, true);
      }).toThrow('is not a timer');
    });
  });

  describe('updateTimer - TOFF (Timer Off Delay)', () => {
    let timer: MemoryVariable;

    beforeEach(() => {
      timer = MemoryService.createTimer('T2', 'TOFF', 10);
      vi.useFakeTimers();
    });

    it('should start timer on falling edge', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // First set enabled to true
      timer.enabled = true;

      // Then trigger falling edge
      MemoryService.updateTimer(timer, false);

      expect(timer.startTime).toBe(startTime);
      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(true); // TOFF starts with done=true
    });

    it('should update accumulated time while running', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      timer.enabled = true;
      MemoryService.updateTimer(timer, false); // Start on falling edge

      vi.advanceTimersByTime(500);
      MemoryService.updateTimer(timer, false);

      expect(timer.accumulated).toBe(5);
      expect(timer.done).toBe(true); // Still true until preset reached
    });

    it('should clear done bit when preset reached', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      timer.enabled = true;
      MemoryService.updateTimer(timer, false); // Start

      vi.advanceTimersByTime(1000);
      MemoryService.updateTimer(timer, false);

      expect(timer.accumulated).toBe(10);
      expect(timer.done).toBe(false); // TOFF done=false when expired
    });

    it('should reset when input goes true', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      timer.enabled = true;
      MemoryService.updateTimer(timer, false); // Start

      vi.advanceTimersByTime(500);
      MemoryService.updateTimer(timer, false);

      // Enable input
      MemoryService.updateTimer(timer, true);

      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(true); // TOFF reset has done=true
      expect(timer.startTime).toBeUndefined();
    });
  });

  describe('incrementCounter (CTU)', () => {
    let counter: MemoryVariable;

    beforeEach(() => {
      counter = MemoryService.createCounter('C1', 'CTU', 5);
    });

    it('should increment accumulated value', () => {
      MemoryService.incrementCounter(counter);
      expect(counter.accumulated).toBe(1);
      expect(counter.done).toBe(false);
    });

    it('should set done bit when reaching preset', () => {
      for (let i = 0; i < 5; i++) {
        MemoryService.incrementCounter(counter);
      }

      expect(counter.accumulated).toBe(5);
      expect(counter.done).toBe(true);
    });

    it('should keep done bit set when exceeding preset', () => {
      for (let i = 0; i < 10; i++) {
        MemoryService.incrementCounter(counter);
      }

      expect(counter.accumulated).toBe(10);
      expect(counter.done).toBe(true);
    });

    it('should throw error if not a counter', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 10);

      expect(() => {
        MemoryService.incrementCounter(timer);
      }).toThrow('is not a counter');
    });

    it('should throw error if counter is CTD', () => {
      const ctdCounter = MemoryService.createCounter('C2', 'CTD', 5);

      expect(() => {
        MemoryService.incrementCounter(ctdCounter);
      }).toThrow('is not a CTU');
    });
  });

  describe('decrementCounter (CTD)', () => {
    let counter: MemoryVariable;

    beforeEach(() => {
      counter = MemoryService.createCounter('C1', 'CTD', 5);
      counter.accumulated = 5; // Start at preset
    });

    it('should decrement accumulated value', () => {
      MemoryService.decrementCounter(counter);
      expect(counter.accumulated).toBe(4);
      expect(counter.done).toBe(false);
    });

    it('should set done bit when reaching zero', () => {
      for (let i = 0; i < 5; i++) {
        MemoryService.decrementCounter(counter);
      }

      expect(counter.accumulated).toBe(0);
      expect(counter.done).toBe(true);
    });

    it('should keep done bit set when going negative', () => {
      for (let i = 0; i < 7; i++) {
        MemoryService.decrementCounter(counter);
      }

      expect(counter.accumulated).toBe(-2);
      expect(counter.done).toBe(true);
    });

    it('should throw error if not a counter', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 10);

      expect(() => {
        MemoryService.decrementCounter(timer);
      }).toThrow('is not a counter');
    });

    it('should throw error if counter is CTU', () => {
      const ctuCounter = MemoryService.createCounter('C2', 'CTU', 5);

      expect(() => {
        MemoryService.decrementCounter(ctuCounter);
      }).toThrow('is not a CTD');
    });
  });

  describe('resetCounter', () => {
    it('should reset CTU counter to zero', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', 10);
      counter.accumulated = 5;
      counter.done = false;

      MemoryService.resetCounter(counter);

      expect(counter.accumulated).toBe(0);
      expect(counter.done).toBe(false);
    });

    it('should reset CTD counter to preset', () => {
      const counter = MemoryService.createCounter('C1', 'CTD', 10);
      counter.accumulated = 3;
      counter.done = false;

      MemoryService.resetCounter(counter);

      expect(counter.accumulated).toBe(10);
      expect(counter.done).toBe(false);
    });

    it('should clear done bit after reset', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', 5);
      counter.accumulated = 10;
      counter.done = true;

      MemoryService.resetCounter(counter);

      expect(counter.accumulated).toBe(0);
      expect(counter.done).toBe(false);
    });

    it('should throw error if not a counter', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 10);

      expect(() => {
        MemoryService.resetCounter(timer);
      }).toThrow('is not a counter');
    });
  });

  describe('resetTimer', () => {
    it('should reset timer completely', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 10);
      timer.accumulated = 5;
      timer.done = true;
      timer.enabled = true;
      timer.startTime = Date.now();

      MemoryService.resetTimer(timer);

      expect(timer.accumulated).toBe(0);
      expect(timer.done).toBe(false);
      expect(timer.enabled).toBe(false);
      expect(timer.startTime).toBeUndefined();
    });

    it('should throw error if not a timer', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', 10);

      expect(() => {
        MemoryService.resetTimer(counter);
      }).toThrow('is not a timer');
    });
  });

  describe('toString', () => {
    it('should format memory variable correctly', () => {
      const memVar = MemoryService.createMemoryVariable('M0');
      memVar.currentValue = true;

      const str = MemoryService.toString(memVar);

      expect(str).toBe('Memory M0: State=true');
    });

    it('should format TON timer correctly', () => {
      const timer = MemoryService.createTimer('T1', 'TON', 50);
      timer.currentValue = true;
      timer.accumulated = 25;
      timer.done = false;

      const str = MemoryService.toString(timer);

      expect(str).toBe('Timer On T1: EN=true, Accum=25, Preset=50, DN=false');
    });

    it('should format TOFF timer correctly', () => {
      const timer = MemoryService.createTimer('T2', 'TOFF', 100);
      timer.currentValue = false;
      timer.accumulated = 50;
      timer.done = true;

      const str = MemoryService.toString(timer);

      expect(str).toBe('Timer Off T2: EN=false, Accum=50, Preset=100, DN=true');
    });

    it('should format CTU counter correctly', () => {
      const counter = MemoryService.createCounter('C1', 'CTU', 10);
      counter.accumulated = 5;
      counter.done = false;

      const str = MemoryService.toString(counter);

      expect(str).toBe('Counter Up C1: Accum=5, Preset=10, DN=false');
    });

    it('should format CTD counter correctly', () => {
      const counter = MemoryService.createCounter('C2', 'CTD', 20);
      counter.accumulated = 0;
      counter.done = true;

      const str = MemoryService.toString(counter);

      expect(str).toBe('Counter Down C2: Accum=0, Preset=20, DN=true');
    });
  });

  describe('updateAllTimers', () => {
    it('should update all timers in memory variables', () => {
      vi.useFakeTimers();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const memoryVariables: Record<string, MemoryVariable> = {
        M0: MemoryService.createMemoryVariable('M0'),
        T1: MemoryService.createTimer('T1', 'TON', 10),
        T2: MemoryService.createTimer('T2', 'TOFF', 10),
        C1: MemoryService.createCounter('C1', 'CTU', 5),
      };

      // Set timers to enabled
      memoryVariables.T1.currentValue = true;
      memoryVariables.T2.currentValue = false;
      memoryVariables.T2.enabled = true; // For TOFF falling edge

      MemoryService.updateAllTimers(memoryVariables);

      expect(memoryVariables.T1.startTime).toBe(startTime);
      expect(memoryVariables.T2.startTime).toBe(startTime);

      // Advance time
      vi.advanceTimersByTime(500);
      MemoryService.updateAllTimers(memoryVariables);

      expect(memoryVariables.T1.accumulated).toBe(5);
      expect(memoryVariables.T2.accumulated).toBe(5);

      // Memory and counter should not be affected
      expect(memoryVariables.M0.accumulated).toBe(0);
      expect(memoryVariables.C1.accumulated).toBe(0);
    });

    it('should handle empty memory variables', () => {
      expect(() => {
        MemoryService.updateAllTimers({});
      }).not.toThrow();
    });

    it('should only update timers, not other variable types', () => {
      const memoryVariables: Record<string, MemoryVariable> = {
        M0: MemoryService.createMemoryVariable('M0'),
        C1: MemoryService.createCounter('C1', 'CTU', 5),
      };

      expect(() => {
        MemoryService.updateAllTimers(memoryVariables);
      }).not.toThrow();
    });
  });
});
