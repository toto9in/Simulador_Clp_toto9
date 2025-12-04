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
  private static DEBUG_MODE = true; // Set to true for detailed logging
  private static instructionCount = 0;

  /**
   * Valid operators for IL language
   */
  private static readonly VALID_OPERATORS = [
    'LD',    // Load
    'LDN',   // Load NOT
    'ST',    // Store
    'STN',   // Store NOT
    'AND',   // AND
    'ANDN',  // AND NOT
    'OR',    // OR
    'ORN',   // OR NOT
    'NOT',   // Negate accumulator
    'OUT',   // Output (alias for ST)
    'SET',   // Set/Latch output ON
    'S',     // Set (alias)
    'RESET', // Reset output OFF
    'R',     // Reset (alias)
    'TON',   // Timer On-Delay
    'TOFF',  // Timer Off-Delay
    'CTU',   // Counter Up
    'CTD',   // Counter Down
    'CTR',   // Counter Reset
    'CTL',   // Counter Load
    'RST',   // Reset (for timers/counters/memory)
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

      // Skip comment lines (starting with //)
      if (line.startsWith('//')) continue;

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
    // Remove inline comments (everything after //)
    const commentIndex = line.indexOf('//');
    const codeOnly = commentIndex >= 0 ? line.substring(0, commentIndex) : line;

    // Remove extra spaces and tabs
    const cleaned = codeOnly.replace(/\s+/g, ' ').trim();

    // If line becomes empty after removing comments, skip it
    if (cleaned === '') return null;

    // Split by space to get operator and operands
    const parts = cleaned.split(' ');
    if (parts.length === 0) return null;

    const operator = parts[0].toUpperCase();

    // Get operands from remaining parts
    // Support both comma-separated (TON T0,50) and space-separated (TON T0 50)
    const operandsPart = parts.slice(1).join(' '); // Join with space

    // Split by comma if present, otherwise split by space
    const operands = operandsPart.includes(',')
      ? operandsPart.split(',').map((op) => op.trim())
      : operandsPart.split(' ').filter((op) => op.length > 0);

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

    // Reset instruction count for new scan cycle
    if (state.scanCount === 0 || state.scanCount % 10 === 0) {
      this.instructionCount = 0;
      if (this.DEBUG_MODE && state.scanCount === 0) {
        console.log('=== STARTING PROGRAM EXECUTION ===');
      }
    }

    // Parse program if needed
    if (state.program.length === 0 && state.programText.trim() !== '') {
      try {
        state.program = this.parseProgram(state.programText);
        if (this.DEBUG_MODE) {
          console.log('Program parsed:', state.program.length, 'instructions');
        }
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

    // Create deep copy of state to avoid mutations
    const newState = {
      ...state,
      inputs: { ...state.inputs },
      outputs: { ...state.outputs },
      // Deep clone memory variables to prevent state mutation
      memoryVariables: Object.keys(state.memoryVariables).reduce((acc, key) => {
        acc[key] = { ...state.memoryVariables[key] };
        return acc;
      }, {} as Record<string, any>),
    };

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

    // Some instructions don't require operands (e.g., NOT)
    const noOperandInstructions = ['NOT'];
    if (!noOperandInstructions.includes(operator) && operands.length === 0) {
      throw new Error(`Instruction ${operator} requires at least one operand`);
    }

    const variable = operands[0];

    // DEBUG: Log instruction execution
    if (this.DEBUG_MODE && this.instructionCount < 50) {
      const accBefore = this.accumulator;
      console.log(`[Line ${instruction.line}] ${operator} ${operands.join(',')} | ACC before: ${accBefore}`);
      this.instructionCount++;

      // Log after execution in a delayed way
      setTimeout(() => {
        if (operator === 'ST' || operator === 'STN') {
          const varType = getVariableType(variable);
          if (varType === 'OUTPUT') {
            console.log(`  → Output ${variable} = ${state.outputs[variable]}`);
          }
        }
      }, 0);
    }

    // Handle different instruction types
    switch (operator) {
      case ILInstruction.LD:
        this.executeLD(variable, state);
        break;

      case ILInstruction.LDN:
        this.executeLDN(variable, state);
        break;

      case ILInstruction.ST:
      case ILInstruction.OUT: // OUT is an alias for ST
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

      case ILInstruction.NOT:
        this.executeNOT();
        break;

      case ILInstruction.SET:
      case ILInstruction.S:
        this.executeSET(variable, state);
        break;

      case ILInstruction.RESET:
      case ILInstruction.R:
        this.executeRESET(variable, state);
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

      case ILInstruction.CTR:
        this.executeCTR(variable, state);
        break;

      case ILInstruction.CTL:
        this.executeCTL(variable, operands[1], state);
        break;

      case ILInstruction.RST:
        this.executeRST(variable, state);
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
   * NOT - Negate accumulator
   */
  private static executeNOT(): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    this.accumulator = !this.accumulator;
  }

  /**
   * SET - Set/Latch output ON
   * When accumulator is TRUE, sets the output to TRUE
   * Output stays TRUE even after accumulator becomes FALSE (latching behavior)
   */
  private static executeSET(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    // Only set the output if accumulator is TRUE
    if (this.accumulator) {
      const varType = getVariableType(variable);

      if (varType === 'OUTPUT') {
        state.outputs[variable] = true;
      } else if (varType === 'MEMORY') {
        // Create memory variable if it doesn't exist
        if (!state.memoryVariables[variable]) {
          state.memoryVariables[variable] = MemoryService.createMemoryVariable(variable);
        }
        state.memoryVariables[variable].currentValue = true;
      } else {
        throw new Error(`SET can only be used with outputs or memory bits, got: ${variable}`);
      }
    }
  }

  /**
   * RESET - Reset output OFF
   * When accumulator is TRUE, resets the output to FALSE
   */
  private static executeRESET(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN first.');
    }

    // Only reset the output if accumulator is TRUE
    if (this.accumulator) {
      const varType = getVariableType(variable);

      if (varType === 'OUTPUT') {
        state.outputs[variable] = false;
      } else if (varType === 'MEMORY') {
        // Create memory variable if it doesn't exist
        if (!state.memoryVariables[variable]) {
          state.memoryVariables[variable] = MemoryService.createMemoryVariable(variable);
        }
        state.memoryVariables[variable].currentValue = false;
      } else {
        throw new Error(`RESET can only be used with outputs or memory bits, got: ${variable}`);
      }
    }
  }

  /**
   * TON - Timer On Delay
   * Format: TON T0, 50 (Timer T0, preset 5.0 seconds)
   * Uses accumulator to enable/disable the timer (matches Java behavior)
   */
  private static executeTON(variable: string, presetStr: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before TON.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'TIMER') {
      throw new Error(`TON requires a timer variable (T0-Tn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Preset is stored in units of TIMER_BASE_MS (100ms)
    // Create timer if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createTimer(variable, 'TON', preset);
    } else {
      // Update existing timer
      const timer = state.memoryVariables[variable];
      timer.timerType = 'TON';
      timer.preset = preset;
    }

    // Set timer enable from accumulator (Java does this in HomePageController)
    state.memoryVariables[variable].currentValue = this.accumulator;

    // DEBUG: Log timer enable
    if (this.DEBUG_MODE && this.instructionCount < 50) {
      console.log(`  → Timer ${variable} (TON) enabled: ${this.accumulator}, preset: ${preset} (${preset * 100}ms)`);
    }
  }

  /**
   * TOFF - Timer Off Delay
   * Format: TOFF T0, 50 (Timer T0, preset 5.0 seconds)
   * Uses accumulator to enable/disable the timer (matches Java behavior)
   */
  private static executeTOFF(variable: string, presetStr: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before TOFF.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'TIMER') {
      throw new Error(`TOFF requires a timer variable (T0-Tn), got: ${variable}`);
    }

    const preset = parseInt(presetStr, 10);
    if (isNaN(preset) || preset <= 0) {
      throw new Error(`Invalid preset value: ${presetStr}`);
    }

    // Preset is stored in units of TIMER_BASE_MS (100ms)
    // Create timer if it doesn't exist
    if (!state.memoryVariables[variable]) {
      state.memoryVariables[variable] = MemoryService.createTimer(variable, 'TOFF', preset);
    } else {
      // Update existing timer
      const timer = state.memoryVariables[variable];
      timer.timerType = 'TOFF';
      timer.preset = preset;
    }

    // Set timer enable from accumulator (Java does this in HomePageController)
    state.memoryVariables[variable].currentValue = this.accumulator;

    // DEBUG: Log timer enable
    if (this.DEBUG_MODE && this.instructionCount < 50) {
      console.log(`  → Timer ${variable} (TOFF) enabled: ${this.accumulator}, preset: ${preset} (${preset * 100}ms)`);
    }
  }

  /**
   * CTU - Counter Up
   * Format: CTU C0, 10 (Counter C0, count up to 10)
   * OR: CTU C0 (uses existing preset from CTL)
   * Counts on rising edge of accumulator (false -> true transition)
   */
  private static executeCTU(variable: string, presetStr: string | undefined, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before CTU.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTU requires a counter variable (C0-Cn), got: ${variable}`);
    }

    // Parse preset if provided
    let preset: number | undefined;
    if (presetStr !== undefined) {
      preset = parseInt(presetStr, 10);
      if (isNaN(preset) || preset <= 0) {
        throw new Error(`Invalid preset value: ${presetStr}`);
      }
    }

    // Create counter if it doesn't exist
    if (!state.memoryVariables[variable]) {
      if (preset === undefined) {
        throw new Error(`CTU ${variable}: preset value required when counter doesn't exist. Use CTL first or provide preset (e.g., CTU ${variable} 10)`);
      }
      state.memoryVariables[variable] = MemoryService.createCounter(variable, 'CTU', preset);
    } else {
      // Update existing counter
      const counter = state.memoryVariables[variable];
      counter.counterType = 'CTU';
      // Update preset only if provided, otherwise keep existing
      if (preset !== undefined) {
        counter.preset = preset;
      }
      // Initialize previousEnable if not set
      if (counter.previousEnable === undefined) {
        counter.previousEnable = false;
      }
    }

    const counter = state.memoryVariables[variable];

    // Detect rising edge (previousEnable was false, accumulator is now true)
    const risingEdge = !counter.previousEnable && this.accumulator;

    // DEBUG: Log counter state
    if (this.DEBUG_MODE && this.instructionCount < 50) {
      console.log(`  → Counter ${variable}: prevEnable=${counter.previousEnable}, accum=${this.accumulator}, risingEdge=${risingEdge}`);
      console.log(`  → Before: accumulated=${counter.accumulated}, preset=${counter.preset}, done=${counter.done}`);
    }

    if (risingEdge) {
      // Increment counter on rising edge
      MemoryService.incrementCounter(counter);
      if (this.DEBUG_MODE && this.instructionCount < 50) {
        console.log(`  → COUNTED! After: accumulated=${counter.accumulated}, done=${counter.done}`);
      }
    }

    // Update previousEnable for next scan
    counter.previousEnable = this.accumulator;

    // Update currentValue to reflect done bit (for LD C0)
    counter.currentValue = counter.done;

    // Update accumulator to counter done bit
    this.accumulator = counter.done;
  }

  /**
   * CTD - Counter Down
   * Format: CTD C0, 10 (Counter C0, count down from 10)
   * OR: CTD C0 (uses existing preset from CTL)
   * Counts on rising edge of accumulator (false -> true transition)
   */
  private static executeCTD(variable: string, presetStr: string | undefined, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before CTD.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTD requires a counter variable (C0-Cn), got: ${variable}`);
    }

    // Parse preset if provided
    let preset: number | undefined;
    if (presetStr !== undefined) {
      preset = parseInt(presetStr, 10);
      if (isNaN(preset) || preset <= 0) {
        throw new Error(`Invalid preset value: ${presetStr}`);
      }
    }

    // Create counter if it doesn't exist
    if (!state.memoryVariables[variable]) {
      if (preset === undefined) {
        throw new Error(`CTD ${variable}: preset value required when counter doesn't exist. Use CTL first or provide preset (e.g., CTD ${variable} 10)`);
      }
      state.memoryVariables[variable] = MemoryService.createCounter(variable, 'CTD', preset);
      state.memoryVariables[variable].accumulated = preset; // CTD starts at preset
    } else {
      // Update existing counter
      const counter = state.memoryVariables[variable];
      counter.counterType = 'CTD';
      // Update preset only if provided, otherwise keep existing
      if (preset !== undefined) {
        counter.preset = preset;
      }
      // Initialize previousEnable if not set
      if (counter.previousEnable === undefined) {
        counter.previousEnable = false;
      }
    }

    const counter = state.memoryVariables[variable];

    // Detect rising edge (previousEnable was false, accumulator is now true)
    const risingEdge = !counter.previousEnable && this.accumulator;

    if (risingEdge) {
      // Decrement counter on rising edge
      MemoryService.decrementCounter(counter);
    }

    // Update previousEnable for next scan
    counter.previousEnable = this.accumulator;

    // Update currentValue to reflect done bit (for LD C0)
    counter.currentValue = counter.done;

    // Update accumulator to counter done bit
    this.accumulator = counter.done;
  }

  /**
   * CTR - Counter Reset
   * Format: CTR C0 (Resets counter C0)
   * Resets counter accumulated value to 0 (CTU) or preset (CTD)
   * Only resets when accumulator is TRUE
   */
  private static executeCTR(variable: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before CTR.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTR requires a counter variable (C0-Cn), got: ${variable}`);
    }

    const counter = state.memoryVariables[variable];
    if (counter) {
      // DEBUG: Log reset condition
      if (this.DEBUG_MODE && this.instructionCount < 50) {
        console.log(`  → CTR ${variable}: accumulator=${this.accumulator}, willReset=${this.accumulator}`);
      }

      // Only reset if accumulator is TRUE (reset input is active)
      if (this.accumulator) {
        MemoryService.resetCounter(counter);
        counter.previousEnable = false; // Reset edge detection
        if (this.DEBUG_MODE && this.instructionCount < 50) {
          console.log(`  → Counter RESET! accumulated=${counter.accumulated}`);
        }
      }
    }
  }

  /**
   * CTL - Counter Load
   * Format: CTL C0, 10 (Loads counter C0 with value 10)
   * Sets the counter accumulated value to the specified value
   * Only loads when accumulator is TRUE
   */
  private static executeCTL(variable: string, valueStr: string, state: PLCState): void {
    if (this.accumulator === null) {
      throw new Error('Accumulator is empty. Use LD or LDN before CTL.');
    }

    const varType = getVariableType(variable);

    if (varType !== 'COUNTER') {
      throw new Error(`CTL requires a counter variable (C0-Cn), got: ${variable}`);
    }

    const value = parseInt(valueStr, 10);
    if (isNaN(value) || value < 0) {
      throw new Error(`Invalid load value: ${valueStr}`);
    }

    // Create counter if it doesn't exist
    if (!state.memoryVariables[variable]) {
      // Create with 'CTD' type and use value as both preset and accumulated
      state.memoryVariables[variable] = MemoryService.createCounter(variable, 'CTD', value);
      state.memoryVariables[variable].accumulated = value;
      state.memoryVariables[variable].previousEnable = false;
    }

    // Only load if accumulator is TRUE (load button is pressed)
    if (this.accumulator) {
      const counter = state.memoryVariables[variable];
      counter.accumulated = value;
      counter.preset = value; // Also set preset for CTD to count down from
      counter.done = counter.counterType === 'CTU'
        ? counter.accumulated >= counter.preset
        : counter.accumulated <= 0;

      // DEBUG: Log load operation
      if (this.DEBUG_MODE && this.instructionCount < 50) {
        console.log(`  → CTL ${variable}: loaded accumulated=${counter.accumulated}, preset=${counter.preset}`);
      }
    }
  }

  /**
   * RST - Reset
   * Format: RST T0 or RST C0 or RST M0
   * Resets a timer, counter, or memory bit
   */
  private static executeRST(variable: string, state: PLCState): void {
    // RST only executes when accumulator is TRUE (like SET instruction)
    // This prevents timers from being reset every scan cycle
    if (this.accumulator !== true) {
      return; // Skip reset if accumulator is not true
    }

    const varType = getVariableType(variable);

    if (varType === 'TIMER' || varType === 'COUNTER') {
      const memVar = state.memoryVariables[variable];
      if (memVar) {
        memVar.accumulated = 0;
        memVar.done = false;
        memVar.enabled = false;
        memVar.currentValue = false; // Reset currentValue to prevent re-enabling
        if (memVar.type === 'TIMER') {
          memVar.startTime = undefined;
        }
      }
    } else if (varType === 'MEMORY') {
      const memVar = state.memoryVariables[variable];
      if (memVar) {
        memVar.currentValue = false;
      }
    } else if (varType === 'OUTPUT') {
      state.outputs[variable] = false;
    } else {
      throw new Error(`RST can only reset timers, counters, memory bits, or outputs, got: ${variable}`);
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
