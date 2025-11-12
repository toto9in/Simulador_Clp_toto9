import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Interpreter } from '../../src/services/interpreter';
import { PLCState } from '../../src/types/plc';

describe('Example Programs Integration Tests', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('01 - Basic Output', () => {
    it('should turn ON output when input is ON', () => {
      const program = 'LD I0.0\nOUT Q0.0';
      
      state.inputs['I0.0'] = true;
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should turn OFF output when input is OFF', () => {
      const program = 'LD I0.0\nOUT Q0.0';
      
      state.inputs['I0.0'] = false;
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('02 - AND Logic', () => {
    it('should implement AND gate (both inputs must be ON)', () => {
      const program = 'LD I0.0\nAND I0.1\nOUT Q0.0';
      
      // Both OFF
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
      
      // Only first ON
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
      
      // Both ON
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('03 - OR Logic', () => {
    it('should implement OR gate (any input ON)', () => {
      const program = 'LD I0.0\nOR I0.1\nOUT Q0.0';
      
      // Both OFF
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
      
      // First ON
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Second ON (first OFF)
      result.inputs['I0.0'] = false;
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('04 - NOT Logic', () => {
    it('should invert input signal', () => {
      const program = 'LD I0.0\nNOT\nOUT Q0.0';
      
      // Input OFF -> Output ON
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Input ON -> Output OFF
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('05 - SET/RESET', () => {
    it('should latch output ON with SET and turn OFF with RESET', () => {
      const program = `
        LD I0.0
        SET Q0.0
        
        LD I0.1
        RESET Q0.0
      `;
      
      // Press SET button
      let result = state;
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Release SET button - output stays ON
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Press RESET button
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
      
      // Release RESET button - output stays OFF
      result.inputs['I0.1'] = false;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('06 - Timer On-Delay (TON)', () => {
  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('07 - Timer Off-Delay (TOFF)', () => {
  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('08 - Blinker (Self-Sustaining Oscillator)', () => {
  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('09 - Counter Up (CTU)', () => {
    it('should count button presses and activate output at preset', () => {
      const program = `
        LD I0.0
        CTU C0 5
        
        LD I0.1
        CTR C0
        
        LD C0
        OUT Q0.0
      `;
      
      let result = state;
      
      // Count 5 times
      for (let i = 0; i < 5; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C0'].accumulated).toBe(5);
      expect(result.outputs['Q0.0']).toBe(true);
      
      // Reset counter
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should only count on rising edges', () => {
      const program = 'LD I0.0\nCTU C0 5';
      
      let result = state;
      
      // Hold button for multiple scans
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
      
      // Button still held - should not count again
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }
      expect(result.memoryVariables['C0'].accumulated).toBe(1);
    });
  });

  describe('10 - Counter Down (CTD)', () => {
    it('should count down from preset and activate output at zero', () => {
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
      
      // Count down 10 times
      for (let i = 0; i < 10; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }
      
      expect(result.memoryVariables['C1'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should only count down on rising edges', () => {
      const program = `
        LD I0.1
        CTL C1 5
        
        LD I0.0
        CTD C1
      `;
      
      let result = state;
      
      // Load counter
      result.inputs['I0.1'] = true;
      result = executeProgram(program, result);
      result.inputs['I0.1'] = false;
      
      // Hold button for multiple scans
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.memoryVariables['C1'].accumulated).toBe(4);
      
      // Button still held - should not count again
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }
      expect(result.memoryVariables['C1'].accumulated).toBe(4);
    });
  });
});
