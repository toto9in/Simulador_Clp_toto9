# PLC Simulator - Complete Architecture Documentation

## Project Overview
- **Name:** Simulador de CLP (PLC Simulator)
- **Type:** Interactive PLC (Programmable Logic Controller) simulation environment
- **Language:** Instruction List (IL) - a graphical PLC programming language
- **Framework:** Java Swing/AWT
- **Build System:** Gradle
- **Java Version:** Java 17
- **Main Dependency:** org.netbeans.external:AbsoluteLayout (GUI layout)

---

## 1. APPLICATION ENTRY POINT & STRUCTURE

### Main Entry Point
- **File:** `SimuladorClp.java`
- **Function:** Creates and shows `HomePg` window
- **Simple initialization:** `new HomePg().setVisible(true);`

### Project Structure
```
src/
├── SimuladorClp.java                    (Main entry point)
├── Controllers/                          (Business logic)
│   ├── HomePageController.java
│   └── BatchSimulatorController.java
├── Models/                               (Data models & state)
│   ├── ExecutionMode.java              (IDLE, STOPPED, RUNNING)
│   └── HomePageModel.java              (Global state container)
├── ilcompiler/                          (Core PLC logic)
│   ├── interpreter/                    (Instruction execution engine)
│   │   └── Interpreter.java
│   ├── input/                          (Input management)
│   │   ├── Input.java
│   │   └── InputActions.java
│   ├── output/                         (Output management)
│   │   ├── Output.java
│   │   └── OutputActions.java
│   ├── memoryvariable/                 (Memory variables - timers & counters)
│   │   └── MemoryVariable.java
│   ├── edit/                           (UI utilities)
│   │   ├── Colors.java                (5 color themes)
│   │   └── Language.java              (4 language support: PT-BR, EN, JA, DE)
│   └── uppercasedocumentfilter/       (Text input filter)
│       └── UpperCaseDocumentFilter.java
├── screens/                             (UI - Main screens)
│   ├── HomePg.java                    (Main window)
│   ├── ListaDeVariaveisPg.java        (Variables data table)
│   ├── HelpPopUp.java                 (Help dialog)
│   ├── SobrePopup.java                (About dialog)
│   └── scenes/                        (Interactive scenes)
│       ├── IScenePanel.java           (Scene interface)
│       ├── DefaultScenePanel.java     (8 inputs, 8 outputs)
│       ├── BatchSimulationScenePanel.java (Tank filling simulator)
│       ├── ScenesEnum.java            (Scene types)
│       ├── InputEventListener.java    (Input event interface)
│       ├── PushButton.java            (Custom button component)
│       └── RedIndicator.java          (Custom LED/sensor indicator)
├── colors/
│   └── SimColors.java
└── save/
    └── Save.java                       (File I/O)
```

---

## 2. CORE PLC LOGIC IMPLEMENTATION

### 2.1 Execution Mode (ExecutionMode.java)
```java
IDLE(1)      // Program paused, not running
STOPPED(2)   // Program stopped
RUNNING(3)   // Program actively executing
```

### 2.2 Memory Model (HomePageModel.java)
**Global Singleton State:**
- `inputs`: Map<String, Boolean> - I0.0 to I1.7 (16 inputs)
- `inputsType`: Map<String, InputType> - Input type (SWITCH, NO, NC)
- `outputs`: Map<String, Boolean> - Q0.0 to Q1.7, Q1.0-Q1.7 (16 outputs)
- `memoryVariables`: Map<String, MemoryVariable> - M, T (timers), C (counters)
- `mode`: ExecutionMode - Current execution state
- `color`: Integer - Current theme (1-4)

### 2.3 Input Management (Input.java & InputActions.java)
**Input Definitions:**
- 16 inputs: I0.0-I0.7, I1.0-I1.7
- **InputType Enum:**
  - `SWITCH` (0): Toggle switch (stays in state)
  - `NO` (1): Normally Open button (pressed=true, released=false)
  - `NC` (2): Normally Closed button (pressed=false, released=true)

**InputActions:**
- `create()`: Initialize 16 inputs with false state
- `createType()`: Initialize all as SWITCH type
- `read()`: Read/pass through input values

### 2.4 Output Management (Output.java & OutputActions.java)
**Output Definitions:**
- 16 outputs: Q1.0-Q1.7, Q0.0-Q0.7

**OutputActions:**
- `create()`: Initialize 16 outputs with false state
- `resetOutputs()`: Set all outputs to false

### 2.5 Memory Variables (MemoryVariable.java)
**Three types of memory variables:**

1. **M (Boolean Memory):** Simple true/false storage
   - Fields: `id`, `currentValue`

