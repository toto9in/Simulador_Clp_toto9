# PLC Simulator - Complete Documentation Index

Welcome! This directory contains comprehensive documentation for understanding and converting the Java-based PLC Simulator to TypeScript/React.

---

## Documentation Files

### 1. **ARCHITECTURE.md** (17 KB - 578 lines)
**Comprehensive technical architecture documentation**

Covers:
- Application entry points and project structure (28 Java classes)
- Complete PLC logic implementation:
  - Execution modes (IDLE, STOPPED, RUNNING)
  - Memory model (inputs, outputs, memory variables)
  - Input/output management (16 inputs, 16 outputs, 3 input types)
  - Memory variables (M, T timers, C counters with 100ms intervals)
  - IL interpreter with 12 supported instructions
- Scan cycle implementation (100ms refresh rate)
- UI components and interaction patterns:
  - Main window (1100px x 900px)
  - Scene system (polymorphic, 2 scenes)
  - Custom components (buttons, indicators)
- File I/O and persistence
- Operating modes and state machine
- Utility systems (color themes, language support, input validation)
- Design patterns used (singleton, observer, strategy, MVC)
- Execution flow diagrams
- Critical code flows with examples

**Best For:** Understanding the complete system architecture, logic flow, and technical implementation details

---

### 2. **FILE_INVENTORY.md** (5.3 KB - 119 lines)
**Complete file listing with descriptions**

Contains:
- All 28 Java files organized by function
- File purposes and responsibilities
- Project structure breakdown by layers:
  - Presentation Layer (UI)
  - Controller Layer (Business Logic)
  - Business Logic Layer (Core PLC)
  - Data Management Layer (State)
  - Utility Layer (Helpers)
- Key statistics (5,000+ lines of code)
- System metrics (16 inputs/outputs, 12 instructions, 4 themes, 4 languages)

**Best For:** Quick reference of what each file does, finding where to look for specific functionality

---

### 3. **TYPESCRIPT_CONVERSION_GUIDE.md** (20 KB - 743 lines)
**Step-by-step roadmap for converting to TypeScript/React**

Includes:
- Phase 1: Architecture mapping (Java → TypeScript/React equivalents)
- Phase 2: Recommended project structure for React
- Phase 3: Technology stack recommendations:
  - React 18+, TypeScript 5+, Vite build tool
  - State management options (Context API, Redux, Zustand)
  - Styling solutions (Tailwind, Styled-Components)
  - Graphics (Canvas API, SVG)
  - i18n support, testing frameworks
- Phase 4: Implementation strategy (8-9 weeks timeline)
- Phase 5: Key implementation challenges with code examples:
  - 100ms scan cycle timing
  - Canvas animation synchronization
  - Complex state updates
  - Input type cycling
  - Code editor with syntax highlighting
- Phase 6: Migration paths (Complete rewrite, Gradual, Hybrid)
- Phase 7: Comprehensive testing strategy
- Phase 8: Performance optimization techniques
- Phase 9: Deployment options (Web, Electron, Docker)
- Phase 10: Migration checklist and success criteria

**Best For:** Planning the conversion project, understanding implementation approach, estimated timeline (~400-500 hours)

---

### 4. **README.md** (Original project file)
**Project overview and features**

Contains:
- Institution and course information (IFTM, Engenharia de Computação)
- General project description
- List of mandatory features
- Supported instructions
- Operating modes
- Video demonstration links
- References

**Best For:** Project context and high-level overview

---

### 5. **QUICKSTART.md** (Original file)
**Quick start guide for Java version**

Contains:
- Build instructions
- Running the application
- Basic usage

**Best For:** Getting the Java version running (if needed for reference)

---

## Quick Navigation Guide

### I want to understand:

**The overall system architecture**
→ Read: ARCHITECTURE.md (Sections 1-2)

**Where specific functionality is located**
→ Read: FILE_INVENTORY.md

**How to execute the IL code**
→ Read: ARCHITECTURE.md (Section 2.6: Interpreter)

**How the scan cycle works**
→ Read: ARCHITECTURE.md (Section 3)

**UI component interactions**
→ Read: ARCHITECTURE.md (Section 4)

