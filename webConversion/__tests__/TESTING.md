# PLC Simulator - Test Documentation

This document provides a comprehensive overview of all tests in the PLC Simulator project.

## Table of Contents

1. [Test Categories](#test-categories)
2. [Running Tests](#running-tests)
3. [Test Coverage Overview](#test-coverage-overview)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [End-to-End Tests](#end-to-end-tests)
7. [Test Helpers](#test-helpers)

---

## Test Categories

The PLC Simulator has three main test categories:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how multiple components work together
- **End-to-End (E2E) Tests**: Test the complete application in a browser

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

---

## Test Coverage Overview

### Total Test Count
- **Unit Tests**: 150+ tests
- **Integration Tests**: 80+ tests
- **E2E Tests**: 87 tests (23 instructions + 16 batch manual + 17 batch auto + 31 traffic lights)
- **Total**: 317+ tests

### Coverage by Component

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| Interpreter (Basic) | 40+ | - | 4 |
| Interpreter (Timers) | 30+ | 12 | 3 |
| Interpreter (Counters) | 20+ | 8 | 4 |
| Interpreter (Advanced) | 30+ | - | - |
| Memory Service | 15+ | - | - |
| Examples | - | 30+ | - |
| Instructions (All) | - | - | 23 |
| Batch Manual | - | - | 16 |
| Batch Fully Auto | - | - | 17 |
| Traffic Lights | - | 30+ | 31 |
| Complex Scenarios | - | 30+ | - |

---

## Unit Tests

Unit tests are located in `__tests__/unit/` and test individual components in isolation.

### Interpreter Basic Tests (`interpreter.basic.test.ts`)

Tests for basic PLC instructions:

#### LD (Load) Instruction
- Load input values to accumulator
- Handle true and false inputs
- Work with different input addresses

#### LDN (Load Negated) Instruction
- Load negated input values
- Invert true to false and vice versa

#### ST (Store) Instruction
- Store accumulator value to outputs
- Transfer boolean states correctly

#### STN (Store Negated) Instruction
- Store negated accumulator to outputs
- Properly invert values when storing

#### AND Instruction
- Implement logical AND operation
- Combine multiple conditions
- Support AND chains

#### ANDN (AND Negated) Instruction
- AND with negated input
- Combine positive and negative logic

#### OR Instruction
- Implement logical OR operation
- Support multiple OR conditions

#### ORN (OR Negated) Instruction
- OR with negated input
- Mix positive and negative conditions

#### NOT Instruction
- Invert accumulator value
- Toggle boolean states

#### SET/RESET Instructions
- SET: Latch outputs ON
- RESET: Force outputs OFF
- Maintain state between scans

### Interpreter Timer Tests (`interpreter.timers.test.ts`)

Tests for timer operations:

#### TON (Timer On-Delay)
- Delay turning ON after input activation
- Reset when input goes OFF
- Maintain done state while active
- Handle preset values correctly

#### TOFF (Timer Off-Delay)
- Keep output ON after input deactivation
- Delay turning OFF
- Cancel delay if input reactivates
- Turn ON immediately when activated

#### TP (Timer Pulse)
- Generate fixed-duration pulses
- One-shot operation
- Reset after pulse completes

### Interpreter Counter Tests (`interpreter.counters.test.ts`)

Tests for counter operations:

#### CTU (Counter Up)
- Count rising edges
- Activate output at preset value
- Reset to zero
- Prevent multiple counts on same edge

#### CTD (Counter Down)
- Count down from preset
- Activate output at zero
- Load preset value
- Handle edge detection

#### CTL (Counter Load)
- Load preset values into counters
- Initialize counter states

#### CTR (Counter Reset)
- Reset counters to zero
- Clear done flags

### Interpreter Advanced Tests (`interpreter.advanced.test.ts`)

Tests for advanced scenarios:

#### Complex Logic Combinations
- Nested AND/OR operations
- Mixed positive/negative logic
- Multi-level conditions

#### Edge Cases
- Empty programs
- Invalid instructions
- Boundary conditions
- Error handling

---

## Integration Tests

Integration tests are located in `__tests__/integration/` and test how components work together.

### Examples Integration Tests (`examples.test.ts`)

Tests all example programs to ensure they work correctly:

#### 01 - Basic Output
- Simple input-to-output mapping
- ON/OFF state handling

#### 02 - AND Logic
- Multiple input AND gate
- Require all inputs ON

#### 03 - OR Logic
- Multiple input OR gate
- Any input activates output

#### 04 - NOT Logic
- Signal inversion
- Negated logic

#### 05 - SET/RESET
- Latching behavior
- Memory retention

#### 06 - Timer On-Delay (TON)
- 5-second delay before activation
- Timer reset on input OFF
- Maintained state while ON

#### 07 - Timer Off-Delay (TOFF)
- Keep ON after input OFF
- Delay before turning OFF
- Cancel delay on re-activation

#### 08 - Blinker (Oscillator)
- Self-sustaining oscillation
- Timer feedback loop
- Continuous blinking

#### 09 - Counter Up (CTU)
- Count button presses
- Activate at preset
- Reset functionality

#### 10 - Counter Down (CTD)
- Count down from preset
- Activate at zero
- Load and count operations

### Traffic Lights Integration Tests (`trafficLights.test.ts`)

Comprehensive tests for traffic light scenarios:

#### 11 - Single Traffic Light
- Red → Green → Yellow cycle
- Proper timing sequences
- Only one light ON at a time

#### 13 - Traffic Light Crossroad (2 Lights)
- Two independent traffic lights
- North-South and East-West directions
- Prevent both directions green simultaneously

#### 14 - Safe Traffic Light Crossroad
- Collision prevention logic
- State machine implementation
- All-red safety period during transitions

#### Traffic Light Timing and Sequences
- Minimum green time enforcement
- Pedestrian button override
- Extended green time for pedestrians

#### Complex Traffic Scenarios
- Emergency vehicle priority
- All-red except emergency direction
- Vehicle counting and adaptive timing
- Heavy traffic detection

### Complex Scenarios Tests (`complexScenarios.test.ts`)

Advanced real-world PLC applications:

#### Timer + Counter Combinations
- **Debounce Circuit**: Filter noisy inputs with timer + counter
- **Rate Limiter**: Enforce minimum time between events
- **Batch Counter with Timeout**: Count items with timeout reset

#### State Machines
- **3-State Sequence**: Controlled state transitions
- **Conveyor Belt Controller**: Motor control with safety interlocks

#### Complex Logic Patterns
- **XOR Gate**: Exclusive OR logic
- **Priority Encoder**: Multi-level priority system
- **Majority Vote**: 3-input voting logic

#### Real-World Applications
- **Parking Garage Controller**: Entry/exit with capacity limits
- **Automatic Door**: Motion sensor with safety timers
- **Pump Alternation**: Dual pump wear leveling

#### Edge Cases and Boundaries
- Multiple simultaneous timer expirations
- Counter overflow handling
- Timer cancellation mid-cycle
- Zero preset values
- Maximum preset values

---

## End-to-End Tests

E2E tests are located in `__tests__/e2e/` and use Playwright to test the complete application.

### Instructions E2E Tests (`instructions.spec.ts`)

Comprehensive browser-based tests for all PLC instructions (23 tests):

#### Basic Load and Store Instructions (4 tests)
- **LD** - Load input to accumulator
- **LDN** - Load negated input to accumulator
- **ST** - Store accumulator to output
- **STN** - Store negated accumulator to output

#### Logical AND Instructions (3 tests)
- **AND** - Logical AND operation (2 inputs)
- **ANDN** - AND with negated input
- **AND Chain** - Multiple AND operations (3 inputs)

#### Logical OR Instructions (2 tests)
- **OR** - Logical OR operation
- **ORN** - OR with negated input

#### Timer Instructions (3 tests)
- **TON** - Timer On-Delay with 2 second preset
- **TOFF** - Timer Off-Delay with 2 second preset
- **TON Reset** - Timer reset during delay period

#### Counter Instructions (4 tests)
- **CTU** - Counter Up with preset of 3
- **CTD** - Counter Down from preset of 3
- **CTR** - Counter Reset functionality
- **CTL** - Counter Load with preset value

#### Combined Logic (2 tests)
- Complex AND/OR combinations
- Mix of LD, AND, OR operations

#### Edge Cases and Error Handling (3 tests)
- Multiple timers in same program
- Multiple counters in same program
- Timer with counter combination

#### Performance and Stress Tests (2 tests)
- Rapid input toggling (10 toggles)
- Complex program responsiveness

Each test:
1. Loads a specific IL program
2. Executes the program in RUN mode
3. Toggles inputs as needed
4. Verifies correct output states
5. Tests both positive and negative cases

### Batch Simulation E2E Tests (`batch-simulation.spec.ts`)

Comprehensive browser-based tests for batch tank simulation (16 tests):

#### Batch Scene Setup (3 tests)
- Switch to Batch scene
- Display tank visualization
- Show control buttons (START and STOP)

#### Batch Example Loading (1 test)
- Load "Batch Process - Automatic" example

#### Fill Cycle (2 tests)
- Fill tank when START pressed
- Stop filling when tank reaches 100%

#### Mixer Operation (1 test)
- Start mixer when tank is full

#### Drain Cycle (1 test)
- Drain tank when STOP pressed

#### Status LEDs (3 tests)
- Show RUN LED when system operating
- Show IDLE LED when system stopped
- Show FULL LED when tank at 100%

#### Complete Batch Cycle (1 test)
- Execute full cycle: fill → mix → drain

#### Emergency Stop (1 test)
- Stop filling immediately when STOP pressed

#### Sensor Behavior (2 tests)
- Activate HI-LEVEL sensor at 100%
- Deactivate LO-LEVEL sensor when empty

Each batch test verifies:
- Proper I/O mapping (I0.0=START, I0.1=STOP, I1.0=HI-LEVEL, I1.1=LO-LEVEL)
- Output control (Q0.1=PUMP1, Q0.2=MIXER, Q0.3=PUMP3)
- LED indicators (Q1.0=RUN, Q1.1=IDLE, Q1.2=FULL)
- Tank level sensor behavior
- Complete automation cycle

### Batch Fully Automatic E2E Tests (`batch-fully-automatic.spec.ts`)

Comprehensive tests for fully automatic batch process with state machine (17 tests):

#### Setup and Loading (2 tests)
- Load "Batch Process - Fully Automatic" example
- Display correct state machine logic

#### Automatic Fill Cycle (3 tests)
- Start fill cycle when START pressed
- Continue filling after START is released
- Transition to mix when tank reaches 100%

#### Automatic Mix Cycle (2 tests)
- Run mixer for exactly 5 seconds
- Show FULL LED during mixing

#### Automatic Drain Cycle (2 tests)
- Automatically transition to drain after mixing
- Complete drain and return to IDLE

#### Complete Automatic Cycle (2 tests)
- Execute full automatic cycle without intervention
- Allow multiple cycles with same START button

#### State Machine Behavior (2 tests)
- Maintain RUN LED throughout entire cycle
- Properly transition between all three states

#### Timer Behavior (1 test)
- Use T0 timer for 5-second mix delay

This fully automatic batch process demonstrates:
- **State machine implementation** with 3 states (M0=Fill, M1=Mix, M2=Drain)
- **Self-maintaining logic** (seal-in without needing to hold START)
- **Timer-based sequencing** (TON T0 for 5-second mix)
- **Automatic state transitions** based on sensors and timers
- **Complete automation** - only ONE button press needed!
- **Cycle reset logic** - returns to IDLE when complete

Sequence flow:
1. Press START (I0.0) → Release immediately
2. Fill state (M0) activates → PUMP1 fills tank
3. HI-LEVEL (I1.0) triggers → Mix state (M1)
4. Timer T0 runs for 5 seconds → MIXER operates
5. Timer done → Drain state (M2)
6. PUMP3 drains until LO-LEVEL (I1.1) off
7. Cycle complete → Returns to IDLE

### Traffic Lights E2E Tests (`traffic-lights.spec.ts`)

Comprehensive browser-based tests covering all traffic light functionality:

#### Basic Application Tests (3 tests)
- Application loads successfully
- Page title is correct
- Main components are visible

#### Scene Switching Tests (4 tests)
- Switch to traffic lights scene
- Scene renders correctly
- Toggle between scenes
- Scene state persistence

#### Visual State Tests (5 tests)
- All three traffic lights render
- Correct initial states (Red ON, Yellow OFF, Green OFF)
- Light colors are correct
- Visual indicators work
- Output states sync with visuals

#### Traffic Light Example Loading (3 tests)
- Load "Single Traffic Light" example
- Load "Traffic Light Crossroad" example
- Examples execute correctly

#### Single Light Behavior (3 tests)
- Automatic cycling: Red → Green → Yellow → Red
- Timing accuracy
- State transitions are clean

#### Crossroad Behavior (4 tests)
- Both directions present (N-S and E-W)
- Never both green simultaneously
- Safety constraints enforced
- Independent state control

#### Safety Features (3 tests)
- All-red safety period exists
- Collision prevention works
- Emergency override functionality

#### Advanced Features (3 tests)
- Pedestrian crossing button
- Extended green time for pedestrians
- Vehicle counting and adaptive timing

#### Error Handling (2 tests)
- Invalid programs show errors
- Error messages are clear

#### Performance Tests (1 test)
- Application remains responsive during long simulations

### Browser Coverage

All E2E tests run on three browsers:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

Total E2E test executions: **31 tests × 3 browsers = 93 test runs**

---

## Test Helpers

### `testHelpers.ts`

Utility functions for testing:

#### `createTestPLCState(overrides?: Partial<PLCState>): PLCState`

Creates a clean PLC state for testing with:
- 16 inputs (I0.0 - I0.7, I1.0 - I1.7) all initialized to false
- 16 outputs (Q0.0 - Q0.7, Q1.0 - Q1.7) all initialized to false
- Empty memory variables
- IDLE execution mode
- Default configuration

**Usage:**
```typescript
const state = createTestPLCState();
state.inputs['I0.0'] = true;
```

**With overrides:**
```typescript
const state = createTestPLCState({
  inputs: { 'I0.0': true },
  mode: 'RUN'
});
```

#### `executeProgram(programText: string, state: PLCState): PLCState`

Executes a PLC program and returns updated state:
- Parses IL program text
- Executes all instructions
- Updates timers (simulates scan cycle)
- Returns new state

**Usage:**
```typescript
const program = 'LD I0.0\nOUT Q0.0';
const result = executeProgram(program, state);
expect(result.outputs['Q0.0']).toBe(true);
```

**Important:** This helper automatically calls `MemoryService.updateAllTimers()` to ensure timers advance correctly between scan cycles.

---

## Test Patterns and Best Practices

### Timer Testing Pattern

When testing timers, run multiple scan cycles:

```typescript
let result = state;
result.inputs['I0.0'] = true;

// Wait 50 cycles for timer
for (let i = 0; i < 50; i++) {
  result = executeProgram(program, result);
}

expect(result.outputs['Q0.0']).toBe(true);
```

### Counter Testing Pattern

Test counters with rising edge detection:

```typescript
// Generate rising edges
for (let i = 0; i < 5; i++) {
  result.inputs['I0.0'] = false;  // Falling edge
  result = executeProgram(program, result);
  result.inputs['I0.0'] = true;   // Rising edge
  result = executeProgram(program, result);
}

expect(result.memoryVariables['C0'].accumulated).toBe(5);
```

### State Persistence Pattern

Test that latched outputs maintain state:

```typescript
// SET output
result.inputs['I0.0'] = true;
result = executeProgram(program, result);
expect(result.outputs['Q0.0']).toBe(true);

// Release input - output should stay ON
result.inputs['I0.0'] = false;
result = executeProgram(program, result);
expect(result.outputs['Q0.0']).toBe(true);
```

### Safety Validation Pattern

For traffic lights, always verify safety:

```typescript
for (let i = 0; i < 200; i++) {
  result = executeProgram(program, result);

  const nsGreen = result.outputs['Q0.2'] || false;
  const ewGreen = result.outputs['Q1.2'] || false;

  // Safety: never both green
  expect(nsGreen && ewGreen).toBe(false);
}
```

---

## Continuous Integration

Tests are run automatically on:
- Every commit
- Pull requests
- Before deployments

### CI Test Pipeline

1. **Lint and Type Check**
   - ESLint validation
   - TypeScript compilation

2. **Unit Tests**
   - Fast execution (< 10 seconds)
   - Core functionality validation

3. **Integration Tests**
   - Medium execution (< 30 seconds)
   - Component interaction validation

4. **E2E Tests**
   - Slower execution (2-5 minutes)
   - Full application validation
   - Cross-browser testing

---

## Writing New Tests

### When to Write Unit Tests

- New interpreter instructions
- New memory operations
- Utility functions
- Parser logic

### When to Write Integration Tests

- New example programs
- Complex instruction sequences
- Real-world scenarios
- State machines

### When to Write E2E Tests

- New UI features
- User workflows
- Visual components
- Scene interactions

---

## Test Maintenance

### Keeping Tests Green

- Run tests before committing
- Fix failing tests immediately
- Don't skip or ignore failing tests
- Update tests when requirements change

### Test Performance

- Keep unit tests fast (< 1ms each)
- Minimize E2E test count (focus on critical paths)
- Use test helpers to reduce duplication
- Parallelize independent tests

### Test Coverage Goals

- **Unit Tests**: > 90% code coverage
- **Integration Tests**: All example programs
- **E2E Tests**: All critical user paths

---

## Troubleshooting

### Common Issues

#### Timers Not Working
- Ensure `MemoryService.updateAllTimers()` is called
- Check that scan cycles are being simulated
- Verify preset values are correct

#### Counters Not Counting
- Verify rising edge detection
- Check that input transitions LOW → HIGH
- Ensure counter is not at max value

#### E2E Tests Failing
- Check that dev server is running
- Verify correct base URL in playwright.config.ts
- Ensure page title matches expectations
- Clear browser cache if needed

#### Tests Timing Out
- Reduce number of scan cycles
- Use smaller preset values in tests
- Check for infinite loops

---

## Related Documentation

- [Main README](../../README.md) - Project overview
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute
- [PLC Instructions Reference](../public/examples/index.json) - Instruction examples

---

## Changelog

### 2025-11-13 (Update 3)
- **Fixed Batch Simulation IL code** to use correct sensor mapping
- Changed sensors from I0.5/I0.6/I0.7 to I1.0/I1.1 (matching BatchScene component)
- Updated batch logic: fill → mix → drain cycle
- Added comprehensive Batch README documentation with I/O mapping and operation guide
- **Added 16 E2E tests for Batch Simulation**:
  - Scene setup (3 tests)
  - Fill cycle (2 tests)
  - Mixer operation (1 test)
  - Drain cycle (1 test)
  - Status LEDs (3 tests)
  - Complete cycle (1 test)
  - Emergency stop (1 test)
  - Sensor behavior (2 tests)
  - Complete cycle integration (2 tests)
- Total E2E tests increased from 54 to 70
- Total project tests: 300+ (150 unit + 80 integration + 70 E2E)

### 2025-11-13 (Update 2)
- Added comprehensive E2E tests for ALL PLC instructions (23 tests)
- Tests cover: LD, LDN, ST, STN, AND, ANDN, OR, ORN, TON, TOFF, CTU, CTD, CTR, CTL
- Added combined logic tests (AND/OR combinations)
- Added edge case tests (multiple timers/counters, timer+counter combos)
- Added performance stress tests
- Updated test documentation with new instruction tests section
- Total E2E tests increased from 31 to 54

### 2025-11-13 (Update 1)
- Added comprehensive E2E tests for traffic lights
- Added integration tests for all traffic light scenarios
- Added complex scenario tests
- Fixed timer test infrastructure
- Added STN instruction tests
- Documented all test categories and patterns
