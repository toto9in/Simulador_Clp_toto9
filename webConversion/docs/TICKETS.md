# Development Tickets - PLC Simulator Web Conversion

This document tracks all development tasks for the web conversion project.

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked
- 🔵 Under Review

---

## PHASE 1: Foundation & Setup (Week 1-2)

### TICKET-001: Project Setup 🟡
**Priority:** Critical
**Effort:** 2-4 hours
**Started:** 2025-11-11

**Description:**
Set up the base TypeScript + React + Vite project with proper configuration.

**Tasks:**
- [x] Create `webConversion` directory
- [x] Create CHANGELOG.md and TICKETS.md
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Create directory structure (types, services, components, etc)
- [ ] Add package.json with dependencies
- [ ] Configure Vite for development

**Dependencies:** None

**Acceptance Criteria:**
- Project builds without errors
- TypeScript strict mode enabled
- Linting rules configured
- Development server runs successfully

---

### TICKET-002: TypeScript Type Definitions 🔴
**Priority:** Critical
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create comprehensive TypeScript type definitions for all PLC entities.

**Tasks:**
- [ ] Create `types/plc.ts` with:
  - PLCState interface
  - ExecutionMode enum
  - InputType enum
  - Input/Output types
- [ ] Create `types/memory.ts` with:
  - MemoryVariable interface
  - Timer types (TON, TOFF)
  - Counter types (CTU, CTD)
- [ ] Create `types/instructions.ts` with:
  - Instruction enum (LD, ST, AND, OR, etc)
  - InstructionLine interface
- [ ] Create `types/scenes.ts` with:
  - SceneType union type
  - Scene-specific interfaces
- [ ] Create `types/ui.ts` with:
  - Theme types
  - Language types

**Dependencies:** TICKET-001

**Acceptance Criteria:**
- All types compile without errors
- Types match Java model classes
- JSDoc comments for all public types

---

### TICKET-003: Core Interpreter Service 🔴
**Priority:** Critical
**Effort:** 8-12 hours
**Status:** Not Started

**Description:**
Convert `Interpreter.java` to TypeScript. This is the heart of the PLC logic.

**Tasks:**
- [ ] Create `services/interpreter.ts`
- [ ] Implement `executeInstruction()` method
- [ ] Support all 12 IL instructions:
  - LD (Load)
  - LDN (Load Negated)
  - ST (Store)
  - STN (Store Negated)
  - AND
  - ANDN (AND Negated)
  - OR
  - ORN (OR Negated)
  - TON (Timer On Delay)
  - TOFF (Timer Off Delay)
  - CTU (Count Up)
  - CTD (Count Down)
- [ ] Implement accumulator logic
- [ ] Add unit tests (minimum 90% coverage)

**Dependencies:** TICKET-002

**Acceptance Criteria:**
- All 12 instructions work correctly
- Unit tests pass
- Logic matches Java implementation exactly

**Reference:** `src/ilcompiler/interpreter/Interpreter.java`

---

### TICKET-004: Memory Variable Service 🔴
**Priority:** Critical
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Convert `MemoryVariable.java` to TypeScript for timers and counters.

**Tasks:**
- [ ] Create `services/memory.ts`
- [ ] Implement MemoryVariable class
- [ ] Implement timer logic (TON, TOFF)
- [ ] Implement counter logic (CTU, CTD)
- [ ] Support at least 32 memory variables
- [ ] Add preset/accumulated values
- [ ] Add unit tests

**Dependencies:** TICKET-002

**Acceptance Criteria:**
- Timers count with 0.1s (100ms) precision
- Counters increment/decrement correctly
- Reset functionality works
- Unit tests pass

**Reference:** `src/ilcompiler/memoryvariable/MemoryVariable.java`

---

### TICKET-005: Input/Output Services 🔴
**Priority:** High
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Convert input/output management classes to TypeScript.

