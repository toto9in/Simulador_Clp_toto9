/**
 * Application constants
 */

export const APP_NAME = 'PLC Simulator';
export const APP_VERSION = '2.0.0-web';
export const APP_DESCRIPTION = 'Programmable Logic Controller Simulator - Web Version';

/**
 * PLC Configuration Constants
 */
export const PLC_CONFIG = {
  SCAN_CYCLE_MS: 100,        // 100ms scan cycle
  TIMER_BASE_MS: 100,        // Timer resolution (0.1s)
  NUM_INPUTS: 16,            // Total number of inputs
  NUM_OUTPUTS: 16,           // Total number of outputs
  MIN_MEMORY_VARIABLES: 32,  // Minimum memory variables
  MAX_PROGRAM_LINES: 1000,   // Maximum program lines
} as const;

/**
 * File I/O Constants
 */
export const FILE_CONFIG = {
  PROGRAM_EXTENSION: '.txt',
  DEFAULT_FILENAME: 'program.txt',
  MIME_TYPE: 'text/plain',
} as const;

/**
 * UI Constants
 */
export const UI_CONFIG = {
  DEFAULT_THEME: 1,
  DEFAULT_LANGUAGE: 'pt-BR',
  DEFAULT_SCENE: 'DEFAULT',
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  MIN_TIMER_PRESET: 1,      // Minimum timer preset (0.1s)
  MAX_TIMER_PRESET: 32767,  // Maximum timer preset (3276.7s)
  MIN_COUNTER_PRESET: 1,    // Minimum counter preset
  MAX_COUNTER_PRESET: 9999, // Maximum counter preset
  MAX_VARIABLE_NAME_LENGTH: 10,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_INSTRUCTION: 'Invalid instruction',
  INVALID_OPERAND: 'Invalid operand',
  UNDEFINED_VARIABLE: 'Undefined variable',
  INVALID_PRESET: 'Invalid preset value',
  PROGRAM_TOO_LONG: 'Program exceeds maximum length',
  FILE_LOAD_ERROR: 'Failed to load file',
  FILE_SAVE_ERROR: 'Failed to save file',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PROGRAM_LOADED: 'Program loaded successfully',
  PROGRAM_SAVED: 'Program saved successfully',
  PROGRAM_CLEARED: 'Program cleared',
  MODE_CHANGED: 'Mode changed',
} as const;