**Timer and counter logic**
→ Read: ARCHITECTURE.md (Section 2.5)

**How to convert to React**
→ Read: TYPESCRIPT_CONVERSION_GUIDE.md (Phases 1-4)

**Implementation challenges**
→ Read: TYPESCRIPT_CONVERSION_GUIDE.md (Phase 5 with code examples)

**Testing strategy**
→ Read: TYPESCRIPT_CONVERSION_GUIDE.md (Phase 7)

**Complete file list**
→ Read: FILE_INVENTORY.md

---

## Key Facts Quick Reference

### Core System
- **Language:** Instruction List (IL) - 12 instructions
- **Cycle Rate:** 100ms scan cycle
- **Inputs:** 16 total (I0.0-I0.7, I1.0-I1.7)
- **Outputs:** 16 total (Q0.0-Q0.7, Q1.0-Q1.7)
- **Memory Variables:** M (boolean), T (timers), C (counters)

### Input Types (3 options per input)
- **SWITCH:** Toggle on/off (stays in state)
- **NO:** Normally Open (pressed=true, released=false)
- **NC:** Normally Closed (pressed=false, released=true)

### Execution Modes (3 states)
- **IDLE:** Can edit, inputs/outputs disabled
- **RUNNING:** Actively executing, scan cycle active
- **STOPPED:** Paused, outputs retain state

### UI Features
- **Scenes:** 2 interactive scenes (default panel, batch simulator)
- **Themes:** 4 color themes
- **Languages:** 4 languages (PT-BR, EN, JA, DE)
- **Components:** Custom buttons, LEDs, indicators, tank simulation

### Supported IL Instructions
Data Movement: LD, LDN, ST, STN
Logic: AND, ANDN, OR, ORN
Timers: TON (on delay), TOFF (off delay)
Counters: CTU (count up), CTD (count down)

---

## File Statistics

| Document | Size | Lines | Purpose |
|----------|------|-------|---------|
| ARCHITECTURE.md | 17 KB | 578 | Complete technical reference |
| FILE_INVENTORY.md | 5.3 KB | 119 | File listing and organization |
| TYPESCRIPT_CONVERSION_GUIDE.md | 20 KB | 743 | Conversion roadmap with examples |
| Total Documentation | 42+ KB | 1800+ | Complete project documentation |

---

## Java Source Code Statistics

| Metric | Count |
|--------|-------|
| Total Java Files | 28 |
| Total Lines of Code | ~5,000+ |
| Main Window (HomePg) | 1,100 lines |
| Interpreter Engine | 466 lines |
| Scene Panel (Default) | 605 lines |
| Memory Variable | 142 lines |

---

## Technology Used

### Java Version
- **Framework:** Swing/AWT
- **Build System:** Gradle
- **Java Version:** 17
- **Main Dependency:** org.netbeans.external:AbsoluteLayout

### Recommended for React Version
- **Framework:** React 18+
- **Language:** TypeScript 5+
- **Build Tool:** Vite
- **State Management:** Context API + useReducer (or Redux/Zustand)
- **Styling:** Tailwind CSS + CSS Modules
- **Graphics:** Canvas API + SVG
- **i18n:** react-i18next
- **Testing:** Vitest + React Testing Library + Cypress

---