**Tasks:**
- [ ] Create `services/input.ts`
- [ ] Implement InputActions functionality
- [ ] Support 16 inputs (I0.0-I1.7)
- [ ] Support 3 input types (SWITCH, NO, NC)
- [ ] Create `services/output.ts`
- [ ] Implement OutputActions functionality
- [ ] Support 16 outputs (Q0.0-Q1.7)
- [ ] Add unit tests

**Dependencies:** TICKET-002

**Acceptance Criteria:**
- All input types work correctly
- Input reading works
- Output writing works
- Unit tests pass

**Reference:**
- `src/ilcompiler/input/InputActions.java`
- `src/ilcompiler/output/OutputActions.java`

---

### TICKET-006: File I/O Service 🔴
**Priority:** Medium
**Effort:** 3-4 hours
**Status:** Not Started

**Description:**
Implement file save/load functionality using Web APIs.

**Tasks:**
- [ ] Create `services/fileIO.ts`
- [ ] Implement `saveProgramToFile()` using Blob API
- [ ] Implement `loadProgramFromFile()` using File API
- [ ] Support .txt format (same as Java)
- [ ] Handle file validation
- [ ] Add error handling
- [ ] Add unit tests

**Dependencies:** TICKET-002

**Acceptance Criteria:**
- Can save IL programs to .txt files
- Can load IL programs from .txt files
- File format matches Java version
- Error messages for invalid files

**Reference:** `src/save/Save.java`

---

## PHASE 2: State Management (Week 2-3)

### TICKET-007: React Context Setup 🔴
**Priority:** Critical
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Set up global state management using React Context + useReducer.

**Tasks:**
- [ ] Create `context/PLCStateContext.tsx`
- [ ] Implement PLCState interface
- [ ] Create reducer with action types
- [ ] Implement state actions:
  - SET_INPUT
  - SET_OUTPUT
  - UPDATE_MEMORY
  - SET_MODE
  - SET_PROGRAM
- [ ] Create provider component
- [ ] Add TypeScript types for actions

**Dependencies:** TICKET-002, TICKET-003

**Acceptance Criteria:**
- Context provides state to all components
- Reducer handles all actions correctly
- Type-safe state updates
- No unnecessary re-renders

---

### TICKET-008: Execution Cycle Hook 🔴
**Priority:** Critical
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Implement the PLC scan cycle (100ms intervals).

**Tasks:**
- [ ] Create `hooks/useExecutionCycle.ts`
- [ ] Implement 4-step scan cycle:
  1. Read inputs (from memory image)
  2. Execute user program
  3. Update outputs (to memory image)
  4. Repeat
- [ ] Use setInterval for 100ms timing
- [ ] Handle mode changes (IDLE, STOPPED, RUNNING)
- [ ] Stop cycle when mode is not RUNNING
- [ ] Add performance monitoring

**Dependencies:** TICKET-003, TICKET-004, TICKET-007

**Acceptance Criteria:**
- Cycle runs every 100ms (±10ms tolerance)
- Cycle stops when mode changes to STOPPED
- Inputs/outputs update correctly
- No memory leaks

---

### TICKET-009: Custom Hooks for Controllers 🔴
**Priority:** High
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create custom hooks to replace Java controllers.

**Tasks:**
- [ ] Create `hooks/useBatchSimulator.ts`
- [ ] Implement tank physics simulation
- [ ] Create `hooks/useLanguage.ts`
- [ ] Create `hooks/useTheme.ts`
- [ ] Add proper cleanup on unmount

**Dependencies:** TICKET-007

**Acceptance Criteria:**
- All hooks work without errors
- Proper cleanup prevents memory leaks
- TypeScript types are correct

---

## PHASE 3: Main UI Components (Week 3-5)

### TICKET-010: Main Window Component 🔴
**Priority:** Critical
**Effort:** 8-10 hours
**Status:** Not Started

**Description:**
Create the main application window layout.

