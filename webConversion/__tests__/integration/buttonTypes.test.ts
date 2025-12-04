/**
 * Integration tests for button types (SWITCH, NO, NC)
 * Tests the behavior of different input button types
 */

import { createTestPLCState, executeProgram } from '../helpers/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';
import { InputType, PLCState } from '../../src/types/plc';

describe('Button Types - Integration', () => {
  let state: PLCState;

  beforeEach(() => {
    state = createTestPLCState();
  });

  describe('SWITCH Type', () => {
    it('should maintain state when toggled ON', () => {
      // Setup SWITCH type button
      state.inputsType['I0.0'] = InputType.SWITCH;

      // Toggle to ON
      state.inputs['I0.0'] = true;
      const program = 'LD I0.0\nOUT Q0.0';

      const result = executeProgram(program, state);

      // Output should be ON
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should maintain state when toggled OFF', () => {
      // Setup SWITCH type button
      state.inputsType['I0.0'] = InputType.SWITCH;

      // Toggle to OFF
      state.inputs['I0.0'] = false;
      const program = 'LD I0.0\nOUT Q0.0';

      const result = executeProgram(program, state);

      // Output should be OFF
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should work in AND logic circuit', () => {
      // Setup two SWITCH buttons
      state.inputsType['I0.0'] = InputType.SWITCH;
      state.inputsType['I0.1'] = InputType.SWITCH;

      // Both switches ON
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = true;

      const program = 'LD I0.0\nAND I0.1\nOUT Q0.0';
      const result = executeProgram(program, state);

      expect(result.outputs['Q0.0']).toBe(true);
    });
  });

  describe('NO (Normally Open) Type', () => {
    it('should be FALSE by default (not pressed)', () => {
      state.inputsType['I0.0'] = InputType.NO;
      state.inputs['I0.0'] = false; // Released state

      const program = 'LD I0.0\nOUT Q0.0';
      const result = executeProgram(program, state);

      // Output should be OFF when button not pressed
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should be TRUE when pressed', () => {
      state.inputsType['I0.0'] = InputType.NO;
      state.inputs['I0.0'] = true; // Pressed state

      const program = 'LD I0.0\nOUT Q0.0';
      const result = executeProgram(program, state);

      // Output should be ON when button pressed
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should work in START/STOP seal-in circuit', () => {
      // Setup NO buttons for START and STOP
      state.inputsType['I0.0'] = InputType.NO; // START
      state.inputsType['I0.1'] = InputType.NO; // STOP

      // Initial state: both released
      state.inputs['I0.0'] = false;
      state.inputs['I0.1'] = false;
      state.outputs['Q0.0'] = false;

      // Seal-in circuit: START OR seal ANDN STOP
      const program = `LD I0.0
OR Q0.0
ANDN I0.1
OUT Q0.0`;

      // Step 1: Press START (I0.0 = true)
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Step 2: Release START (I0.0 = false) - should stay ON (sealed)
      state.inputs['I0.0'] = false;
      state.outputs['Q0.0'] = result.outputs['Q0.0']; // Maintain output
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Step 3: Press STOP (I0.1 = true) - should turn OFF
      state.inputs['I0.1'] = true;
      state.outputs['Q0.0'] = result.outputs['Q0.0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should count button presses with CTU', () => {
      state.inputsType['I0.0'] = InputType.NO;

      // Counter program: count up to 3
      const program = `LD I0.0
CTU C0, 3
LD C0
OUT Q0.0`;

      // Press 1: count = 1
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      state.inputs['I0.0'] = false; // Release

      // Press 2: count = 2
      state.inputs['I0.0'] = true;
      result = executeProgram(program, state);
      state.inputs['I0.0'] = false;

      // Press 3: count = 3, done bit should activate
      state.inputs['I0.0'] = true;
      result = executeProgram(program, state);

      expect(result.outputs['Q0.0']).toBe(true);
      expect(result.memoryVariables['C0']?.accumulated).toBe(3);
    });
  });

  describe('NC (Normally Closed) Type', () => {
    it('should be TRUE by default (not pressed)', () => {
      state.inputsType['I0.0'] = InputType.NC;
      state.inputs['I0.0'] = true; // Released state (NC = TRUE)

      const program = 'LD I0.0\nOUT Q0.0';
      const result = executeProgram(program, state);

      // Output should be ON when NC button not pressed
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should be FALSE when pressed', () => {
      state.inputsType['I0.0'] = InputType.NC;
      state.inputs['I0.0'] = false; // Pressed state (NC = FALSE)

      const program = 'LD I0.0\nOUT Q0.0';
      const result = executeProgram(program, state);

      // Output should be OFF when NC button pressed
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should work as STOP button in motor control circuit', () => {
      // Setup: I0.0 (NO) = START, I0.1 (NC) = STOP
      state.inputsType['I0.0'] = InputType.NO;
      state.inputsType['I0.1'] = InputType.NC;

      // Initial state
      state.inputs['I0.0'] = false; // START released
      state.inputs['I0.1'] = true;  // STOP released (NC = TRUE)
      state.outputs['Q0.0'] = false;

      // Motor control circuit: START OR seal AND STOP
      const program = `LD I0.0
OR Q0.0
AND I0.1
OUT Q0.0`;

      // Step 1: Press START
      state.inputs['I0.0'] = true;
      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Step 2: Release START - motor stays ON (sealed)
      state.inputs['I0.0'] = false;
      state.outputs['Q0.0'] = result.outputs['Q0.0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Step 3: Press STOP (NC becomes FALSE)
      state.inputs['I0.1'] = false;
      state.outputs['Q0.0'] = result.outputs['Q0.0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);

      // Step 4: Release STOP (NC returns to TRUE) - motor stays OFF
      state.inputs['I0.1'] = true;
      state.outputs['Q0.0'] = result.outputs['Q0.0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should work in safety circuit with multiple NC buttons', () => {
      // Safety circuit: Two NC buttons in series
      state.inputsType['I0.0'] = InputType.NC;
      state.inputsType['I0.1'] = InputType.NC;

      // Both NC buttons not pressed (both TRUE)
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = true;

      const program = `LD I0.0
AND I0.1
OUT Q0.0`;

      let result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Press first NC button (becomes FALSE)
      state.inputs['I0.0'] = false;
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);

      // Release first, press second
      state.inputs['I0.0'] = true;
      state.inputs['I0.1'] = false;
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
    });

    it('should work with emergency stop and reset logic', () => {
      // I0.0 (NC) = E-STOP, I0.1 (NO) = RESET
      state.inputsType['I0.0'] = InputType.NC;
      state.inputsType['I0.1'] = InputType.NO;

      // Initial state
      state.inputs['I0.0'] = true;  // E-STOP not pressed
      state.inputs['I0.1'] = false; // RESET not pressed
      state.memoryVariables['M0'] = {
        id: 'M0',
        type: 'MEMORY',
        currentValue: false,
        preset: 0,
        accumulated: 0,
        enabled: false,
        done: false
      };

      const program = `LD M0
AND I0.0
OUT M0
OUT Q0.0

LD I0.1
ANDN Q0.0
OUT M0`;

      // Step 1: Press RESET to start
      state.inputs['I0.1'] = true;
      let result = executeProgram(program, state);
      expect(result.memoryVariables['M0']?.currentValue).toBe(true);

      // Step 2: Release RESET - system stays running
      state.inputs['I0.1'] = false;
      state.memoryVariables['M0'] = result.memoryVariables['M0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Step 3: Press E-STOP (NC becomes FALSE)
      state.inputs['I0.0'] = false;
      state.memoryVariables['M0'] = result.memoryVariables['M0'];
      result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });

  describe('Mixed Button Types', () => {
    it('should handle all three button types in one program', () => {
      // I0.0 (SWITCH) = Mode select
      // I0.1 (NO) = Trigger
      // I0.2 (NC) = Enable
      state.inputsType['I0.0'] = InputType.SWITCH;
      state.inputsType['I0.1'] = InputType.NO;
      state.inputsType['I0.2'] = InputType.NC;

      state.inputs['I0.0'] = true;  // Mode ON
      state.inputs['I0.1'] = true;  // Trigger pressed
      state.inputs['I0.2'] = true;  // Enable not pressed (TRUE)

      const program = `LD I0.0
AND I0.1
AND I0.2
OUT Q0.0`;

      const result = executeProgram(program, state);
      expect(result.outputs['Q0.0']).toBe(true);
    });

    it('should handle type cycling (SWITCH -> NO -> NC -> SWITCH)', () => {
      // Simulate cycling input type
      const inputKey = 'I0.0';

      // Start as SWITCH
      state.inputsType[inputKey] = InputType.SWITCH;
      state.inputs[inputKey] = true;
      let result = executeProgram('LD I0.0\nOUT Q0.0', state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Cycle to NO (should reset to false)
      state.inputsType[inputKey] = InputType.NO;
      state.inputs[inputKey] = false;
      result = executeProgram('LD I0.0\nOUT Q0.0', state);
      expect(result.outputs['Q0.0']).toBe(false);

      // Cycle to NC (should default to true)
      state.inputsType[inputKey] = InputType.NC;
      state.inputs[inputKey] = true;
      result = executeProgram('LD I0.0\nOUT Q0.0', state);
      expect(result.outputs['Q0.0']).toBe(true);

      // Cycle back to SWITCH
      state.inputsType[inputKey] = InputType.SWITCH;
      state.inputs[inputKey] = false;
      result = executeProgram('LD I0.0\nOUT Q0.0', state);
      expect(result.outputs['Q0.0']).toBe(false);
    });
  });
});
