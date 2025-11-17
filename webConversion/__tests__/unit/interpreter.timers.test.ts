import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Interpreter } from '../../src/services/interpreter';
import { PLCState } from '../../src/types/plc';

describe('Interpreter - Timers', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('TON (Timer On-Delay)', () => {
    it('should create timer on first execution', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['T0']).toBeDefined();
      expect(result.memoryVariables['T0'].type).toBe('TIMER');
      expect(result.memoryVariables['T0'].timerType).toBe('TON');
      expect(result.memoryVariables['T0'].preset).toBe(1000);
    });

    it('should not be done immediately after enable', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10\nLD T0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
      expect(result.memoryVariables['T0'].done).toBe(false);
    });

    it('should be done after preset time elapses', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10\nLD T0\nOUT Q0.0';
      
      // First scan - timer starts
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
      
      // Advance time by 1001ms
      vi.setSystemTime(now + 1001);
      
      // Second scan - timer should be done
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T0'].done).toBe(true);
    });

    it('should reset when input goes false', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10';
      
      // Start timer
      let result = executeProgram(program, state);
      expect(result.memoryVariables['T0'].enabled).toBe(true);
      
      // Turn off input before time elapses
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      
      expect(result.memoryVariables['T0'].enabled).toBe(false);
      expect(result.memoryVariables['T0'].done).toBe(false);
    });

    it('should maintain done state while enabled', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10';
      
      // Start and complete timer
      let result = executeProgram(program, state);
      vi.setSystemTime(now + 1001);
      result = executeProgram(program, result);
      expect(result.memoryVariables['T0'].done).toBe(true);
      
      // Advance time more - should still be done
      vi.setSystemTime(now + 2000);
      result = executeProgram(program, result);
      expect(result.memoryVariables['T0'].done).toBe(true);
    });
  });

  describe('TOFF (Timer Off-Delay)', () => {
    it('should create timer on first execution', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTOFF T1 10';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['T1']).toBeDefined();
      expect(result.memoryVariables['T1'].type).toBe('TIMER');
      expect(result.memoryVariables['T1'].timerType).toBe('TOFF');
    });

    it('should be done immediately when enabled', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTOFF T1 10\nLD T1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T1'].done).toBe(true);
    });

    it('should stay ON for preset time after input goes OFF', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      const program = 'LD I0.0\nTOFF T1 10\nLD T1\nOUT Q0.0';
      
      // Enable timer
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Disable input - timer should still be ON
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // After preset time, timer should be OFF
      vi.setSystemTime(now + 1001);
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
      expect(result.memoryVariables['T1'].done).toBe(false);
    });

    it('should cancel off-delay if input goes back ON', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      const program = 'LD I0.0\nTOFF T1 10\nLD T1\nOUT Q0.0';
      
      // Enable timer
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Disable input - starts off-delay
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Re-enable input before time expires - should cancel delay
      vi.setSystemTime(now + 500);
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T1'].enabled).toBe(true);
    });
  });

  describe('RST (Reset Timer)', () => {
    it('should reset timer when accumulator is TRUE', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      // Start timer
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      const program = `
        LD I0.0
        TON T0 10
        
        LD I0.1
        RST T0
      `;
      
      let result = executeProgram(program, state);
      expect(result.memoryVariables['T0'].enabled).toBe(true);
      
      // Reset timer
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      
      expect(result.memoryVariables['T0'].enabled).toBe(false);
      expect(result.memoryVariables['T0'].done).toBe(false);
      expect(result.memoryVariables['T0'].startTime).toBeUndefined();
    });

    it('should not reset timer when accumulator is FALSE', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      const program = `
        LD I0.0
        TON T0 10
        
        LD I0.1
        RST T0
      `;
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['T0'].enabled).toBe(true);
      expect(result.memoryVariables['T0'].startTime).toBeDefined();
    });
  });

  describe('Timer Accumulated Value', () => {
    it('should calculate accumulated time for TON', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nTON T0 10';
      
      let result = executeProgram(program, state);
      expect(result.memoryVariables['T0'].accumulated).toBe(0);
      
      // Advance 500ms
      vi.setSystemTime(now + 500);
      result = executeProgram(program, result);
      expect(result.memoryVariables['T0'].accumulated).toBe(500);
      
      // Advance to completion
      vi.setSystemTime(now + 1000);
      result = executeProgram(program, result);
      expect(result.memoryVariables['T0'].accumulated).toBe(1000);
      expect(result.memoryVariables['T0'].done).toBe(true);
    });
  });
});