**Tasks:**
- [ ] Create `components/MainWindow/MainWindow.tsx`
- [ ] Implement layout structure
- [ ] Add menu bar area
- [ ] Add control panel area
- [ ] Add scene container area
- [ ] Add code editor area
- [ ] Add status panel area
- [ ] Make responsive
- [ ] Add CSS styles

**Dependencies:** TICKET-007

**Acceptance Criteria:**
- Layout matches Java version
- All areas render correctly
- Responsive design works

**Reference:** `src/screens/HomePg.java`

---

### TICKET-011: Menu Bar Component 🔴
**Priority:** High
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Create menu bar with File, Edit, Help menus.

**Tasks:**
- [ ] Create `components/MainWindow/MenuBar.tsx`
- [ ] Add File menu (New, Open, Save, Exit)
- [ ] Add Edit menu (theme, language selection)
- [ ] Add Help menu (Help, About)
- [ ] Add keyboard shortcuts
- [ ] Support 4 languages
- [ ] Add icons

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- All menu items work
- Keyboard shortcuts functional
- Menus close properly

---

### TICKET-012: Control Panel Component 🔴
**Priority:** High
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create control panel with mode buttons and status.

**Tasks:**
- [ ] Create `components/MainWindow/ControlPanel.tsx`
- [ ] Add PROGRAM mode button
- [ ] Add STOP mode button
- [ ] Add RUN mode button
- [ ] Add current mode indicator
- [ ] Add scene selector
- [ ] Add visual feedback (colors, states)
- [ ] Add internationalization

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- Buttons change execution mode
- Visual feedback is clear
- Mode changes work correctly

---

### TICKET-013: Code Editor Component 🔴
**Priority:** Critical
**Effort:** 8-10 hours
**Status:** Not Started

**Description:**
Create code editor for IL programs with auto-uppercase.

**Tasks:**
- [ ] Create `components/MainWindow/CodeEditor.tsx`
- [ ] Implement text area with monospace font
- [ ] Add auto-uppercase filter
- [ ] Add line numbers
- [ ] Add basic syntax highlighting (optional)
- [ ] Support multi-line input
- [ ] Add keyboard shortcuts
- [ ] Integrate with state

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- Text automatically converts to uppercase
- Line numbers display correctly
- Code saves to state
- Editor disabled in RUN mode

**Reference:** `src/ilcompiler/uppercasedocumentfilter/UpperCaseDocumentFilter.java`

---

### TICKET-014: Status Panel Component 🔴
**Priority:** Medium
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create status panel showing timers and counters.

**Tasks:**
- [ ] Create `components/MainWindow/StatusPanel.tsx`
- [ ] Display all active timers
- [ ] Display all active counters
- [ ] Show current values
- [ ] Show preset values
- [ ] Update in real-time (100ms)
- [ ] Add scrolling if many variables

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- All variables display correctly
- Updates in real-time
- Scrolling works for many variables

---

### TICKET-015: Data Table Viewer Component 🔴
**Priority:** High
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Create data table window (like LogixPro) showing all variables.

**Tasks:**
- [ ] Create `components/DataTable/DataTable.tsx`
- [ ] Display all inputs (I0.0-I1.7)
- [ ] Display all outputs (Q0.0-Q1.7)
- [ ] Display all memory variables (M, T, C)
- [ ] Show current values in real-time
- [ ] Add sorting capability
- [ ] Add filtering capability
- [ ] Make window draggable/resizable

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- All variables visible
- Values update in real-time
- Sorting/filtering works
- Window is resizable

**Reference:** `src/screens/ListaDeVariaveisPg.java`

---

## PHASE 4: Scene System (Week 5-6)

### TICKET-016: Scene Container Component 🔴
**Priority:** Critical
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create scene container that renders different scene types.

**Tasks:**
- [ ] Create `components/SceneContainer/SceneContainer.tsx`
- [ ] Implement scene type switching
- [ ] Add scene selector
- [ ] Handle scene state
- [ ] Add transitions

**Dependencies:** TICKET-010

