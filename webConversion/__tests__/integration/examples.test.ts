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
    it('should activate output after 5 second delay', () => {
      const program = `
        LD I0.0
        TON T0,50
        LD T0
        OUT Q0.0
      `;

      let result = state;

      // Press and hold input
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      // Output should not be ON immediately
      expect(result.outputs['Q0.0']).toBe(false);
      expect(result.memoryVariables['T0']).toBeDefined();

      // Simulate time passing (50 cycles * 100ms = 5 seconds)
      for (let i = 0; i < 50; i++) {
        result = executeProgram(program, result);
      }

      // After delay, output should be ON
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T0'].done).toBe(true);
    });

    it('should reset timer when input goes OFF', () => {
      const program = `
        LD I0.0
        TON T0,50
        LD T0
        OUT Q0.0
      `;

      let result = state;

      // Press input
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      // Wait partially (25 cycles)
      for (let i = 0; i < 25; i++) {
        result = executeProgram(program, result);
      }

      expect(result.memoryVariables['T0'].accumulated).toBeGreaterThanOrEqual(0);
      expect(result.outputs['Q0.0']).toBe(false);

      // Release input - timer should reset
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      expect(result.memoryVariables['T0'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should maintain done state while input stays ON', () => {
      const program = `
        LD I0.0
        TON T0,30
        LD T0
        OUT Q0.0
      `;

      let result = state;

      // Press input and wait for timer
      result.inputs['I0.0'] = true;
      for (let i = 0; i <= 31; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.0']).toBe(true);

      // Continue holding - output should stay ON
      for (let i = 0; i < 20; i++) {
        result = executeProgram(program, result);
        expect(result.outputs['Q0.0']).toBe(true);
      }
    });
  });

  describe('07 - Timer Off-Delay (TOFF)', () => {
    it('should keep output ON for delay after input goes OFF', () => {
      const program = `
        LD I0.0
        TOFF T1 30

        LD T1
        OUT Q0.0
      `;

      let result = state;

      // Press input - output should turn ON immediately
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T1'].done).toBe(true);

      // Release input - output should stay ON
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true);

      // Wait for delay (30 cycles)
      for (let i = 0; i < 29; i++) {
        result = executeProgram(program, result);
        expect(result.outputs['Q0.0']).toBe(true);
      }

      // After delay expires, output should turn OFF
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should cancel off-delay if input goes back ON', () => {
      const program = `
        LD I0.0
        TOFF T1 30

        LD T1
        OUT Q0.0
      `;

      let result = state;

      // Press input
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);

      // Release input
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      // Wait partially (15 cycles)
      for (let i = 0; i < 15; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.0']).toBe(true);

      // Press input again - should cancel off-delay
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T1'].accumulated).toBe(0);
    });

    it('should turn ON immediately when input is activated', () => {
      const program = `
        LD I0.0
        TOFF T1 50

        LD T1
        OUT Q0.0
      `;

      let result = state;

      // Output OFF initially
      expect(result.outputs['Q0.0']).toBe(false);

      // Press input - output should be ON immediately (no delay)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T1'].done).toBe(true);
    });
  });

  describe('08 - Blinker (Self-Sustaining Oscillator)', () => {
    it('should create oscillating output using timer feedback', () => {
      const program = `
        LDN T0
        TON T0 10

        LD T0
        OUT Q0.0
      `;

      let result = state;

      // Initial state - timer not running
      result = executeProgram(program, result);

      // Timer should start (LDN T0 is true when T0 is not done)
      expect(result.memoryVariables['T0']).toBeDefined();

      // Wait for timer (10 cycles)
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }

      // Output should be ON
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['T0'].done).toBe(true);

      // Timer should reset and start again
      result = executeProgram(program, result);
      expect(result.memoryVariables['T0'].accumulated).toBe(0);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should oscillate continuously for multiple cycles', () => {
      const program = `
        LDN T0
        TON T0 5

        LD T0
        OUT Q0.0
      `;

      let result = state;
      let onCount = 0;
      let offCount = 0;

      // Run for multiple oscillation cycles (100 scans)
      for (let i = 0; i < 100; i++) {
        result = executeProgram(program, result);
        if (result.outputs['Q0.0']) {
          onCount++;
        } else {
          offCount++;
        }
      }

      // Should have multiple ON and OFF states (oscillating)
      expect(onCount).toBeGreaterThan(0);
      expect(offCount).toBeGreaterThan(0);

      // Should have roughly equal time ON and OFF
      const ratio = onCount / offCount;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(2.0);
    });

    it('should use TOFF for symmetric blinker', () => {
      const program = `
        LD Q0.0
        TON T0 10

        LDN Q0.0
        TON T1 10

        LD T0
        RESET T1
        SET Q0.0

        LD T1
        RESET T0
        RESET Q0.0
      `;

      let result = state;
      let transitions = 0;
      let lastState = false;

      // Run for 100 scans
      for (let i = 0; i < 100; i++) {
        result = executeProgram(program, result);

        if (result.outputs['Q0.0'] !== lastState) {
          transitions++;
          lastState = result.outputs['Q0.0'];
        }
      }

      // Should have multiple state transitions (blinking)
      expect(transitions).toBeGreaterThan(2);
    });
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
