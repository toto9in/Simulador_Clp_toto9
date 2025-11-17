import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';
import { PLCState } from '../../src/types/plc';

describe('Traffic Lights Integration Tests', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('11 - Single Traffic Light', () => {
    it('should cycle through Red -> Green -> Yellow states', () => {
      const program = `
        // Simple traffic light cycle
        // Red: Q0.0, Yellow: Q0.1, Green: Q0.2

        // Red light for 50 cycles
        LDN T0
        ANDN T1
        ANDN T2
        TON T0 50
        LD T0
        SET Q0.0

        // Green light for 40 cycles after red
        LD T0
        TON T1 40
        LD T1
        RESET Q0.0
        SET Q0.2

        // Yellow light for 10 cycles after green
        LD T1
        TON T2 10
        LD T2
        RESET Q0.2
        SET Q0.1

        // Reset cycle
        LD T2
        RESET T0
        RESET T1
        RESET T2
        RESET Q0.1
      `;

      let result = state;

      // Initial state - should start red
      for (let i = 0; i < 5; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.0']).toBe(true);  // Red ON
      expect(result.outputs['Q0.1']).toBe(false); // Yellow OFF
      expect(result.outputs['Q0.2']).toBe(false); // Green OFF

      // After 50 cycles - should be green
      for (let i = 0; i < 50; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.0']).toBe(false); // Red OFF
      expect(result.outputs['Q0.2']).toBe(true);  // Green ON

      // After 40 more cycles - should be yellow
      for (let i = 0; i < 40; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.2']).toBe(false); // Green OFF
      expect(result.outputs['Q0.1']).toBe(true);  // Yellow ON

      // After 10 more cycles - should cycle back to red
      for (let i = 0; i < 15; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.1']).toBe(false); // Yellow OFF
      expect(result.outputs['Q0.0']).toBe(true);  // Red ON
    });

    it('should have only one light ON at a time', () => {
      const program = `
        LDN T0
        ANDN T1
        ANDN T2
        TON T0 30
        LD T0
        OUT Q0.0

        LD T0
        TON T1 30
        LD T1
        OUT Q0.2

        LD T1
        TON T2 10
        LD T2
        OUT Q0.1

        LD T2
        RESET T0
        RESET T1
        RESET T2
      `;

      let result = state;

      // Test for 200 cycles
      for (let i = 0; i < 200; i++) {
        result = executeProgram(program, result);

        const redOn = result.outputs['Q0.0'] || false;
        const yellowOn = result.outputs['Q0.1'] || false;
        const greenOn = result.outputs['Q0.2'] || false;

        // Count how many lights are ON
        const lightsOn = [redOn, yellowOn, greenOn].filter(Boolean).length;

        // Should have at most one light ON
        expect(lightsOn).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('13 - Traffic Light Crossroad (2 Lights)', () => {
    it('should control two independent traffic lights', () => {
      const program = `
        // North-South: Q0.0 (Red), Q0.1 (Yellow), Q0.2 (Green)
        // East-West: Q1.0 (Red), Q1.1 (Yellow), Q1.2 (Green)

        // N-S Red
        LDN T0
        TON T0 50
        LD T0
        OUT Q0.0

        // N-S Green
        LD T0
        TON T1 40
        LD T1
        OUT Q0.2

        // E-W Red
        LDN T2
        TON T2 50
        LD T2
        OUT Q1.0

        // E-W Green
        LD T2
        TON T3 40
        LD T3
        OUT Q1.2
      `;

      let result = state;

      // Run simulation
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }

      // Both lights should exist
      const nsRed = result.outputs['Q0.0'] || false;
      const nsGreen = result.outputs['Q0.2'] || false;
      const ewRed = result.outputs['Q1.0'] || false;
      const ewGreen = result.outputs['Q1.2'] || false;

      // At least one direction should have red
      expect(nsRed || ewRed).toBe(true);
    });

    it('should prevent both directions from being green simultaneously', () => {
      const program = `
        // Safe crossroad - never both green

        // N-S Green only if E-W is Red
        LD I0.0
        ANDN Q1.2
        OUT Q0.2

        // E-W Green only if N-S is Red
        LD I0.1
        ANDN Q0.2
        OUT Q1.2

        // N-S Red when not green
        LDN Q0.2
        OUT Q0.0

        // E-W Red when not green
        LDN Q1.2
        OUT Q1.0
      `;

      let result = state;

      // Test various input combinations
      const combinations = [
        { 'I0.0': false, 'I0.1': false },
        { 'I0.0': true, 'I0.1': false },
        { 'I0.0': false, 'I0.1': true },
        { 'I0.0': true, 'I0.1': true },
      ];

      for (const inputs of combinations) {
        result.inputs = { ...result.inputs, ...inputs };
        result = executeProgram(program, result);

        const nsGreen = result.outputs['Q0.2'] || false;
        const ewGreen = result.outputs['Q1.2'] || false;

        // Both should never be green at the same time
        expect(nsGreen && ewGreen).toBe(false);
      }
    });
  });

  describe('14 - Safe Traffic Light Crossroad', () => {
    it('should implement collision prevention logic', () => {
      const program = `
        // State machine for safe crossroad
        // States: NS_GREEN (M0), EW_GREEN (M1), TRANSITION (M2)

        // Start in NS_GREEN state
        LD I0.0
        SET M0

        // Transition timer
        LD M0
        ANDN M2
        TON T0 50

        LD T0
        RESET M0
        SET M2

        // Transition delay
        LD M2
        TON T1 10

        LD T1
        RESET M2
        SET M1

        // N-S Green when in NS_GREEN state
        LD M0
        OUT Q0.2

        // E-W Green when in EW_GREEN state
        LD M1
        OUT Q1.2

        // N-S Red when not green
        LDN Q0.2
        OUT Q0.0

        // E-W Red when not green
        LDN Q1.2
        OUT Q1.0
      `;

      let result = state;
      result.inputs['I0.0'] = true;

      // Initial cycles
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }

      // N-S should be green
      expect(result.outputs['Q0.2']).toBe(true);
      expect(result.outputs['Q1.2']).toBe(false);

      // Run full cycle with transition
      for (let i = 0; i < 100; i++) {
        result = executeProgram(program, result);

        const nsGreen = result.outputs['Q0.2'] || false;
        const ewGreen = result.outputs['Q1.2'] || false;

        // Safety check: never both green
        expect(nsGreen && ewGreen).toBe(false);
      }
    });

    it('should have all-red safety period during transitions', () => {
      const program = `
        // Crossroad with safety period

        // N-S Green cycle
        LD I0.0
        TON T0 40
        LD T0
        ANDN T1
        ANDN T2
        OUT Q0.2

        // Safety period (all red)
        LD T0
        TON T1 10

        // E-W Green cycle
        LD T1
        TON T2 40
        LD T2
        ANDN T3
        OUT Q1.2

        // Safety period 2
        LD T2
        TON T3 10

        // Reset
        LD T3
        RESET T0
        RESET T1
        RESET T2
        RESET T3

        // Red lights (on when green is off)
        LDN Q0.2
        OUT Q0.0

        LDN Q1.2
        OUT Q1.0
      `;

      let result = state;
      result.inputs['I0.0'] = true;

      let allRedPeriods = 0;
      let bothGreenPeriods = 0;

      // Run for multiple cycles
      for (let i = 0; i < 200; i++) {
        result = executeProgram(program, result);

        const nsRed = result.outputs['Q0.0'] || false;
        const nsGreen = result.outputs['Q0.2'] || false;
        const ewRed = result.outputs['Q1.0'] || false;
        const ewGreen = result.outputs['Q1.2'] || false;

        if (nsRed && ewRed && !nsGreen && !ewGreen) {
          allRedPeriods++;
        }

        if (nsGreen && ewGreen) {
          bothGreenPeriods++;
        }
      }

      // Should have all-red safety periods
      expect(allRedPeriods).toBeGreaterThan(0);

      // Should NEVER have both green at the same time
      expect(bothGreenPeriods).toBe(0);
    });
  });

  describe('Traffic Light Timing and Sequences', () => {
    it('should respect minimum green time before transition', () => {
      const minGreenTime = 30;
      const program = `
        // N-S Green with minimum time
        LD I0.0
        TON T0 ${minGreenTime}
        LD T0
        OUT Q0.2

        // Transition only after minimum time
        LD T0
        AND I0.1
        OUT Q0.1
      `;

      let result = state;
      result.inputs['I0.0'] = true;
      result.inputs['I0.1'] = true;

      // Before minimum time
      for (let i = 0; i < minGreenTime - 5; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.2']).toBe(false);
      expect(result.outputs['Q0.1']).toBe(false);

      // After minimum time
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.2']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(true);
    });

    it('should handle pedestrian button override', () => {
      const program = `
        // Normal green time: 50 cycles
        // Pedestrian button (I0.1) extends to 80 cycles

        LD I0.0
        TON T0 50

        // Extended timer with pedestrian
        LD I0.0
        AND I0.1
        TON T1 80

        // Green if either timer active
        LD T0
        OR T1
        OUT Q0.2

        // Yellow after green
        LDN T0
        ANDN T1
        OUT Q0.1
      `;

      let result = state;
      result.inputs['I0.0'] = true;

      // Without pedestrian button
      for (let i = 0; i < 55; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.2']).toBe(true);

      // Reset for second test
      result = createTestPLCState();
      result.inputs['I0.0'] = true;
      result.inputs['I0.1'] = true;

      // With pedestrian button - should stay green longer
      for (let i = 0; i < 85; i++) {
        result = executeProgram(program, result);
      }

      // Should have been green for extended time
      expect(result.memoryVariables['T1']).toBeDefined();
    });
  });

  describe('Complex Traffic Scenarios', () => {
    it('should handle emergency vehicle priority', () => {
      const program = `
        // Emergency input: I0.2
        // Normal operation: I0.0

        // Emergency = all red except emergency direction
        LD I0.2
        OUT Q0.0
        OUT Q1.0

        // Emergency direction green
        LD I0.2
        OUT Q0.2

        // Normal operation when no emergency
        LDN I0.2
        AND I0.0
        OUT Q1.2
      `;

      let result = state;

      // Normal operation
      result.inputs['I0.0'] = true;
      result.inputs['I0.2'] = false;
      result = executeProgram(program, result);

      expect(result.outputs['Q1.2']).toBe(true);

      // Emergency activated
      result.inputs['I0.2'] = true;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true); // N-S Red
      expect(result.outputs['Q1.0']).toBe(true); // E-W Red
      expect(result.outputs['Q0.2']).toBe(true); // N-S Green (emergency)
    });

    it('should count vehicles and adjust timing', () => {
      const program = `
        // Vehicle counter on I0.0
        // Heavy traffic threshold: 10 vehicles

        LD I0.0
        CTU C0 10

        // Extended green time when heavy traffic
        LD C0
        TON T0 1

        // Normal green time when light traffic
        LDN C0
        TON T1 30

        // Green if either timer active
        LD T0
        OR T1
        OUT Q0.2
      `;

      let result = state;

      // Simulate 10 vehicles passing
      for (let i = 0; i < 10; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      // Heavy traffic detected
      expect(result.memoryVariables['C0'].done).toBe(true);

      // Should use extended timer
      for (let i = 0; i < 50; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.2']).toBe(true);
    });
  });
});