**Acceptance Criteria:**
- Scenes switch correctly
- State persists across switches
- No errors when switching

---

### TICKET-017: Default Scene Panel 🔴
**Priority:** Critical
**Effort:** 10-12 hours
**Status:** Not Started

**Description:**
Create default I/O scene with 8 inputs and 8 outputs.

**Tasks:**
- [ ] Create `components/SceneContainer/DefaultScene/DefaultScenePanel.tsx`
- [ ] Create `components/SceneContainer/DefaultScene/InputButton.tsx`
- [ ] Create `components/SceneContainer/DefaultScene/OutputLED.tsx`
- [ ] Implement 8 input buttons (I0.0-I0.7)
- [ ] Implement 8 output LEDs (Q0.0-Q0.7)
- [ ] Support 3 input types (SWITCH, NO, NC)
- [ ] Add right-click to cycle input types
- [ ] Add visual feedback (pressed states, LED on/off)
- [ ] Add CSS styling
- [ ] Make interactive

**Dependencies:** TICKET-016

**Acceptance Criteria:**
- 8 inputs work correctly
- 8 outputs display correctly
- Input type cycling works
- Visual feedback is clear
- Layout matches Java version

**Reference:** `src/screens/scenes/DefaultScenePanel.java`

---

### TICKET-018: Batch Simulation Scene Panel 🔴
**Priority:** High
**Effort:** 12-14 hours
**Status:** Not Started

**Description:**
Create batch simulation scene with tank filling animation.

**Tasks:**
- [ ] Create `components/SceneContainer/BatchSimulation/BatchSimulationPanel.tsx`
- [ ] Create `components/SceneContainer/BatchSimulation/TankSimulator.tsx`
- [ ] Create `components/SceneContainer/BatchSimulation/PushButton.tsx`
- [ ] Create `components/SceneContainer/BatchSimulation/RedIndicator.tsx`
- [ ] Implement tank with Canvas API
- [ ] Implement fill/drain physics
- [ ] Add 4 sensors (Low, Mid, High, Critical)
- [ ] Add control buttons
- [ ] Add alarm system (critical failure)
- [ ] Animate in real-time
- [ ] Add CSS styling

**Dependencies:** TICKET-016, TICKET-009

**Acceptance Criteria:**
- Tank fills and drains correctly
- Physics simulation is accurate
- Sensors trigger at correct levels
- Critical alarm works
- Animation is smooth (60fps)
- Layout matches Java version

**Reference:** `src/screens/scenes/BatchSimulationScenePanel.java`

---

## PHASE 5: Advanced Features (Week 6-7)

### TICKET-019: Theme System 🔴
**Priority:** Medium
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Implement 4 color themes matching Java version.

**Tasks:**
- [ ] Create `styles/themes.css`
- [ ] Define 4 theme palettes
- [ ] Create theme selector component
- [ ] Implement theme switching
- [ ] Persist theme in localStorage
- [ ] Apply theme to all components

**Dependencies:** TICKET-011

**Acceptance Criteria:**
- All 4 themes work
- Theme persists after refresh
- All components use theme colors

**Reference:** `src/ilcompiler/edit/Colors.java`

---

### TICKET-020: Internationalization (i18n) 🔴
**Priority:** Medium
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Implement 4-language support (PT-BR, EN, JA, DE).

**Tasks:**
- [ ] Set up react-i18next
- [ ] Create `i18n/locales/pt-BR.json`
- [ ] Create `i18n/locales/en.json`
- [ ] Create `i18n/locales/ja.json`
- [ ] Create `i18n/locales/de.json`
- [ ] Translate all UI strings
- [ ] Add language selector to menu
- [ ] Persist language in localStorage

**Dependencies:** TICKET-011

**Acceptance Criteria:**
- All 4 languages work
- Language persists after refresh
- All strings are translated
- No missing translations

**Reference:** `src/ilcompiler/edit/Language.java`

---

