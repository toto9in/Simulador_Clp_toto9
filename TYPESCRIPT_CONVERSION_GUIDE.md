# TypeScript/React Conversion Guide

## Executive Summary

This document provides a roadmap for converting the Java-based PLC Simulator to a modern TypeScript/React web application while maintaining all functionality and improving the user experience.

---

## Phase 1: Architecture Mapping

### Java Component → TypeScript/React Equivalent

#### Global State Management
- **Java:** `HomePageModel` (static singleton)
- **React:** Context API + useState or Redux Toolkit
- **Key State:**
  ```typescript
  interface PLCState {
    inputs: Record<string, boolean>;
    inputsType: Record<string, InputType>;
    outputs: Record<string, boolean>;
    memoryVariables: Record<string, MemoryVariable>;
    mode: ExecutionMode;
    theme: ThemeType;
    language: Language;
  }
  ```

#### Core Logic (Can be Pure TypeScript)
- **Java:** `Interpreter.java`, `MemoryVariable.java`
- **React:** Pure TypeScript services (NO REACT DEPENDENCY)
- **Benefit:** Logic can be tested independently, used in workers

```typescript
// services/interpreter.ts
export class Interpreter {
  static executeInstruction(
    operator: string,
    variables: string[],
    state: PLCState
  ): PLCState { ... }
}

// services/memory.ts
export class MemoryVariable {
  id: string;
  currentValue: boolean;
  counter: number;
  // ... implementation
}
```

#### Controllers → Custom Hooks
- **Java:** `HomePageController`, `BatchSimulatorController`
- **React:** Custom hooks (useExecutionCycle, useBatchSimulator)

```typescript
// hooks/useExecutionCycle.ts
export function useExecutionCycle(state: PLCState): {
  runCycle: () => void;
  updateTimersState: () => void;
  stopTimers: () => void;
}

// hooks/useBatchSimulator.ts
export function useBatchSimulator(): {
  tankFillHeight: number;
  startFilling: () => void;
  startDraining: () => void;
}
```

#### UI Screens → React Components
- **Java:** `HomePg.java` (1100 lines)
- **React:** Functional component with subcomponents

```typescript
// components/MainWindow.tsx
function MainWindow() {
  const [state, dispatch] = useContext(PLCStateContext);
  
  return (
    <div className="main-window">
      <MenuBar />
      <ControlPanel />
      <SceneContainer />
      <CodeEditor />
      <StatusPanel />
    </div>
  );
}
```

#### Scene System → Polymorphic Components
- **Java:** `IScenePanel` interface
- **React:** Pattern using union types + conditional rendering

```typescript
// types/scenes.ts
export type SceneType = DefaultScene | BatchSimulationScene;

export interface DefaultScene {
  type: 'default';
  // props
}

export interface BatchSimulationScene {
  type: 'batch';
  // props
}

// components/SceneContainer.tsx
function SceneContainer({ scene }: { scene: SceneType }) {
  switch(scene.type) {
    case 'default':
      return <DefaultScenePanel scene={scene} />;
    case 'batch':
      return <BatchSimulationScenePanel scene={scene} />;
  }
}
```

#### Custom Components → Web Components or Custom React Components
- **Java:** `PushButton`, `RedIndicator`
- **React:** Styled Components / Tailwind CSS + Canvas/SVG

```typescript
// components/PushButton.tsx
interface PushButtonProps {
  inputKey: string;
  type: InputType;
  palette: 'gray' | 'red';
  onPressed: (key: string) => void;
  onReleased: (key: string) => void;
}

function PushButton({ inputKey, type, palette, onPressed, onReleased }: PushButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <div
      className={`push-button ${palette} ${isPressed ? 'pressed' : ''}`}
      onMouseDown={() => { setIsPressed(true); onPressed(inputKey); }}
      onMouseUp={() => { setIsPressed(false); onReleased(inputKey); }}
    />
  );
}
```

#### Graphics → Canvas/SVG
- **Java:** Graphics2D for tank simulation
- **React:** HTML Canvas + requestAnimationFrame

```typescript
// components/TankSimulator.tsx
function TankSimulator({ fillHeight }: { fillHeight: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Draw tank and fill
    ctx?.fillRect(178, 330 - fillHeight, 321, fillHeight);
  }, [fillHeight]);
  
  return <canvas ref={canvasRef} width={600} height={400} />;
}
```

#### File I/O → Web APIs
- **Java:** FileWriter, FileReader
- **React:** File API, Blob, download

```typescript
// services/fileIO.ts
export function saveProgramToFile(program: string[], filename: string) {
  const content = program.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();
}

export async function loadProgramFromFile(file: File): Promise<string[]> {
  const text = await file.text();
  return text.split('\n');
}
```

---

## Phase 2: Project Structure

### Recommended Directory Layout

