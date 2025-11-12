/**
 * PLC Interpreter Service
 * Executes Instruction List (IL) programs
 * Converted from src/ilcompiler/interpreter/Interpreter.java
 */

import type { PLCState, InstructionLine } from '../types/plc';
import { ILInstruction, getVariableType } from '../types/plc';
import { MemoryService } from './memory';

/**
 * Main interpreter class for executing IL instructions
 */
export class Interpreter {
  private static accumulator: boolean | null = null;

  /**
   * Valid operators for IL language
   */
  private static readonly VALID_OPERATORS = [
    'LD',
    'LDN',
    'ST',
    'STN',
    'AND',
    'ANDN',
    'OR',
    'ORN',
    'TON',
    'TOFF',
    'CTU',
    'CTD',
  ];

  /**
   * Parse IL program text into instruction lines
   */
  static parseProgram(programText: string): InstructionLine[] {
    const lines = programText.split('\n');
    const instructions: InstructionLine[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (line === '') continue;

      // Parse the line
      const parsed = this.parseLine(line, i + 1);
      if (parsed) {
        instructions.push(parsed);
      }
    }

    return instructions;
  }

  /**
   * Parse a single line into operator and operands
   */
  private static parseLine(line: string, lineNumber: number): InstructionLine | null {
    // Remove extra spaces and tabs
    const cleaned = line.replace(/\s+/g, ' ').trim();

    // Split by space to get operator and operands
    const parts = cleaned.split(' ');
    if (parts.length === 0) return null;

    const operator = parts[0].toUpperCase();
    const operandsString = parts.slice(1).join('');

    // Split operands by comma
    const operands = operandsString ? operandsString.split(',').map((op) => op.trim()) : [];

    // Validate operator
    if (!this.isValidOperator(operator)) {
      throw new Error(`Line ${lineNumber}: Invalid operator '${operator}'`);
    }

    return {
      line: lineNumber,
      operator: operator as ILInstruction,
      operands,
      raw: line,
    };
  }

  /**
   * Check if operator is valid
   */
  private static isValidOperator(operator: string): boolean {
    return this.VALID_OPERATORS.includes(operator.toUpperCase());
  }

  /**
   * Execute entire IL program
   * Returns updated PLC state
   */
  static executeProgram(state: PLCState): PLCState {
    // Reset accumulator
    this.accumulator = null;

    // Parse program if needed
    if (state.program.length === 0 && state.programText.trim() !== '') {
      try {
        state.program = this.parseProgram(state.programText);
      } catch (error) {
        console.error('Parse error:', error);
        throw error;
      }
    }

    // Check for empty program
    if (state.program.length === 0) {
      console.warn('Empty program');
      return state;
    }

    // Create mutable copy of state
    const newState = { ...state };

    // Execute each instruction
    for (const instruction of state.program) {
      try {
        this.executeInstruction(instruction, newState);
      } catch (error) {
        console.error(`Error executing line ${instruction.line}:`, error);
        throw error;
      }
    }

    // Update accumulator in state
    newState.accumulator = this.accumulator ?? false;

    return newState;
  }

  /**
   * Execute a single instruction
   */
  private static executeInstruction(instruction: InstructionLine, state: PLCState): void {
    const { operator, operands } = instruction;

    // Validate operands
    if (operands.length === 0) {
      throw new Error(`Instruction ${operator} requires at least one operand`);
    }

    const variable = operands[0];

    // Handle different instruction types
    switch (operator) {
      case ILInstruction.LD:
        this.executeLD(variable, state);
        break;

      case ILInstruction.LDN:
        this.executeLDN(variable, state);
        break;

      case ILInstruction.ST:
        this.executeST(variable, state);
        break;

      case ILInstruction.STN:
        this.executeSTN(variable, state);
        break;

      case ILInstruction.AND:
        this.executeAND(variable, state);
        break;

      case ILInstruction.ANDN:
        this.executeANDN(variable, state);
        break;

      case ILInstruction.OR:
        this.executeOR(variable, state);
        break;

      case ILInstruction.ORN:
        this.executeORN(variable, state);
        break;

      case ILInstruction.TON:
        this.executeTON(variable, operands[1], state);
        break;

      case ILInstruction.TOFF:
        this.executeTOFF(variable, operands[1], state);
        break;

      case ILInstruction.CTU:
        this.executeCTU(variable, operands[1], state);
        break;

      case ILInstruction.CTD:
        this.executeCTD(variable, operands[1], state);
        break;

      default:
        throw new Error(`Unknown instruction: ${operator}`);
    }
  }