2. **T (Timer):** Time-based counters
   - Fields: `id`, `currentValue`, `counter`, `maxTimer`, `timerType` (ON/OFF), `endTimer`
   - `timerType`: 
     - "ON": Timer triggers when counter reaches preset
     - "OFF": Timer inverse logic
   - 100ms timer interval
   - Counter increments each interval

3. **C (Counter):** Event-based counters
   - Fields: Same as Timer
   - `counterType`: "UP" or "DOWN"
   - Increments/decrements on transitions
   - `testEndTimer()`: Sets `endTimer` when preset reached

**Key Methods:**
- `incrementCounter()` / `decrementCounter()`: Manual counter control
- `testEndTimer()`: Check if counter reached target

### 2.6 Instruction List Interpreter (Interpreter.java)

**Supported Instructions:**
```
Data Movement:
  LD   - Load value to accumulator
  LDN  - Load negated value to accumulator
  ST   - Store accumulator to output/memory
  STN  - Store negated accumulator to output/memory

Logic Operations:
  AND  - AND operation with accumulator
  ANDN - AND operation with negated operand
  OR   - OR operation with accumulator
  ORN  - OR operation with negated operand

Timers:
  TON  - Timer ON delay (syntax: TON T1, preset_value)
  TOFF - Timer OFF delay (syntax: TOFF T1, preset_value)

Counters:
  CTU  - Count up (syntax: CTU C1, preset_value)
  CTD  - Count down (syntax: CTD C1, preset_value)
```

**Execution Flow:**
1. Parse each line: extract operator and variables
2. Validate: operator exists, variable is valid
3. Execute based on context:
   - Input/Output operations: Direct manipulation
   - Memory operations: Create/update memory variables
4. Uses single accumulator for logic chaining

**Example Program:**
```
LD I0.0
AND I0.1
ST Q1.0
LD I0.2
TON T1, 5000
ST Q1.1
```

**Line Parsing:**
- Separates operator and operands by spaces/commas
- Ignores empty lines
- Case-insensitive (converted to uppercase)
- Error checking: shows dialog for invalid syntax

---

## 3. SCAN CYCLE IMPLEMENTATION

### Cycle Flow (HomePageController.runCycle())

**Triggered every 100ms during RUNNING mode:**

```
1. Check if still RUNNING
   └─ If not, stop timer and exit

2. Read inputs from UI
   └─ InputActions.read()

3. Execute user program
   └─ Get all lines from code editor
   └─ Interpreter.receiveLines() processes each instruction
   └─ Updates outputs based on logic

4. Update memory timers
   └─ For each Timer variable (T*):
     └─ If TON: start when input=true, stop when input=false
     └─ If TOFF: inverse logic
     └─ Counter increments each cycle (100ms interval)
     └─ Sets endTimer flag when counter=maxTimer

5. Update UI
   └─ updateSceneUI(): Update all visual indicators
   └─ updateMemoryVariables(): Update displayed timers/counters
   └─ updateMode(): Enable/disable controls based on mode
```

### Timer State Management (HomePageController.updateTimersState())
- **TON (ON Delay):**
  - Input TRUE → timer starts → counter increments
  - Input FALSE → timer stops, counter resets
  - endTimer becomes TRUE when counter == maxTimer

- **TOFF (OFF Delay):**
  - Input TRUE → endTimer stays TRUE (timer not running)
  - Input FALSE → timer starts → counter increments
  - endTimer becomes FALSE when counter == maxTimer

---

## 4. UI COMPONENTS & INTERACTION

### 4.1 Main Window (HomePg.java)

**Layout Sections:**
1. **Menu Bar:** File (Save/Load), Edit (Theme/Language), Help, About
2. **Control Panel:** Scene selector, Start, Pause, Refresh, Data Table buttons
3. **Scene Container:** Interactive panel (swappable)
4. **Code Editor:** TextArea with uppercase filter
5. **Status Panel:** 
   - 10 Timer displays (current/preset values)
   - 10 Counter displays (current/preset values)

**Control Events:**
- `Start/Pause`: Toggles between RUNNING and IDLE modes
- `Refresh`: Resets outputs and timers
- `Scene Selector`: Switches between DEFAULT and BATCH_SIMULATION

### 4.2 Scene System (IScenePanel Interface)

**Scene Types (ScenesEnum):**
1. **DEFAULT:** Basic panel with 8 inputs and 8 outputs
   - Inputs: I0.0 to I0.7 (left side with visual buttons)
   - Outputs: Q0.0 to Q0.7 (right side with LED indicators)
   - Interactive: Click inputs to toggle/cycle types