```
src/
├── types/                          # TypeScript type definitions
│   ├── plc.ts                     # Core PLC types
│   ├── scenes.ts                  # Scene definitions
│   └── ui.ts                      # UI component types
│
├── services/                       # Pure business logic (NO React)
│   ├── interpreter.ts             # IL instruction execution
│   ├── memory.ts                  # MemoryVariable implementation
│   ├── input.ts                   # InputActions equivalent
│   ├── output.ts                  # OutputActions equivalent
│   ├── fileIO.ts                  # Save/load operations
│   └── timer.ts                   # Timer management
│
├── hooks/                          # React custom hooks
│   ├── useExecutionCycle.ts       # 100ms scan cycle
│   ├── useBatchSimulator.ts       # Tank physics
│   ├── useLanguage.ts             # Language switching
│   ├── useTheme.ts                # Theme management
│   └── usePLCState.ts             # State management
│
├── context/                        # React Context
│   ├── PLCStateContext.ts         # Global state
│   └── UIContext.ts               # UI state (theme, language)
│
├── components/                     # React components
│   ├── MainWindow/
│   │   ├── MainWindow.tsx         # Main container
│   │   ├── MenuBar.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── StatusPanel.tsx
│   │   └── MainWindow.css
│   │
│   ├── SceneContainer/
│   │   ├── SceneContainer.tsx
│   │   ├── DefaultScene/
│   │   │   ├── DefaultScenePanel.tsx
│   │   │   ├── InputButton.tsx
│   │   │   ├── OutputLED.tsx
│   │   │   └── DefaultScene.css
│   │   │
│   │   └── BatchSimulation/
│   │       ├── BatchSimulationPanel.tsx
│   │       ├── TankSimulator.tsx
│   │       ├── PushButton.tsx
│   │       ├── RedIndicator.tsx
│   │       └── BatchSimulation.css
│   │
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   └── DataTable.css
│   │
│   ├── Dialogs/
│   │   ├── HelpDialog.tsx
│   │   ├── AboutDialog.tsx
│   │   └── ErrorDialog.tsx
│   │
│   └── Common/
│       ├── Button.tsx
│       ├── ThemeSelector.tsx
│       └── LanguageSelector.tsx
│
├── styles/                         # Global styles
│   ├── themes.css                 # 4 color themes
│   ├── variables.css              # CSS variables
│   └── index.css                  # Global styles
│
├── i18n/                           # Internationalization
│   ├── config.ts                  # i18next config
│   ├── locales/
│   │   ├── pt-BR.json
│   │   ├── en.json
│   │   ├── ja.json
│   │   └── de.json
│
├── utils/                          # Utility functions
│   ├── constants.ts               # Constants (16 inputs/outputs, etc)
│   ├── validators.ts              # Input validation
│   └── formatters.ts              # Data formatting
│
├── App.tsx                         # Root component
├── App.css
└── index.tsx                       # Entry point
```

---

## Phase 3: Technology Stack Recommendations

### Core
- **Framework:** React 18+
- **Language:** TypeScript 5+
- **Build Tool:** Vite (faster than webpack)
- **Package Manager:** npm or pnpm

### State Management
- **Option 1:** React Context + useReducer (simple, sufficient for this project)
- **Option 2:** Redux Toolkit (if complex state interactions needed)
- **Option 3:** Zustand (lightweight, modern)

### Styling
- **Option 1:** Tailwind CSS + CSS Modules (recommended)
- **Option 2:** Styled-Components
- **Option 3:** CSS-in-JS (Emotion)

### Graphics/Canvas
- **Canvas:** Native Canvas API with requestAnimationFrame
- **SVG:** Inline SVG for simple shapes
- **Optional:** Konva.js if more complex visualizations needed

### Internationalization
- **Library:** `react-i18next` with `i18next`
- **Easy language switching, same 4 languages**

### Testing
- **Unit Tests:** Vitest (faster Jest alternative)
- **Component Tests:** React Testing Library
- **E2E Tests:** Cypress or Playwright

### Development Tools
- **Linting:** ESLint + Prettier
- **TypeScript:** Strict mode enabled
- **Chrome DevTools:** React Developer Tools extension

### Additional Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^13.0.0",
    "i18next": "^23.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## Phase 4: Implementation Strategy

### Step 1: Foundation (Week 1-2)
- [ ] Setup Vite + React + TypeScript project
- [ ] Create type definitions (PLC types)
- [ ] Implement pure TS services:
  - Interpreter
  - MemoryVariable
  - Input/Output management
  - Timer management
- [ ] Unit test services

### Step 2: State Management (Week 2-3)
- [ ] Create PLCState context
- [ ] Implement useReducer for state updates
- [ ] Create custom hooks (useExecutionCycle, etc)
- [ ] Setup i18n