  /**
   * LD - Load value to accumulator
   */
  private static executeLD(variable: string, state: PLCState): void {
    const varType = getVariableType(variable);

    if (varType === 'INPUT') {
      this.accumulator = state.inputs[variable] ?? false;
    } else if (varType === 'OUTPUT') {
      this.accumulator = state.outputs[variable] ?? false;
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      this.accumulator = memVar ? memVar.currentValue : false;
    } else if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      this.accumulator = memVar ? memVar.done : false;
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }
  }

  /**
   * LDN - Load negated value to accumulator
   */
  private static executeLDN(variable: string, state: PLCState): void {
    this.executeLD(variable, state);
    this.accumulator = !this.accumulator;
  }

  /**
   * ST - Store accumulator to output/memory
   */
  private static executeST(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const varType = getVariableType(variable);

    if (varType === 'OUTPUT') {
      state.outputs[variable] = this.accumulator;
    } else if (varType === 'MEMORY' || varType === 'COUNTER' || varType === 'TIMER') {
      // Create memory variable if it doesn't exist
      if (!state.memoryVariables[variable]) {
        state.memoryVariables[variable] = MemoryService.createMemoryVariable(variable);
      }

      const memVar = state.memoryVariables[variable];

      // Handle counter increment/decrement on rising edge
      if (varType === 'COUNTER') {
        const risingEdge = !memVar.currentValue && this.accumulator;
        if (risingEdge) {
          if (memVar.counterType === 'CTU') {
            MemoryService.incrementCounter(memVar);
          } else if (memVar.counterType === 'CTD') {
            MemoryService.decrementCounter(memVar);
          }
        }
      }

      memVar.currentValue = this.accumulator;
    } else if (varType === 'INPUT') {
      throw new Error('Cannot write to inputs. ST/STN are only valid for outputs.');
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }
  }

  /**
   * STN - Store negated accumulator to output/memory
   */
  private static executeSTN(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const originalAccumulator = this.accumulator;
    this.accumulator = !this.accumulator;
    this.executeST(variable, state);
    this.accumulator = originalAccumulator; // Restore original accumulator
  }

  /**
   * AND - Logical AND with accumulator
   */
  private static executeAND(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const varType = getVariableType(variable);
    let value = false;

    if (varType === 'INPUT') {
      value = state.inputs[variable] ?? false;
    } else if (varType === 'OUTPUT') {
      value = state.outputs[variable] ?? false;
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.currentValue : false;
    } else if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.done : false;
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }

    this.accumulator = this.accumulator && value;
  }

  /**
   * ANDN - Logical AND NOT with accumulator
   */
  private static executeANDN(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const varType = getVariableType(variable);
    let value = false;

    if (varType === 'INPUT') {
      value = state.inputs[variable] ?? false;
    } else if (varType === 'OUTPUT') {
      value = state.outputs[variable] ?? false;
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.currentValue : false;
    } else if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.done : false;
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }

    this.accumulator = this.accumulator && !value;
  }

  /**
   * OR - Logical OR with accumulator
   */
  private static executeOR(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const varType = getVariableType(variable);
    let value = false;

    if (varType === 'INPUT') {
      value = state.inputs[variable] ?? false;
    } else if (varType === 'OUTPUT') {
      value = state.outputs[variable] ?? false;
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.currentValue : false;
    } else if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.done : false;
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }

    this.accumulator = this.accumulator || value;
  }

  /**
   * ORN - Logical OR NOT with accumulator
   */
  private static executeORN(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    const varType = getVariableType(variable);
    let value = false;

    if (varType === 'INPUT') {
      value = state.inputs[variable] ?? false;
    } else if (varType === 'OUTPUT') {
      value = state.outputs[variable] ?? false;
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.currentValue : false;
    } else if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      value = memVar ? memVar.done : false;
    } else {
      throw new Error(`Invalid variable: ${variable}`);
    }

    this.accumulator = this.accumulator || !value;
  }

  /**
   * TON - Timer On Delay
   * Format: TON T0, 50 (Timer T0, preset 5.0 seconds)
   */
  private static executeTON(variable: string, presetStr: string, state: PLCState): void {
    const varType = getVariableType(variable);

    if (varType !== 'TIMER') {
      throw new Error(`TON requires a timer variable (T0-Tn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Create timer if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createTimer(variable, 'TON', preset);
    } else {
      // Update existing timer
      const timer = state.memoryVariables[variable];
      timer.timerType = 'TON';
      timer.preset = preset;
    }
  }

  /**
   * TOFF - Timer Off Delay
   * Format: TOFF T0, 50 (Timer T0, preset 5.0 seconds)
   */
  private static executeTOFF(variable: string, presetStr: string, state: PLCState): void {
    const varType = getVariableType(variable);

    if (varType !== 'TIMER') {
      throw new Error(`TOFF requires a timer variable (T0-Tn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Create timer if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createTimer(variable, 'TOFF', preset);
    } else {
      // Update existing timer
      const timer = state.memoryVariables[variable];
      timer.timerType = 'TOFF';
      timer.preset = preset;
    }
  }

  /**
   * CTU - Counter Up
   * Format: CTU C0, 10 (Counter C0, count up to 10)
   */
  private static executeCTU(variable: string, presetStr: string, state: PLCState): void {
    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTU requires a counter variable (C0-Cn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Create counter if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createCounter(variable, 'CTU', preset);
    } else {
      // Update existing counter
      const counter = state.memoryVariables[variable];
      counter.counterType = 'CTU';
      counter.preset = preset;
    }
  }

  /**
   * CTD - Counter Down
   * Format: CTD C0, 10 (Counter C0, count down from 10)
   */
  private static executeCTD(variable: string, presetStr: string, state: PLCState): void {
    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTD requires a counter variable (C0-Cn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Create counter if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createCounter(variable, 'CTD', preset);
    } else {
      // Update existing counter
      const counter = state.memoryVariables[variable];
      counter.counterType = 'CTD';
      counter.preset = preset;
    }
  }

  /**
   * Get current accumulator value (for debugging)
   */
  static getAccumulator(): boolean | null {
    return this.accumulator;
  }

  /**
   * Reset accumulator (used at start of cycle)
   */
  static resetAccumulator(): void {
    this.accumulator = null;
  }
}
