import { PLCState, ExecutionMode, Theme, Language, SceneType, InputType } from '../../src/types/plc';
import { Interpreter } from '../../src/services/interpreter';
import { MemoryService } from '../../src/services/memory';

/**
 * Creates a minimal PLCState for testing
 */
export function createTestPLCState(overrides: Partial<PLCState> = {}): PLCState {
  const defaultInputsType: Record<string, InputType> = {};
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      defaultInputsType[`I${i}.${j}`] = 'TOGGLE';
    }
  }

  return {
    inputs: {
      'I0.0': false,
      'I0.1': false,
      'I0.2': false,
      'I0.3': false,
      'I0.4': false,
      'I0.5': false,
      'I0.6': false,
      'I0.7': false,
      'I1.0': false,
      'I1.1': false,
      'I1.2': false,
      'I1.3': false,
      'I1.4': false,
      'I1.5': false,
      'I1.6': false,
      'I1.7': false,
    },
    inputsType: defaultInputsType,
    outputs: {
      'Q0.0': false,
      'Q0.1': false,
      'Q0.2': false,
      'Q0.3': false,
      'Q0.4': false,
      'Q0.5': false,
      'Q0.6': false,
      'Q0.7': false,
      'Q1.0': false,
      'Q1.1': false,
      'Q1.2': false,
      'Q1.3': false,
      'Q1.4': false,
      'Q1.5': false,
      'Q1.6': false,
      'Q1.7': false,
    },
    memoryVariables: {},
    program: [],
    programText: '',
    mode: 'IDLE' as ExecutionMode,
    accumulator: false,
    theme: 'dark' as Theme,
    language: 'en' as Language,
    currentScene: 'default' as SceneType,
    cycleTime: 0,
    scanCount: 0,
    ...overrides,
  };
}

/**
 * Executes a program and returns the updated state
 * @param programText - The IL program as a string
 * @param state - The current PLC state
 * @returns Updated PLC state after execution
 */
export function executeProgram(programText: string, state: PLCState): PLCState {
  // Set the program text in the state
  const stateWithProgram = {
    ...state,
    programText,
    program: [], // Will be parsed by executeProgram
  };

  // Execute the program
  const result = Interpreter.executeProgram(stateWithProgram);

  // Update timers (simulate scan cycle)
  MemoryService.updateAllTimers(result.memoryVariables);

  return result;
}
