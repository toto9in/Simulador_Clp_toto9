import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';
import { Interpreter } from '../../src/services/interpreter';
import { PLCState } from '../../src/types/plc';

describe('Interpreter - Counters', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('CTU (Counter Up)', () => {
    it('should create counter on first execution', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nCTU C0 5';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['C0']).toBeDefined();
      expect(result.memoryVariables['C0'].type).toBe('COUNTER');
      expect(result.memoryVariables['C0'].counterType).toBe('CTU');
      expect(result.memoryVariables['C0'].preset).toBe(5);
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
    });

    it('should count on rising edge only', () => {
      const program = 'LD I0.0\nCTU C0 5';
      
      // First scan - input OFF
      state.inputs['I0.0'] = false;
      let result = executeProgram(program, state);
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      
      // Second scan - input ON (rising edge)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Third scan - input still ON (no edge)
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Fourth scan - input OFF
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Fifth scan - input ON again (rising edge)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(2);
    });

    it('should set done bit when accumulated >= preset', () => {
      const program = 'LD I0.0\nCTU C0 3\nLD C0\nOUT Q0.0';
      
      let result = state;
      
      // Count up to preset
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(3);
      expect(result.memoryVariables['C0'].done).toBe(true);
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should continue counting past preset', () => {
      const program = 'LD I0.0\nCTU C0 3';
      
      let result = state;
      
      // Count to 5 (past preset of 3)
      for (let i = 0; i < 5; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(5);
      expect(result.memoryVariables['C0'].done).toBe(true);
    });

    it('should work without preset if counter already exists', () => {
      // First create counter with CTL
      state.inputs['I0.1'] = true;
      const program1 = 'LD I0.1\nCTL C0 5';
      let result = executeProgram(program1, state);
      
      // Now use CTU without preset
      result.inputs['I0.1'] = false;
      result.inputs['I0.0'] = true;
      const program2 = 'LD I0.0\nCTU C0';
      result = executeProgram(program2, result);
      
      expect(result.memoryVariables['C0'].preset).toBe(5);
      expect(result.memoryVariables['C0'].accumulated).toBe(6); // CTL loaded 5, CTU incremented
    });
  });

  describe('CTD (Counter Down)', () => {
    it('should create counter on first execution', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nCTD C1 10';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['C1']).toBeDefined();
      expect(result.memoryVariables['C1'].type).toBe('COUNTER');
      expect(result.memoryVariables['C1'].counterType).toBe('CTD');
      expect(result.memoryVariables['C1'].preset).toBe(10);
      expect(result.memoryVariables['C1'].accumulated).toBe(10);
    });

    it('should count down on rising edge only', () => {
      const program = 'LD I0.0\nCTD C1 5';
      
      // First scan - input OFF, counter starts at preset
      state.inputs['I0.0'] = false;
      let result = executeProgram(program, state);
      expect(result.memoryVariables['C1'].accumulated).toBe(5);
      
      // Second scan - input ON (rising edge)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(4);
      
      // Third scan - input still ON (no edge)
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(4);
      
      // Fourth scan - input OFF
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(4);
      
      // Fifth scan - input ON again (rising edge)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(3);
    });

    it('should set done bit when accumulated <= 0', () => {
      const program = 'LD I0.0\nCTD C1 3\nLD C1\nOUT Q0.0';
      
      let result = state;
      
      // Count down to 0
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C1'].accumulated).toBe(0);
      expect(result.memoryVariables['C1'].done).toBe(true);
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should work without preset after CTL loads counter', () => {
      // First load counter with CTL
      state.inputs['I0.1'] = true;
      const program1 = 'LD I0.1\nCTL C1 10';
      let result = executeProgram(program1, state);
      
      expect(result.memoryVariables['C1'].accumulated).toBe(10);
      expect(result.memoryVariables['C1'].preset).toBe(10);
      
      // Now use CTD without preset
      result.inputs['I0.1'] = false;
      result.inputs['I0.0'] = true;
      const program2 = 'LD I0.0\nCTD C1';
      result = executeProgram(program2, result);
      
      expect(result.memoryVariables['C1'].accumulated).toBe(9);
    });
  });

  describe('CTR (Counter Reset)', () => {
    it('should reset CTU counter to 0 when accumulator is TRUE', () => {
      // Count up first
      const program = `
        LD I0.0
        CTU C0 5
        
        LD I0.1
        CTR C0
      `;
      
      let result = state;
      
      // Count to 3
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(3);
      
      // Reset counter
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      expect(result.memoryVariables['C0'].done).toBe(false);
    });

    it('should NOT reset counter when accumulator is FALSE', () => {
      const program = `
        LD I0.0
        CTU C0 5
        
        LD I0.1
        CTR C0
      `;
      
      let result = state;
      
      // Count to 3
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(3);
      
      // Try to reset but I0.1 is FALSE
      result.inputs['I0.1'] = false;
      result = executeProgram(program, result);
      
      // Counter should NOT be reset
      expect(result.memoryVariables['C0'].accumulated).toBe(3);
    });

    it('should reset CTD counter to preset when accumulator is TRUE', () => {
      // Count down first
      const program = `
        LD I0.0
        CTD C1 10
        
        LD I0.1
        CTR C1
      `;
      
      let result = state;
      
      // Count down 3 times
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C1'].accumulated).toBe(7);
      
      // Reset counter
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      
      expect(result.memoryVariables['C1'].accumulated).toBe(10);
      expect(result.memoryVariables['C1'].done).toBe(false);
    });
  });

  describe('CTL (Counter Load)', () => {
    it('should load counter value when accumulator is TRUE', () => {
      state.inputs['I0.1'] = true;
      const program = 'LD I0.1\nCTL C1 15';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['C1']).toBeDefined();
      expect(result.memoryVariables['C1'].accumulated).toBe(15);
      expect(result.memoryVariables['C1'].preset).toBe(15);
    });

    it('should NOT load counter when accumulator is FALSE', () => {
      // First load
      state.inputs['I0.1'] = true;
      const program = 'LD I0.1\nCTL C1 20';
      let result = executeProgram(program, state);
      
      expect(result.memoryVariables['C1'].accumulated).toBe(20);
      
      // Try to load different value but I0.1 is FALSE
      result.inputs['I0.1'] = false;
      result = executeProgram(program, result);
      
      // Value should remain 20
      expect(result.memoryVariables['C1'].accumulated).toBe(20);
    });

    it('should create CTD counter by default', () => {
      state.inputs['I0.1'] = true;
      const program = 'LD I0.1\nCTL C1 10';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['C1'].counterType).toBe('CTD');
    });

    it('should set both accumulated and preset', () => {
      state.inputs['I0.1'] = true;
      const program = 'LD I0.1\nCTL C1 25';
      
      const result = executeProgram(program, state);
      
      expect(result.memoryVariables['C1'].accumulated).toBe(25);
      expect(result.memoryVariables['C1'].preset).toBe(25);
    });
  });

  describe('Edge Detection', () => {
    it('should detect multiple rising edges correctly', () => {
      const program = 'LD I0.0\nCTU C0 10';
      let result = state;
      
      // Simulate 5 button presses
      for (let i = 0; i < 5; i++) {
        // OFF
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        
        // ON (rising edge)
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
        
        expect(result.memoryVariables['C0'].accumulated).toBe(i + 1);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(5);
    });

    it('should not count when input stays ON across multiple scans', () => {
      const program = 'LD I0.0\nCTU C0 10';
      
      // First scan - rising edge
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Multiple scans with input still ON
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
        expect(result.memoryVariables['C0'].accumulated).toBe(1);
      }
    });

    it('should handle previousEnable correctly across reset', () => {
      const program = `
        LD I0.0
        CTU C0 10
        
        LD I0.1
        CTR C0
      `;
      
      let result = state;
      
      // Count once
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Reset
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      
      // I0.0 still ON - should not count (no new edge)
      result.inputs['I0.1'] = false;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      
      // Toggle I0.0 - should count
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
    });
  });

  describe('Complete Counter Scenarios', () => {
    it('should handle full count up cycle with reset', () => {
      const program = `
        LD I0.0
        CTU C0 5
        
        LD I0.1
        CTR C0
        
        LD C0
        OUT Q0.0
      `;
      
      let result = state;
      
      // Count to 5
      for (let i = 0; i < 5; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(5);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Reset
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should handle full count down cycle with load', () => {
      const program = `
        LD I0.1
        CTL C1 10
        
        LD I0.0
        CTD C1
        
        LD C1
        OUT Q0.0
      `;
      
      let result = state;
      
      // Load counter
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(10);
      
      result.inputs['I0.1'] = false;
      
      // Count down to 0
      for (let i = 0; i < 10; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C1'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });
});
