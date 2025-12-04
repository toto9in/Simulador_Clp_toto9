import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';
import { PLCState } from '../../src/types/plc';

describe('Complex PLC Scenarios', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('Timer + Counter Combinations', () => {
    it('should count pulses with debounce timer', () => {
      const program = `
        // Debounce timer: 5 cycles minimum pulse width
        LD I0.0
        TON T0 5

        // Count only stable pulses
        LD T0
        CTU C0 10

        // Output when count reached
        LD C0
        OUT Q0.0

        // Reset counter
        LD I0.1
        CTR C0
      `;

      let result = state;

      // Short pulse (should not count - too quick)
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      expect(result.memoryVariables['C0'].accumulated).toBe(0);

      // Long pulse (should count)
      result.inputs['I0.0'] = true;
      for (let i = 0; i < 10; i++) {
        result = executeProgram(program, result);
      }
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      expect(result.memoryVariables['C0'].accumulated).toBe(1);
    });

    it('should implement rate limiter (max pulses per time)', () => {
      const program = `
        // Allow max 5 pulses per 100 cycles
        LD I0.0
        CTU C0 5

        // Time window: 100 cycles
        LDN T0
        TON T0 1

        // Reset counter when time expires
        LD T0
        CTR C0
        RESET T0

        // Block output if limit exceeded
        LDN C0
        AND I0.0
        OUT Q0.0

        // Alarm when limit exceeded
        LD C0
        OUT Q0.1
      `;

      let result = state;

      // Send 5 pulses quickly
      for (let i = 0; i < 5; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      // 6th pulse should be blocked
      expect(result.outputs['Q0.1']).toBe(true); // Alarm ON
      expect(result.outputs['Q0.0']).toBe(false); // Output blocked
    });

    it('should implement production batch counter with timeout', () => {
      const program = `
        // Count items (I0.0)
        // Max batch size: 10
        // Timeout if no item for 50 cycles

        LD I0.0
        CTU C0 10

        // Timeout timer - reset on each item
        LDN I0.0
        TON T0 50

        // Batch complete when count reached OR timeout
        LD C0
        OR T0
        OUT Q0.0

        // Reset on batch complete
        LD Q0.0
        CTR C0
        RESET T0
      `;

      let result = state;

      // Count 6 items slowly
      for (let i = 0; i < 6; i++) {
        result.inputs['I0.0'] = false;
        for (let j = 0; j < 10; j++) {
          result = executeProgram(program, result);
        }
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      expect(result.memoryVariables['C0'].accumulated).toBe(6);

      // Wait for timeout (no more items)
      result.inputs['I0.0'] = false;
      for (let i = 0; i < 55; i++) {
        result = executeProgram(program, result);
      }

      // Should complete batch due to timeout
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('State Machines', () => {
    it('should implement 3-state sequence (IDLE -> RUNNING -> COMPLETE)', () => {
      const program = `
        // State: M0=IDLE, M1=RUNNING, M2=COMPLETE
        // Start button: I0.0
        // Stop button: I0.1

        // IDLE state - wait for start
        LDN M1
        ANDN M2
        OUT M0

        // Start button in IDLE -> RUNNING
        LD M0
        AND I0.0
        SET M1
        RESET M0

        // RUNNING - count to 10
        LD M1
        LD I0.2
        CTU C0 10

        // RUNNING -> COMPLETE when count reached
        LD C0
        RESET M1
        SET M2

        // COMPLETE -> IDLE on reset
        LD M2
        AND I0.1
        RESET M2
        CTR C0

        // Outputs for each state
        LD M0
        OUT Q0.0  // IDLE indicator

        LD M1
        OUT Q0.1  // RUNNING indicator

        LD M2
        OUT Q0.2  // COMPLETE indicator
      `;

      let result = state;

      // Should start in IDLE
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(false);
      expect(result.outputs['Q0.2']).toBe(false);

      // Press start
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      result.inputs['I0.0'] = false;

      // Should be RUNNING
      expect(result.outputs['Q0.1']).toBe(true);

      // Count 10 pulses
      for (let i = 0; i < 10; i++) {
        result.inputs['I0.2'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.2'] = true;
        result = executeProgram(program, result);
      }

      // Should be COMPLETE
      result = executeProgram(program, result);
      expect(result.outputs['Q0.2']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(false);
    });

    it('should implement conveyor belt with multiple zones', () => {
      const program = `
        // Zone 1: I0.0 (sensor), Q0.0 (motor)
        // Zone 2: I0.1 (sensor), Q0.1 (motor)
        // Zone 3: I0.2 (sensor), Q0.2 (motor)
        // Start: I0.3, Stop: I0.4

        // Zone 1: Start motor if start button and no sensor block
        LD I0.3
        ANDN I0.0
        OUT Q0.0

        // Zone 2: Move if zone 1 has item and zone 2 clear
        LD I0.0
        ANDN I0.1
        AND Q0.0
        OUT Q0.1

        // Zone 3: Move if zone 2 has item
        LD I0.1
        AND Q0.1
        OUT Q0.2

        // Emergency stop
        LD I0.4
        RESET Q0.0
        RESET Q0.1
        RESET Q0.2
      `;

      let result = state;

      // Start system
      result.inputs['I0.3'] = true;
      result = executeProgram(program, result);

      // Zone 1 should start
      expect(result.outputs['Q0.0']).toBe(true);

      // Item enters zone 1
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      // Zone 1 stops, zone 2 starts
      expect(result.outputs['Q0.0']).toBe(false);
      expect(result.outputs['Q0.1']).toBe(true);
    });
  });

  describe('Complex Logic Patterns', () => {
    it('should implement priority encoder (highest input wins)', () => {
      const program = `
        // I0.3 has highest priority, I0.0 lowest
        // Output binary encoded value on Q0.0-Q0.1

        // Priority 3 (I0.3) -> output 11
        LD I0.3
        OUT Q0.0
        OUT Q0.1

        // Priority 2 (I0.2) -> output 10
        LDN I0.3
        AND I0.2
        OUT Q0.1

        // Priority 1 (I0.1) -> output 01
        LDN I0.3
        ANDN I0.2
        AND I0.1
        OUT Q0.0

        // Priority 0 (I0.0) -> output 00
        // (default when all others false)
      `;

      let result = state;

      // Test all priority levels
      // Priority 3
      result.inputs = { 'I0.0': true, 'I0.1': true, 'I0.2': true, 'I0.3': true };
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(true);

      // Priority 2
      result.inputs = { 'I0.0': true, 'I0.1': true, 'I0.2': true, 'I0.3': false };
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(false);
      expect(result.outputs['Q0.1']).toBe(true);

      // Priority 1
      result.inputs = { 'I0.0': true, 'I0.1': true, 'I0.2': false, 'I0.3': false };
      result = executeProgram(program, result);
      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(false);
    });

    it('should implement XOR gate (exclusive OR)', () => {
      const program = `
        // XOR: TRUE if inputs are different

        // A AND NOT B
        LD I0.0
        ANDN I0.1
        OUT M0

        // B AND NOT A
        LDN I0.0
        AND I0.1
        OUT M1

        // XOR = (A AND NOT B) OR (B AND NOT A)
        LD M0
        OR M1
        OUT Q0.0
      `;

      let result = state;

      const testCases = [
        { inputs: { 'I0.0': false, 'I0.1': false }, expected: false },
        { inputs: { 'I0.0': true, 'I0.1': false }, expected: true },
        { inputs: { 'I0.0': false, 'I0.1': true }, expected: true },
        { inputs: { 'I0.0': true, 'I0.1': true }, expected: false },
      ];

      for (const test of testCases) {
        result.inputs = test.inputs;
        result = executeProgram(program, result);
        expect(result.outputs['Q0.0']).toBe(test.expected);
      }
    });

    it('should implement majority vote (2 out of 3)', () => {
      const program = `
        // Output ON if at least 2 of 3 inputs are ON

        // I0.0 AND I0.1
        LD I0.0
        AND I0.1
        OUT M0

        // I0.0 AND I0.2
        LD I0.0
        AND I0.2
        OUT M1

        // I0.1 AND I0.2
        LD I0.1
        AND I0.2
        OUT M2

        // Any pair is true
        LD M0
        OR M1
        OR M2
        OUT Q0.0
      `;

      let result = state;

      const testCases = [
        { inputs: { 'I0.0': false, 'I0.1': false, 'I0.2': false }, expected: false },
        { inputs: { 'I0.0': true, 'I0.1': false, 'I0.2': false }, expected: false },
        { inputs: { 'I0.0': true, 'I0.1': true, 'I0.2': false }, expected: true },
        { inputs: { 'I0.0': true, 'I0.1': true, 'I0.2': true }, expected: true },
      ];

      for (const test of testCases) {
        result.inputs = test.inputs;
        result = executeProgram(program, result);
        expect(result.outputs['Q0.0']).toBe(test.expected);
      }
    });
  });

  describe('Real-World Applications', () => {
    it('should implement parking garage counter', () => {
      const program = `
        // Entry sensor: I0.0
        // Exit sensor: I0.1
        // Capacity: 10 spaces
        // Full sign: Q0.0

        // Count entries
        LD I0.0
        CTU C0 10

        // Count exits
        LD I0.1
        CTD C0

        // Full sign when capacity reached
        LD C0
        OUT Q0.0

        // Available spaces on Q0.1 (inverted)
        LDN C0
        OUT Q0.1
      `;

      let result = state;

      // 8 cars enter
      for (let i = 0; i < 8; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      expect(result.memoryVariables['C0'].accumulated).toBe(8);
      expect(result.outputs['Q0.0']).toBe(false); // Not full

      // 3 more cars enter
      for (let i = 0; i < 3; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true); // Full!

      // 2 cars exit
      for (let i = 0; i < 2; i++) {
        result.inputs['I0.1'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.1'] = true;
        result = executeProgram(program, result);
      }

      result.inputs['I0.1'] = false;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(false); // Space available
    });

    it('should implement automatic door with safety timer', () => {
      const program = `
        // Motion sensor: I0.0
        // Safety sensor: I0.1
        // Door open: Q0.0

        // Open door on motion
        LD I0.0
        SET Q0.0

        // Keep door open while motion or safety sensor active
        LD Q0.0
        ANDN I0.0
        ANDN I0.1
        TON T0 30

        // Close door after 3 seconds of no activity
        LD T0
        RESET Q0.0
        RESET T0
      `;

      let result = state;

      // Motion detected
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);

      expect(result.outputs['Q0.0']).toBe(true); // Door opens

      // Motion stops
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      // Door should stay open (timer running)
      for (let i = 0; i < 25; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.0']).toBe(true);

      // Safety sensor blocks closing
      result.inputs['I0.1'] = true;
      for (let i = 0; i < 35; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.0']).toBe(true); // Still open

      // Clear safety sensor
      result.inputs['I0.1'] = false;
      for (let i = 0; i < 35; i++) {
        result = executeProgram(program, result);
      }
      expect(result.outputs['Q0.0']).toBe(false); // Door closes
    });

    it('should implement pump alternation for wear leveling', () => {
      const program = `
        // Two pumps: Q0.0 and Q0.1
        // Demand: I0.0
        // Alternate each cycle using toggle

        // Count demand cycles
        LD I0.0
        CTU C0 1

        // Use pump 1 on even cycles, pump 2 on odd
        // Reset counter at 2 to toggle
        LD C0
        CTR C0

        // Pump selection toggle
        LD C0
        OUT M0

        // Pump 1: demand AND not toggle
        LD I0.0
        ANDN M0
        OUT Q0.0

        // Pump 2: demand AND toggle
        LD I0.0
        AND M0
        OUT Q0.1
      `;

      let result = state;

      // First demand cycle - pump 1
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      const firstPump = result.outputs['Q0.0'] ? 1 : (result.outputs['Q0.1'] ? 2 : 0);

      // Stop demand
      result.inputs['I0.0'] = false;
      result = executeProgram(program, result);

      // Second demand cycle - should use other pump
      result.inputs['I0.0'] = true;
      result = executeProgram(program, result);
      const secondPump = result.outputs['Q0.0'] ? 1 : (result.outputs['Q0.1'] ? 2 : 0);

      expect(firstPump).not.toBe(secondPump);
      expect(firstPump).toBeGreaterThan(0);
      expect(secondPump).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle rapid input changes', () => {
      const program = `
        LD I0.0
        OUT Q0.0
      `;

      let result = state;

      // Rapidly toggle input
      for (let i = 0; i < 100; i++) {
        result.inputs['I0.0'] = i % 2 === 0;
        result = executeProgram(program, result);
        expect(result.outputs['Q0.0']).toBe(result.inputs['I0.0']);
      }
    });

    it('should handle multiple timers with same preset', () => {
      const program = `
        LD I0.0
        TON T0 20

        LD I0.1
        TON T1 20

        LD I0.2
        TON T2 20

        LD T0
        OUT Q0.0

        LD T1
        OUT Q0.1

        LD T2
        OUT Q0.2
      `;

      let result = state;
      result.inputs = { 'I0.0': true, 'I0.1': true, 'I0.2': true };

      // All timers should complete at same time
      for (let i = 0; i < 21; i++) {
        result = executeProgram(program, result);
      }

      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.outputs['Q0.1']).toBe(true);
      expect(result.outputs['Q0.2']).toBe(true);
    });

    it('should handle counter overflow protection', () => {
      const program = `
        // Counter with max value protection
        LD I0.0
        ANDN C0
        CTU C0 100

        // Output accumulated value (safe)
        LD C0
        OUT Q0.0
      `;

      let result = state;

      // Count past preset
      for (let i = 0; i < 110; i++) {
        result.inputs['I0.0'] = false;
        result = executeProgram(program, result);
        result.inputs['I0.0'] = true;
        result = executeProgram(program, result);
      }

      // Should stop at preset (done bit set)
      expect(result.memoryVariables['C0'].done).toBe(true);
      expect(result.outputs['Q0.0']).toBe(true);
    });
  });
});
