import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';
import { Interpreter } from '../../src/services/interpreter';
import { PLCState } from '../../src/types/plc';

describe('Interpreter - Basic Instructions', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('LD (Load)', () => {
    it('should load TRUE when input is ON', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should load FALSE when input is OFF', () => {
      state.inputs['I0.0'] = false;
      const program = 'LD I0.0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('LDN (Load Negated)', () => {
    it('should load FALSE when input is ON', () => {
      state.inputs['I0.0'] = true;
      const program = 'LDN I0.0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should load TRUE when input is OFF', () => {
      state.inputs['I0.0'] = false;
      const program = 'LDN I0.0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('AND', () => {
    it('should return TRUE when both inputs are TRUE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = true;
      const program = 'LD I0.0\nAND I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should return FALSE when first input is FALSE', () => {
      state.inputs['I0.0'] = false;
      state.inputs['I0.1'] = true;
      const program = 'LD I0.0\nAND I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should return FALSE when second input is FALSE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      const program = 'LD I0.0\nAND I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('ANDN (AND Negated)', () => {
    it('should return TRUE when first is TRUE and second is FALSE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      const program = 'LD I0.0\nANDN I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should return FALSE when both are TRUE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = true;
      const program = 'LD I0.0\nANDN I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('OR', () => {
    it('should return TRUE when first input is TRUE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      const program = 'LD I0.0\nOR I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should return TRUE when second input is TRUE', () => {
      state.inputs['I0.0'] = false;
      state.inputs['I0.1'] = true;
      const program = 'LD I0.0\nOR I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should return FALSE when both inputs are FALSE', () => {
      state.inputs['I0.0'] = false;
      state.inputs['I0.1'] = false;
      const program = 'LD I0.0\nOR I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('ORN (OR Negated)', () => {
    it('should return TRUE when first is FALSE and second is TRUE', () => {
      state.inputs['I0.0'] = false;
      state.inputs['I0.1'] = false;
      const program = 'LD I0.0\nORN I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should return TRUE when first is TRUE', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = true;
      const program = 'LD I0.0\nORN I0.1\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('NOT', () => {
    it('should negate TRUE to FALSE', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nNOT\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should negate FALSE to TRUE', () => {
      state.inputs['I0.0'] = false;
      const program = 'LD I0.0\nNOT\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('OUT', () => {
    it('should set output to accumulator value', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nOUT Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should handle multiple outputs', () => {
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nOUT Q0.0\nOUT Q0.1';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(true);
    });
  });

  describe('SET/RESET', () => {
    it('SET should latch output ON', () => {
      state.inputs['I0.0'] = true;
      const program1 = 'LD I0.0\nSET Q0.0';
      
      let result = executeProgram(program1, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Even after input goes OFF, output stays ON
      result.inputs['I0.0'] = false;
      const program2 = 'LD I0.0\nSET Q0.0';
      result = executeProgram(program2, result);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('RESET should turn output OFF', () => {
      state.outputs['Q0.0'] = true;
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nRESET Q0.0';
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('Complex Logic', () => {
    it('should handle (I0.0 AND I0.1) OR I1.0', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      state.inputs['I1.0'] = true;
      
      const program = `
        LD I0.0
        AND I0.1
        OR I1.0
        OUT Q0.0
      `;
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should handle I0.0 AND (I0.1 OR I1.0)', () => {
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      state.inputs['I1.0'] = true;
      
      const program = `
        LD I0.1
        OR I1.0
        AND I0.0
        OUT Q0.0
      `;
      
      const result = executeProgram(program, state);
      
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });
});