2. **BATCH_SIMULATION:** Industrial tank simulator
   - Background image of tank
   - Custom buttons (start/stop) and LEDs
   - Dynamic tank fill visualization
   - Critical failure detection (pump3 empty, pump1 overflow)

**Scene Interface Methods:**
- `initInputs()`: Initialize inputs for scene
- `updateUIState()`: Update visual based on state
- `resetUIState()`: Clear visual state
- `setInputListener()`: Set input event handler
- `setOnCriticalFailureCallback()`: Pause on critical failure
- `stop()`: Stop scene operations

### 4.3 DefaultScenePanel

**Components:**
- 8 Input buttons (JLabel with mouse listeners)
- 8 Output LEDs (JLabel with ImageIcon)
- Interactive input type cycling (right-click)

**Visual States:**
- **Inputs by type:**
  - SWITCH: Open/closed switch icons
  - NO: Button pressed/unpressed icons
  - NC: Inverse button states

- **Outputs:**
  - LED on (yellow icon)
  - LED off (black icon)

**Input Handling:**
- Left-click: Toggle/press input
- Right-click: Cycle input type (SWITCH→NO→NC→SWITCH)
- Buttons fire events to InputEventListener

### 4.4 BatchSimulationScenePanel

**Custom Components:**
- **PushButton:** Custom-rendered button with state
  - Supports GRAY and RED color palettes
  - Draws filled circle with borders
  - Distinguishes between NO and NC visually

- **RedIndicator:** Custom LED/sensor indicator
  - Circular LEDs (20px for LED, 10px for sensor)
  - Red when active, black when inactive
  - Rounded rectangle for sensors

**Tank Simulation:**
- Fill level: 0-220 pixels
- Pump1 (Q0.1): Fills tank (2px/cycle)
- Pump3 (Q0.3): Drains tank (2px/cycle)
- Hi-level sensor (I1.0): Triggers at 220px
- Lo-level sensor (I1.1): Triggers above 3px

**Critical Failure Detection:**
- Pump1 on + hi-level > 1500ms → Overflow alert → PAUSE
- Pump3 on + no-liquid > 1500ms → Pump failure alert → PAUSE

### 4.5 Variables Data Table (ListaDeVariaveisPg.java)

**Display:**
- JTable showing all system variables
- Columns: ID, CurrentValue, Counter, MaxTimer, EndTimer
- Color-coded: TRUE=green, FALSE=red
- Sortable by ID
- Non-editable

**Content:**
- All inputs and outputs
- All memory variables (M, T, C)

---

## 5. FILE I/O & PERSISTENCE

### Save.java

**Functions:**
- `save(String name, List<String> memory)`: 
  - Writes program lines to file with .txt extension
  - One line per file line
  - Basic PrintWriter implementation

- `load(String name)`:
  - Reads file lines into memory
  - Filters empty lines
  - Returns List<String>

**Usage:**
- Save: User selects file location, program lines written
- Load: User selects file, lines loaded into code editor

---

## 6. OPERATING MODES

### Three Execution States

1. **IDLE (Initial State)**
   - User can edit code
   - Outputs disabled (all false)
   - Can switch scenes
   - Can start execution

2. **RUNNING**
   - Code actively executing
   - Cycle timer active (100ms)
   - Cannot edit code
   - Cannot switch scenes
   - Start button toggles to STOPPED

3. **STOPPED**
   - Program paused
   - Outputs retain state
   - Can resume or go to IDLE
   - Memory variables paused

### Mode Transitions
```
IDLE ←→ RUNNING
       ↓ (pause)
      STOPPED
       ↓ (refresh)
      IDLE
```

---

## 7. UTILITY SYSTEMS

### 7.1 Color System (Colors.java)
5 predefined color themes:
```
Theme 1 (Default Blue):
  - Primary: RGB(8, 94, 131)
  - Secondary: RGB(142, 177, 199)
  - Tertiary: RGB(131, 177, 246)

Theme 2 (Green):
Theme 3 (Orange/Brown):
Theme 4 (Red):
```

### 7.2 Language System (Language.java)
Supported languages: PT-BR, EN, JA (Japanese), DE (German)

Translatable UI elements:
- File menu
- Edit menu
- Help/About buttons
- UI labels
- Error messages

Cycling: PT-BR → EN → JA → DE → PT-BR

### 7.3 Input Validation
- **UpperCaseDocumentFilter:** Auto-converts code to uppercase
- Prevents case-sensitive parsing issues
- Applied to code editor TextArea

---

## 8. EXTERNAL DEPENDENCIES

**Runtime:**
- `org.netbeans.external:AbsoluteLayout:RELEASE270` - GUI layout management