### Step 3: Main UI Components (Week 3-5)
- [ ] MainWindow component
- [ ] MenuBar with File/Edit options
- [ ] ControlPanel with buttons
- [ ] CodeEditor with syntax highlighting
- [ ] StatusPanel for timers/counters
- [ ] DataTable component

### Step 4: Scene System (Week 5-6)
- [ ] DefaultScenePanel with:
  - InputButton components
  - OutputLED components
  - Visual state management
- [ ] BatchSimulationScenePanel with:
  - TankSimulator Canvas
  - PushButton custom component
  - RedIndicator custom component
  - Critical failure detection

### Step 5: Advanced Features (Week 6-7)
- [ ] File I/O (save/load)
- [ ] Theme switching
- [ ] Language switching
- [ ] Help/About dialogs
- [ ] DataTable sorting/filtering

### Step 6: Optimization & Polish (Week 7-8)
- [ ] Performance optimization
- [ ] Responsive design
- [ ] Accessibility (a11y)
- [ ] Browser testing
- [ ] E2E tests

---

## Phase 5: Key Implementation Challenges & Solutions

### Challenge 1: 100ms Scan Cycle Timing
**Problem:** Maintaining precise timing in browser
**Solution:**
```typescript
function useExecutionCycle(state: PLCState) {
  useEffect(() => {
    if (state.mode !== 'RUNNING') return;
    
    const interval = setInterval(() => {
      // Run one cycle
      // Capture start time to check if cycle took too long
      const startTime = performance.now();
      
      const newState = runCycle(state);
      dispatch({ type: 'UPDATE_STATE', payload: newState });
      
      const duration = performance.now() - startTime;
      if (duration > 100) console.warn(`Cycle took ${duration}ms`);
    }, 100);
    
    return () => clearInterval(interval);
  }, [state.mode]);
}
```

### Challenge 2: Synchronizing Canvas Animation with State
**Problem:** Tank fill animation must match state updates
**Solution:**
```typescript
function TankSimulator({ fillHeight }: { fillHeight: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Clear and redraw based on state
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    // Draw tank with current fillHeight
    
    frameRef.current = requestAnimationFrame(draw);
  }, [fillHeight]);
  
  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current!);
  }, [draw]);
}
```

### Challenge 3: Complex State Updates
**Problem:** Multiple components updating shared state
**Solution:** Use useReducer with action types
```typescript
type PLCAction =
  | { type: 'SET_INPUT'; key: string; value: boolean }
  | { type: 'SET_OUTPUT'; key: string; value: boolean }
  | { type: 'UPDATE_MEMORY'; variables: Record<string, MemoryVariable> }
  | { type: 'SET_MODE'; mode: ExecutionMode };

function plcReducer(state: PLCState, action: PLCAction): PLCState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        inputs: { ...state.inputs, [action.key]: action.value }
      };
    // ... other cases
  }
}
```

### Challenge 4: Input Type Cycling
**Problem:** Right-click cycles through SWITCH → NO → NC
**Solution:** Use context menu handler
```typescript
function InputButton({ inputKey }: { inputKey: string }) {
  const [, dispatch] = useContext(PLCStateContext);
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const currentType = state.inputsType[inputKey];
    const types: InputType[] = ['SWITCH', 'NO', 'NC'];
    const nextType = types[(types.indexOf(currentType) + 1) % types.length];
    
    dispatch({ type: 'SET_INPUT_TYPE', key: inputKey, inputType: nextType });
  };
  
  return (
    <div onContextMenu={handleContextMenu} onMouseDown={...} />
  );
}
```

### Challenge 5: Code Editor with Syntax Highlighting
**Problem:** Need uppercase auto-conversion + optional syntax highlighting
**Solution:** Use CodeMirror or Monaco Editor
```typescript
import { useCallback } from 'react';

function CodeEditor() {
  const [code, setCode] = useState('');
  
  const handleChange = useCallback((value: string) => {
    // Auto-uppercase
    setCode(value.toUpperCase());
  }, []);
  
  return (
    <textarea
      value={code}
      onChange={(e) => handleChange(e.target.value)}
      style={{ fontFamily: 'monospace' }}
    />
  );
}

// Or with CodeMirror:
import { CodeMirror } from '@uiw/react-codemirror';

function CodeEditorPro() {
  return (
    <CodeMirror
      height="200px"
      onChange={(val) => setCode(val.toUpperCase())}
      extensions={[...]}
    />
  );
}
```

---

## Phase 6: Migration Path from Java

### Option A: Complete Rewrite (Recommended for new features)
1. Parallel development of React version
2. Test against same IL programs
3. Gradual UI improvement
4. Eventually replace Java app

### Option B: Gradual Migration (Safer, longer timeline)
1. Keep Java backend running
2. Build React frontend
3. Use API to communicate with Java
4. Gradually migrate services to TypeScript