### TICKET-021: Help and About Dialogs 🔴
**Priority:** Low
**Effort:** 3-4 hours
**Status:** Not Started

**Description:**
Create help and about modal dialogs.

**Tasks:**
- [ ] Create `components/Dialogs/HelpDialog.tsx`
- [ ] Create `components/Dialogs/AboutDialog.tsx`
- [ ] Add IL instruction reference
- [ ] Add usage instructions
- [ ] Add about information
- [ ] Make dialogs closable
- [ ] Add internationalization

**Dependencies:** TICKET-011

**Acceptance Criteria:**
- Dialogs open/close correctly
- Content is readable
- Internationalization works

**Reference:**
- `src/screens/HelpPopUp.java`
- `src/screens/SobrePopup.java`

---

## PHASE 6: Electron & Desktop (Week 7-8)

### TICKET-022: Electron Setup 🔴
**Priority:** High
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Set up Electron for desktop deployment.

**Tasks:**
- [ ] Add electron dependencies
- [ ] Create `electron/main.js`
- [ ] Configure window settings
- [ ] Set up IPC communication (if needed)
- [ ] Configure build scripts
- [ ] Add development mode
- [ ] Test hot reload

**Dependencies:** TICKET-001

**Acceptance Criteria:**
- Electron window opens
- React app loads in Electron
- Dev tools accessible
- Hot reload works

---

### TICKET-023: Windows Installer 🔴
**Priority:** High
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create Windows installer using electron-builder.

**Tasks:**
- [ ] Add electron-builder dependency
- [ ] Configure electron-builder.json
- [ ] Set up NSIS installer options
- [ ] Add application icon
- [ ] Configure auto-update (optional)
- [ ] Build installer
- [ ] Test installation on Windows

**Dependencies:** TICKET-022

**Acceptance Criteria:**
- .exe installer created
- Installer works on Windows 10/11
- Application installs correctly
- Uninstaller works

---

### TICKET-024: Desktop File Access 🔴
**Priority:** Medium
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Implement proper file dialogs for desktop app.

**Tasks:**
- [ ] Use Electron dialog API for file open
- [ ] Use Electron dialog API for file save
- [ ] Replace web Blob API with fs module
- [ ] Add file type filters (.txt)
- [ ] Add default file locations

**Dependencies:** TICKET-022

**Acceptance Criteria:**
- Native file dialogs work
- Files save/load correctly
- File filters work

---

## PHASE 7: Testing & Quality (Week 8-9)

### TICKET-025: Unit Tests 🔴
**Priority:** High
**Effort:** 8-10 hours
**Status:** Not Started

**Description:**
Write comprehensive unit tests for services.

**Tasks:**
- [ ] Test interpreter.ts (all 12 instructions)
- [ ] Test memory.ts (timers, counters)
- [ ] Test input.ts (all input types)
- [ ] Test output.ts
- [ ] Test fileIO.ts
- [ ] Achieve >80% coverage

**Dependencies:** TICKET-003-006

**Acceptance Criteria:**
- All tests pass
- Code coverage >80%
- Edge cases tested

---

### TICKET-026: Component Tests 🔴
**Priority:** Medium
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Write component tests using React Testing Library.

**Tasks:**
- [ ] Test MainWindow
- [ ] Test ControlPanel
- [ ] Test CodeEditor
- [ ] Test DefaultScenePanel
- [ ] Test input/output interactions

**Dependencies:** TICKET-010-018

**Acceptance Criteria:**
- Component tests pass
- User interactions tested
- Accessibility verified

---

### TICKET-027: Integration Tests 🔴
**Priority:** Medium
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Write integration tests for full workflows.

**Tasks:**
- [ ] Test complete scan cycle
- [ ] Test program execution
- [ ] Test file save/load
- [ ] Test scene interactions

**Dependencies:** TICKET-008

**Acceptance Criteria:**
- Integration tests pass
- Critical paths covered

---

### TICKET-028: E2E Tests 🔴
**Priority:** Low
**Effort:** 8-10 hours
**Status:** Not Started

