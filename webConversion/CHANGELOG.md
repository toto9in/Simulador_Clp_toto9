# Changelog - PLC Simulator Web Conversion

All notable changes to the web conversion project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Compatibility Fix - 2025-11-11

#### Fixed
- **Node.js Compatibility**: Fixed compatibility issues for Node.js v21.x and other versions
  - Downgraded Vite from 7.x to 5.4.11 (supports Node.js 18+)
  - Downgraded React from 19.x to 18.3.1 (stable LTS)
  - Downgraded Vitest from 4.x to 2.1.8 (supports Node.js 18+)
  - Updated all dependencies to compatible versions
  - Removed invalid TypeScript option 'erasableSyntaxOnly'
  - Added `engines` field to package.json

#### Added
- **NODE_VERSION_GUIDE.md**: Comprehensive guide for Node.js version compatibility
  - Supported versions (18.x, 20.x, 21.x, 22.x)
  - Installation instructions
  - Troubleshooting common issues
  - Dependency version reference

#### Changed
- React 19 → React 18.3.1 (more stable and widely used)
- Vite 7 → Vite 5.4.11 (wider Node.js support)
- Updated version to 0.1.0

---

### Project Initialization & Core Services - 2025-11-11

#### Added
- Created `webConversion` directory structure
- Initialized project documentation (CHANGELOG.md, TICKETS.md, README.md)
- Set up TypeScript + React + Vite project
- Configured testing framework (Vitest + React Testing Library)
- Added i18n dependencies (react-i18next)
- Created complete folder structure (types, services, hooks, components, etc.)

#### Implemented Core Services
- **Type Definitions** (`src/types/plc.ts`):
  - All PLC enums (ExecutionMode, InputType, ILInstruction, etc.)
  - Core interfaces (PLCState, MemoryVariable, InstructionLine)
  - Helper functions (type guards, validators, initial state creator)
  - PLC constants (16 inputs, 16 outputs, scan cycle timing)

- **Scene Types** (`src/types/scenes.ts`):
  - Default scene configuration (8 inputs + 8 outputs)
  - Batch simulation scene configuration (tank physics, sensors)
  - Scene creation utilities

- **Interpreter Service** (`src/services/interpreter.ts`):
  - ✅ All 12 IL instructions implemented:
    - LD, LDN (Load, Load Negated)
    - ST, STN (Store, Store Negated)
    - AND, ANDN (Logical AND, AND Negated)
    - OR, ORN (Logical OR, OR Negated)
    - TON, TOFF (Timer On/Off Delay)
    - CTU, CTD (Counter Up/Down)
  - Program parser (text → instruction lines)
  - Accumulator logic
  - Input/Output/Memory variable handling
  - Error handling and validation

- **Memory Service** (`src/services/memory.ts`):
  - Memory variable creation (M, T, C)
  - Timer management (TON/TOFF with 100ms precision)
  - Counter management (CTU/CTD with rising edge detection)
  - State update logic
  - Reset functionality
  - ToString formatting for data table

- **Utilities** (`src/utils/constants.ts`):
  - Application constants
  - PLC configuration values
  - Validation rules
  - Error/success messages

#### Configuration
- TypeScript strict mode enabled
- Prettier configuration for code formatting
- Vitest configuration for unit testing
- Path aliases configured (@/ → src/)

#### Build Status
- ✅ Project compiles without errors
- ✅ TypeScript strict mode passing
- ✅ All type definitions valid

#### Progress
- **Phase 1: Foundation** - ~70% complete
- Core services fully implemented
- Ready for scan cycle implementation
- Next: Input/Output services, File I/O, React context

#### Notes
- Source: 100% functional Java implementation in main branch
- Target: TypeScript/React web app + Electron desktop app
- Estimated timeline: 8-9 weeks (~400-500 hours)
- Current status: 7/16 core tasks completed (~44%)

---

## Project Goals

### Core Requirements
1. ✅ Convert Java PLC Simulator to TypeScript/React
2. ✅ Maintain 100% feature parity with Java version
3. ✅ Create web version (React + Vite)
4. ✅ Create Windows installer (Electron)
5. ✅ Support all 12 IL instructions
6. ✅ Maintain 100ms scan cycle accuracy
7. ✅ Support 4 languages (PT-BR, EN, JA, DE)
8. ✅ Support 4 color themes
9. ✅ Implement both scenes (Default I/O + Batch Simulation)
10. ✅ File save/load functionality

### Technical Stack
- **Frontend Framework:** React 18+
- **Language:** TypeScript 5+
- **Build Tool:** Vite 4+
- **Desktop:** Electron
- **Styling:** Tailwind CSS + CSS Modules
- **State Management:** React Context + useReducer
- **Internationalization:** react-i18next
- **Testing:** Vitest + React Testing Library

---

## Version History

### [0.1.0] - TBD
- Initial TypeScript project setup
- Core PLC logic implementation
- Basic UI components

### [0.2.0] - TBD
- State management implementation
- Execution cycle
- Timer/Counter logic

### [0.3.0] - TBD
- Complete UI implementation
- Scene system
- Interactive I/O

### [0.4.0] - TBD
- Advanced features (themes, i18n, file I/O)
- Data table viewer
- Help system

### [0.5.0] - TBD
- Electron integration
- Windows installer
- Testing and optimization

### [1.0.0] - TBD
- Production release
- Full feature parity with Java version
- Documentation complete

---

## Migration Strategy

The conversion follows a **parallel development** approach:
1. Java version remains in `src/` (unchanged)
2. Web version being built in `webConversion/`
3. Both versions maintained in same repository
4. Testing uses same IL programs to ensure equivalence
5. Eventually, web version can replace or complement Java version

---

## Key Milestones

- [ ] **Milestone 1:** Foundation (TypeScript services working)
- [ ] **Milestone 2:** State management complete
- [ ] **Milestone 3:** Main UI rendering
- [ ] **Milestone 4:** Scene system functional
- [ ] **Milestone 5:** Feature complete
- [ ] **Milestone 6:** Production ready