**Built-in Java:**
- `javax.swing.*` - UI components
- `java.awt.*` - Graphics and layout
- `java.io.*` - File I/O
- `java.util.*` - Collections

---

## 9. KEY DESIGN PATTERNS

### 9.1 Global State (Singleton-like)
- HomePageModel maintains all state
- Static maps for inputs, outputs, variables
- Accessed from multiple components

### 9.2 Observer Pattern
- InputEventListener interface for input events
- Scenes register listener with HomePg
- Button presses trigger onPressed/onReleased

### 9.3 Strategy Pattern
- IScenePanel interface with multiple implementations
- DefaultScenePanel vs BatchSimulationScenePanel
- Runtime scene swapping

### 9.4 Model-View-Controller
- Models: ExecutionMode, HomePageModel
- Views: HomePg, Scene panels
- Controllers: HomePageController, BatchSimulatorController

### 9.5 State Machine
- ExecutionMode enum controls flow
- Different button behaviors per mode
- Timer activation based on state

---

## 10. EXECUTION FLOW DIAGRAM

```
START
  ↓
[HomePg Constructor]
  ├─ Initialize all UI components
  ├─ Create InputActions (16 inputs)
  ├─ Create OutputActions (16 outputs)
  ├─ Create DefaultScenePanel
  ├─ Set input event listener
  └─ Create data table window
  ↓
[User Interface Ready]
  ├─ User edits code in TextArea
  ├─ User toggles inputs in scene
  └─ User clicks Start button
  ↓
[Mode: IDLE → RUNNING]
  ├─ Start 100ms cycle timer
  └─ Disable edit/scene controls
  ↓
[Scan Cycle (Every 100ms)] ──┐
  ├─ Read inputs               │
  ├─ Execute program logic     │
  ├─ Update timers             │
  ├─ Update UI                 │
  └─ Repaint scene            │
  ↓                            │
[User clicks Pause]           │
  ├─ Stop cycle timer ←────────┘
  ├─ Mode: RUNNING → IDLE
  └─ Re-enable edit/scene controls
  ↓
[END]
```

---

## 11. CRITICAL CODE FLOWS

### Scan Cycle Execution
```java
// HomePageController.runCycle() - Called every 100ms
1. if (!running) { timer.stop(); return; }
2. List<String> lines = homePage.saveLines(new ArrayList<>());
3. inputs = InputActions.read(inputs);
4. outputs = Interpreter.receiveLines(lines, inputs, outputs, memory);
5. updateTimersState();  // Manage timer counters
6. homePage.updateMode();
7. homePage.updateSceneUI();
8. homePage.updateMemoryVariables();
```

### Instruction Execution
```java
// Interpreter.executeInstruction()
1. Parse line → operator + variables
2. Validate operator (is it in valid list?)
3. Validate variables (input/output/memory exists?)
4. Execute based on operator:
   - LD/LDN: Load to accumulator
   - AND/ANDN/OR/ORN: Logic with accumulator
   - ST/STN: Store accumulator result
   - TON/TOFF/CTU/CTD: Create/update memory variables
5. Return updated outputs
```

### Input Event Handling
```java
// HomePg.handleInputButtonPressed()
1. Get input type (SWITCH/NO/NC)
2. If LEFT click:
   - SWITCH: Toggle state
   - NO: Set to true
   - NC: Set to false
3. If RIGHT click:
   - Cycle to next InputType
4. updateSceneUI() to reflect changes
```

---

## 12. ARCHITECTURE NOTES FOR TYPESCRIPT/REACT CONVERSION

### Key Considerations:

1. **Global State Management**
   - Replace HomePageModel with Context API or Redux
   - Need real-time updates across components

2. **Timing/Cycles**
   - Replace Swing Timer with setInterval or requestAnimationFrame
   - Ensure 100ms cycle accuracy

3. **Component Reusability**
   - IScenePanel interface → React component with polymorphism
   - Input/Output management → Custom hooks

4. **File I/O**
   - Replace Java FileWriter/FileReader with Web APIs
   - Use File input for loading, Blob for downloading

5. **Color System**
   - CSS or styled-components theme management
   - Easy theme switching

6. **Language Support**
   - i18n library (react-i18next)
   - Same 4 languages, easy to extend

7. **Custom Graphics**
   - Canvas API for tank simulation
   - SVG for simple shapes (buttons, indicators)
   - React libraries: Konva, Pixi, or custom Canvas hooks

8. **Performance**
   - React rendering optimization needed for 100ms cycle
   - useCallback, useMemo for event handlers
   - Debounce UI updates if needed

