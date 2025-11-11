/**
 * PLC Core Type Definitions
 * Converted from Java classes in src/Models/ and src/ilcompiler/
 */

/**
 * Execution mode of the PLC
 * Corresponds to ExecutionMode.java enum
 */
export enum ExecutionMode {
  IDLE = 'IDLE',       // Program not running, paused
  STOPPED = 'STOPPED', // Program stopped
  RUNNING = 'RUNNING', // Program actively executing
}

/**
 * Input type for PLC inputs
 * Corresponds to Input.java enum
 */
export enum InputType {
  SWITCH = 'SWITCH', // Toggle switch (stays in state)
  NO = 'NO',         // Normally Open (pressed=true, released=false)
  NC = 'NC',         // Normally Closed (pressed=false, released=true)
}

/**
 * Instruction List (IL) instruction types
 * All 12 supported instructions
 */
export enum ILInstruction {
  LD = 'LD',       // Load
  LDN = 'LDN',     // Load Negated
  ST = 'ST',       // Store
  STN = 'STN',     // Store Negated
  AND = 'AND',     // AND operation
  ANDN = 'ANDN',   // AND Negated
  OR = 'OR',       // OR operation
  ORN = 'ORN',     // OR Negated
  TON = 'TON',     // Timer On Delay
  TOFF = 'TOFF',   // Timer Off Delay
  CTU = 'CTU',     // Count Up
  CTD = 'CTD',     // Count Down
}

/**
 * Scene types available in the simulator
 * Corresponds to ScenesEnum.java
 */
export enum SceneType {
  DEFAULT = 'DEFAULT',                   // Default I/O scene (8 inputs + 8 outputs)
  BATCH_SIMULATION = 'BATCH_SIMULATION', // Tank filling simulation
}

/**
 * Color themes
 * Corresponds to Colors.java
 */
export enum Theme {
  THEME_1 = 1,
  THEME_2 = 2,
  THEME_3 = 3,
  THEME_4 = 4,
}

/**
 * Supported languages
 * Corresponds to Language.java
 */
export enum Language {
  PT_BR = 'pt-BR', // Portuguese (Brazil)
  EN = 'en',       // English
  JA = 'ja',       // Japanese
  DE = 'de',       // German
}

/**
 * Represents a single instruction line in the IL program
 */
export interface InstructionLine {
  line: number;
  operator: ILInstruction;
  operands: string[];
  raw: string; // Original line text
}

/**
 * Global PLC state
 * Corresponds to HomePageModel.java singleton
 */
export interface PLCState {
  // Inputs (I0.0 to I1.7 = 16 inputs)
  inputs: Record<string, boolean>;
  inputsType: Record<string, InputType>;

  // Outputs (Q0.0 to Q1.7 = 16 outputs)
  outputs: Record<string, boolean>;

  // Memory variables (M, T, C)
  memoryVariables: Record<string, MemoryVariable>;

  // Program
  program: InstructionLine[];
  programText: string;

  // Execution state
  mode: ExecutionMode;
  accumulator: boolean; // Current accumulator value for logic operations

  // UI preferences
  theme: Theme;
  language: Language;
  currentScene: SceneType;

  // Scan cycle info
  cycleTime: number; // Last cycle time in ms
  scanCount: number; // Total scan cycles executed
}

/**
 * Memory variable (Timer or Counter)
 * Corresponds to MemoryVariable.java
 */
export interface MemoryVariable {
  id: string;                // Variable identifier (e.g., "T0", "C0", "M0")
  type: 'TIMER' | 'COUNTER' | 'MEMORY'; // Variable type
  currentValue: boolean;     // Current output state
  preset: number;            // Preset value (for timers: in 100ms units, for counters: count limit)
  accumulated: number;       // Accumulated value (elapsed time or count)
  enabled: boolean;          // Is currently enabled/running
  done: boolean;             // Has reached preset value

  // Timer-specific
  timerType?: 'TON' | 'TOFF'; // Timer type (on-delay or off-delay)
  startTime?: number;         // When timer started (timestamp)

  // Counter-specific
  counterType?: 'CTU' | 'CTD'; // Counter type (up or down)
}

/**
 * Constants for PLC configuration
 */
export const PLCConstants = {
  // I/O Limits
  NUM_INPUTS: 16,
  NUM_OUTPUTS: 16,
  MIN_MEMORY_VARIABLES: 32,

  // Scan cycle
  SCAN_CYCLE_MS: 100, // 100ms scan cycle
  TIMER_BASE_MS: 100, // Timer base time (0.1s)

  // Input/Output identifiers
  INPUT_PREFIX: 'I',
  OUTPUT_PREFIX: 'Q',
  MEMORY_PREFIX: 'M',
  TIMER_PREFIX: 'T',
  COUNTER_PREFIX: 'C',

  // Input ranges
  INPUTS: Array.from({ length: 16 }, (_, i) => {
    const byte = Math.floor(i / 8);
    const bit = i % 8;
    return `I${byte}.${bit}`;
  }),

  // Output ranges
  OUTPUTS: Array.from({ length: 16 }, (_, i) => {
    const byte = Math.floor(i / 8);
    const bit = i % 8;
    return `Q${byte}.${bit}`;
  }),
} as const;

/**
 * Type guard to check if a string is a valid input identifier
 */
export function isValidInput(id: string): boolean {
  return PLCConstants.INPUTS.includes(id);
}

/**
 * Type guard to check if a string is a valid output identifier
 */
export function isValidOutput(id: string): boolean {
  return PLCConstants.OUTPUTS.includes(id);
}

/**
 * Type guard to check if a string is a valid memory variable identifier
 */
export function isValidMemoryVariable(id: string): boolean {
  return /^[MTC]\d+$/.test(id);
}

/**
 * Parse a variable identifier to determine its type
 */
export function getVariableType(id: string): 'INPUT' | 'OUTPUT' | 'MEMORY' | 'TIMER' | 'COUNTER' | 'UNKNOWN' {
  if (isValidInput(id)) return 'INPUT';
  if (isValidOutput(id)) return 'OUTPUT';
  if (id.startsWith(PLCConstants.MEMORY_PREFIX)) return 'MEMORY';
  if (id.startsWith(PLCConstants.TIMER_PREFIX)) return 'TIMER';
  if (id.startsWith(PLCConstants.COUNTER_PREFIX)) return 'COUNTER';
  return 'UNKNOWN';
}

/**
 * Create initial PLC state with default values
 */
export function createInitialPLCState(): PLCState {
  // Initialize inputs (all false, all SWITCH type)
  const inputs: Record<string, boolean> = {};
  const inputsType: Record<string, InputType> = {};
  PLCConstants.INPUTS.forEach((input) => {
    inputs[input] = false;
    inputsType[input] = InputType.SWITCH;
  });

  // Initialize outputs (all false)
  const outputs: Record<string, boolean> = {};
  PLCConstants.OUTPUTS.forEach((output) => {
    outputs[output] = false;
  });

  return {
    inputs,
    inputsType,
    outputs,
    memoryVariables: {},
    program: [],
    programText: '',
    mode: ExecutionMode.IDLE,
    accumulator: false,
    theme: Theme.THEME_1,
    language: Language.PT_BR,
    currentScene: SceneType.DEFAULT,
    cycleTime: 0,
    scanCount: 0,
  };
}
