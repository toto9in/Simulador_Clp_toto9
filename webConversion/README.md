# PLC Simulator - Web Conversion

> 🚀 Converting the 100% functional Java PLC Simulator to a modern TypeScript/React web application with Electron desktop support.

## 📋 Project Overview

This is the web conversion of the **Simulador de CLP** (PLC Simulator) - an educational tool for simulating Programmable Logic Controllers using Instruction List (IL) programming language.

### Original Project
- **Location:** `../src/` (main branch)
- **Language:** Java (Swing/AWT)
- **Status:** ✅ 100% Functional

### Web Conversion
- **Location:** `./webConversion/`
- **Language:** TypeScript + React
- **Status:** 🚧 In Development
- **Target:** Web Application + Windows Desktop (Electron)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Linting
npm run lint         # Check for linting errors
npm run format       # Format code with Prettier (TBD)

# Electron (Desktop)
npm run electron:dev     # Start Electron in dev mode (TBD)
npm run electron:build   # Build Electron app (TBD)
npm run electron:dist    # Create Windows installer (TBD)
```

---

## 📁 Project Structure

```
webConversion/
├── docs/                       # Project documentation
│   ├── TICKETS.md             # Development tickets/tasks
│   └── ARCHITECTURE.md        # Technical architecture (TBD)
│
├── public/                     # Static assets
│   └── examples/              # Example IL programs (TBD)
│
├── src/                        # Source code
│   ├── types/                 # TypeScript type definitions (TBD)
│   ├── services/              # Pure business logic (TBD)
│   ├── hooks/                 # React custom hooks (TBD)
│   ├── context/               # React Context providers (TBD)
│   ├── components/            # React components (TBD)
│   ├── i18n/                  # Internationalization (TBD)
│   ├── styles/                # Global styles (TBD)
│   ├── utils/                 # Utility functions (TBD)
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── package.json              # Dependencies
├── CHANGELOG.md              # Version history
└── README.md                 # This file
```

---

## 🎯 Goals & Features

### Core Requirements
- ✅ **12 IL Instructions:** LD, LDN, ST, STN, AND, ANDN, OR, ORN, TON, TOFF, CTU, CTD
- ✅ **16 Digital Inputs** + **16 Digital Outputs**
- ✅ **32+ Memory Variables** (Timers & Counters)
- ✅ **3 Operating Modes:** PROGRAM, STOP, RUN
- ✅ **100ms Scan Cycle**
- ✅ **2 Interactive Scenes**
- ✅ **Data Table Viewer**
- ✅ **File I/O** (Save/Load programs)
- ✅ **4 Languages:** PT-BR, EN, JA, DE
- ✅ **4 Color Themes**

---

## 📖 Documentation

- **Development Tasks:** [docs/TICKETS.md](docs/TICKETS.md) ✅
- **Changelog:** [CHANGELOG.md](CHANGELOG.md) ✅
- **Original Java Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md) ✅
- **TypeScript Conversion Guide:** [../TYPESCRIPT_CONVERSION_GUIDE.md](../TYPESCRIPT_CONVERSION_GUIDE.md) ✅

---

## 🔧 Development Status

**Phase 1:** Foundation 🟡 In Progress
**Progress:** 3 / 33 tickets completed (~9%)

See [docs/TICKETS.md](docs/TICKETS.md) for detailed progress.

---

**Last Updated:** 2025-11-11
**Estimated Completion:** 2026-01-06