**Description:**
Write end-to-end tests using Cypress or Playwright.

**Tasks:**
- [ ] Set up Cypress/Playwright
- [ ] Test full user workflows
- [ ] Test both scenes
- [ ] Test mode transitions
- [ ] Test file operations

**Dependencies:** All previous tickets

**Acceptance Criteria:**
- E2E tests pass
- Critical user journeys covered

---

### TICKET-029: Performance Optimization 🔴
**Priority:** Medium
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Optimize application performance.

**Tasks:**
- [ ] Add React.memo where appropriate
- [ ] Optimize re-renders
- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Test on low-end devices

**Dependencies:** All component tickets

**Acceptance Criteria:**
- 100ms scan cycle maintained
- UI remains responsive
- Bundle size <500KB (gzipped)
- Lighthouse score >90

---

### TICKET-030: Cross-Browser Testing 🔴
**Priority:** Medium
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Test on multiple browsers and platforms.

**Tasks:**
- [ ] Test on Chrome (Windows, Mac, Linux)
- [ ] Test on Firefox
- [ ] Test on Safari (Mac only)
- [ ] Test on Edge
- [ ] Fix browser-specific issues
- [ ] Document browser support

**Dependencies:** All previous tickets

**Acceptance Criteria:**
- Works on all major browsers
- No console errors
- Visual consistency maintained

---

## PHASE 8: Documentation & Examples (Week 9)

### TICKET-031: Example Programs 🔴
**Priority:** High
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create 3+ example IL programs demonstrating all features.

**Tasks:**
- [ ] Create example 1: Basic logic (AND, OR, NOT)
- [ ] Create example 2: Timers (TON, TOFF)
- [ ] Create example 3: Counters (CTU, CTD)
- [ ] Create example 4: Batch simulation program
- [ ] Add comments to examples
- [ ] Save examples as .txt files
- [ ] Add "Load Example" menu option

**Dependencies:** TICKET-006

**Acceptance Criteria:**
- All examples work correctly
- Examples demonstrate all features
- Examples are well-commented

---

### TICKET-032: User Documentation 🔴
**Priority:** Medium
**Effort:** 6-8 hours
**Status:** Not Started

**Description:**
Create comprehensive user documentation.

**Tasks:**
- [ ] Create README.md for web version
- [ ] Document IL instruction set
- [ ] Document user interface
- [ ] Document keyboard shortcuts
- [ ] Create quick start guide
- [ ] Add troubleshooting section
- [ ] Add screenshots

**Dependencies:** All previous tickets

**Acceptance Criteria:**
- Documentation is complete
- All features documented
- Easy to understand

---

### TICKET-033: Developer Documentation 🔴
**Priority:** Low
**Effort:** 4-6 hours
**Status:** Not Started

**Description:**
Create developer documentation for future maintenance.

**Tasks:**
- [ ] Document architecture
- [ ] Document state management
- [ ] Document component hierarchy
- [ ] Add JSDoc comments
- [ ] Create contribution guide
- [ ] Document build process

**Dependencies:** All previous tickets

**Acceptance Criteria:**
- Developers can understand codebase
- Build process is clear
- Contributing guide is helpful

---

## Summary Statistics

**Total Tickets:** 33
**Estimated Total Effort:** 200-280 hours (5-7 weeks)

**By Priority:**
- Critical: 9 tickets
- High: 10 tickets
- Medium: 11 tickets
- Low: 3 tickets

**By Status:**
- 🔴 Not Started: 32 tickets
- 🟡 In Progress: 1 ticket
- 🟢 Completed: 0 tickets

---

## Notes

- Tickets can be worked on in parallel if dependencies are met
- Estimated effort assumes 1 developer working full-time
- Some tickets can be completed faster with experience
- Testing tickets should be done alongside development
- Documentation should be updated continuously

---

**Last Updated:** 2025-11-11
**Next Review:** Weekly