### Option C: Electron Wrapper (Hybrid)
1. Keep Java logic intact
2. Build Electron app with React frontend
3. Communication via WebSockets or IPC

---

## Phase 7: Testing Strategy

### Unit Tests (Services)
```typescript
// __tests__/services/interpreter.test.ts
describe('Interpreter', () => {
  it('should execute LD instruction', () => {
    const state = { inputs: { 'I0.0': true }, ... };
    const result = Interpreter.executeInstruction('LD', ['I0.0'], state);
    expect(result.accumulator).toBe(true);
  });
  
  it('should handle AND operation', () => {
    // Test AND logic...
  });
});
```

### Component Tests
```typescript
// __tests__/components/InputButton.test.tsx
describe('InputButton', () => {
  it('should toggle on left click', () => {
    const { getByRole } = render(<InputButton inputKey="I0.0" />);
    fireEvent.mouseDown(getByRole('button'));
    // Verify state changed
  });
  
  it('should cycle types on right click', () => {
    // Test right-click cycling
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/scanCycle.test.ts
describe('Scan Cycle', () => {
  it('should execute complete cycle', async () => {
    // Create initial state
    // Run cycle
    // Verify outputs updated correctly
  });
});
```

### E2E Tests
```typescript
// cypress/e2e/plc-simulator.cy.ts
describe('PLC Simulator', () => {
  it('should load program and run successfully', () => {
    cy.visit('/');
    cy.get('[data-testid="code-editor"]').type('LD I0.0\nST Q1.0');
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="input-button-I0.0"]').click();
    cy.get('[data-testid="output-led-Q1.0"]').should('be.active');
  });
});
```

---

## Phase 8: Performance Considerations

### Optimization Techniques

1. **Memoization**
   ```typescript
   const MemoizedScenePanel = React.memo(DefaultScenePanel);
   const memoizedCycle = useCallback(() => { ... }, [dependencies]);
   ```

2. **Code Splitting**
   ```typescript
   const BatchSimulation = React.lazy(() => import('./BatchSimulation'));
   
   <Suspense fallback={<Loading />}>
     <BatchSimulation />
   </Suspense>
   ```

3. **Web Workers** (for heavy computation)
   ```typescript
   // services/interpreterWorker.ts
   // Run interpreter in separate thread
   ```

4. **Virtual Scrolling** (if many variables)
   ```typescript
   import { FixedSizeList } from 'react-window';
   ```

5. **Debounced State Updates**
   ```typescript
   const debounceUpdate = useMemo(
     () => debounce((value) => dispatch(...), 50),
     []
   );
   ```

---

## Phase 9: Deployment

### Web Deployment
- **Static hosting:** Netlify, Vercel, GitHub Pages
- **Build:** `npm run build` → `dist/` folder
- **Environment variables** for API endpoints (if using backend)

### Electron Desktop App
```bash
npm install electron electron-builder
npx electron-builder
# Creates .exe, .dmg, .AppImage
```

### Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## Phase 10: Migration Checklist

- [ ] Core interpreter tested in TypeScript
- [ ] All 12 instructions working
- [ ] State management working
- [ ] 100ms cycle accurate
- [ ] Timer/counter logic verified
- [ ] All 4 input types working
- [ ] All 16 inputs/outputs functional
- [ ] DefaultScene visually complete
- [ ] BatchSimulation functional
- [ ] File I/O working
- [ ] All 4 languages working
- [ ] All 4 themes working
- [ ] DataTable complete
- [ ] Help/About dialogs
- [ ] Error handling for all edge cases
- [ ] Performance optimization complete
- [ ] Accessibility compliance
- [ ] Cross-browser testing done
- [ ] Unit tests > 80% coverage
- [ ] E2E tests critical paths covered
- [ ] Production build optimized
- [ ] Documentation complete

---

## Estimated Timeline

| Phase | Duration | Effort |
|-------|----------|--------|
| Foundation | 2 weeks | High setup, moderate coding |
| State Management | 1 week | Moderate |
| Main UI | 2 weeks | High coding |
| Scene System | 1.5 weeks | High coding |
| Advanced Features | 1 week | Moderate |
| Optimization & Testing | 1.5 weeks | Moderate |
| **Total** | **8-9 weeks** | **~400-500 hours** |

---

## Success Criteria

- All 12 IL instructions work identically to Java version
- 100ms scan cycle maintained (±10ms tolerance)
- All 16 inputs and 16 outputs functional
- Both scenes (default and batch) complete
- File save/load working
- 4 languages and 4 themes functional
- Performance: <100ms input latency
- Unit test coverage >80%
- Zero console errors/warnings
- Works on Chrome, Firefox, Safari, Edge
- Mobile responsive (optional enhancement)