## Project Conversion Timeline

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Foundation | 2 weeks | Core PLC logic in TypeScript |
| State Management | 1 week | React Context setup |
| Main UI | 2 weeks | Components working |
| Scene System | 1.5 weeks | Both scenes complete |
| Advanced Features | 1 week | File I/O, themes, languages |
| Testing & Polish | 1.5 weeks | Optimized, tested |
| **Total** | **8-9 weeks** | **Production-ready web app** |

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│   Presentation Layer                    │
│   (screens/: HomePg, Scenes, Dialogs)   │
├─────────────────────────────────────────┤
│   Controller Layer                      │
│   (Controllers/: HomePageController)    │
├─────────────────────────────────────────┤
│   Business Logic Layer                  │
│   (ilcompiler/interpreter/: Interpreter)│
├─────────────────────────────────────────┤
│   Data Management Layer                 │
│   (Models/, Input/Output, Memory)       │
├─────────────────────────────────────────┤
│   Utility Layer                         │
│   (Colors, Language, Save, Filters)     │
└─────────────────────────────────────────┘
```

---

## Key Design Patterns

1. **Singleton Pattern** - HomePageModel for global state
2. **Observer Pattern** - InputEventListener for input events
3. **Strategy Pattern** - IScenePanel interface with multiple implementations
4. **MVC Pattern** - Models, Views, Controllers separation
5. **State Machine** - ExecutionMode controls application flow

---

## How to Use This Documentation

### For New Developers:
1. Start with **README.md** for context
2. Read **ARCHITECTURE.md Section 1** for project structure
3. Read **FILE_INVENTORY.md** to understand file organization
4. Deep dive into **ARCHITECTURE.md Sections 2-4** for specific systems

### For Architecture Review:
1. Study **ARCHITECTURE.md** completely
2. Review **Design Patterns** section (Section 9)
3. Examine **Execution Flow Diagram** (Section 10)

### For React Conversion:
1. Read **TYPESCRIPT_CONVERSION_GUIDE.md Phase 1** for mapping
2. Study **Phase 2** for recommended structure
3. Follow **Phases 3-6** for implementation
4. Use **Phase 7** for testing strategy
5. Reference **Phase 10 Checklist** for completion verification

### For Specific Features:
- **IL Instructions:** ARCHITECTURE.md Section 2.6
- **Timers/Counters:** ARCHITECTURE.md Section 2.5
- **Scan Cycle:** ARCHITECTURE.md Section 3
- **UI Interactions:** ARCHITECTURE.md Section 4
- **File I/O:** ARCHITECTURE.md Section 5

---

## Common Questions Answered

**Q: How many lines of code are we converting?**
A: Approximately 5,000+ lines across 28 Java files

**Q: How long will conversion take?**
A: 8-9 weeks (~400-500 development hours) following the roadmap

**Q: Can I reuse the core logic?**
A: Yes! The interpreter and PLC logic can be pure TypeScript, no React dependency

**Q: What about the UI?**
A: Needs to be reimplemented in React, but patterns are well-documented

**Q: Will it work exactly the same?**
A: Yes, all 12 instructions, 4 themes, 4 languages, both scenes will work identically

**Q: What about performance?**
A: React version should be faster with proper optimization (memoization, code splitting)

**Q: Can I deploy it as a web app?**
A: Yes! Build as static site (Netlify, Vercel) or as Electron desktop app

---

## Getting Started Checklist

- [ ] Read ARCHITECTURE.md Section 1 (project structure)
- [ ] Read FILE_INVENTORY.md (understand file organization)
- [ ] Review TYPESCRIPT_CONVERSION_GUIDE.md Phase 1 (component mapping)
- [ ] Skim through the actual Java source files mentioned in FILE_INVENTORY.md
- [ ] Create initial project structure following Phase 2 recommendations
- [ ] Implement core services (Interpreter, MemoryVariable) in pure TypeScript
- [ ] Setup React Context for state management
- [ ] Begin UI component development

---

## Additional Resources

**Original Java Project:**
- Repository: https://github.com/Diogo-NB/SimuladorClp
- Based on: https://github.com/IasminPieraco/Trabalho-Final-CLP

**Learning References:**
- IL Programming: https://www.youtube.com/watch?v=e-C53fbtbfo
- Example Code: https://github.com/Diogo-NB/SimuladorClp/tree/master/examples

**React Learning:**
- React Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/

**State Management:**
- Redux Toolkit: https://redux-toolkit.js.org
- Zustand: https://github.com/pmndrs/zustand
- Context API: https://react.dev/reference/react/useContext

---

## Document Maintenance

**Last Updated:** November 11, 2025
**Documentation Version:** 1.0
**Coverage:** Complete Java codebase analysis

If you have questions or need clarification on any aspect, refer to:
1. The specific architecture document section
2. The corresponding Java source file (listed in FILE_INVENTORY.md)
3. The conversion guide phase for implementation details

---

**Ready to convert? Start with TYPESCRIPT_CONVERSION_GUIDE.md Phase 1!**
