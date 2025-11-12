# Complete File Inventory

## Core Entry Point
- `/home/user/Simulador_Clp/src/SimuladorClp.java` - Main application entry point

## Models (State Management)
- `/home/user/Simulador_Clp/src/Models/ExecutionMode.java` - Enum: IDLE, STOPPED, RUNNING
- `/home/user/Simulador_Clp/src/Models/HomePageModel.java` - Global singleton state container

## Controllers (Business Logic)
- `/home/user/Simulador_Clp/src/Controllers/HomePageController.java` - Main logic controller (100ms cycle, timer management, file I/O)
- `/home/user/Simulador_Clp/src/Controllers/BatchSimulatorController.java` - Tank simulation controller

## Core PLC Engine (ilcompiler)

### Interpreter & Instruction Execution
- `/home/user/Simulador_Clp/src/ilcompiler/interpreter/Interpreter.java` - IL instruction parser and executor (12 instructions: LD, LDN, ST, STN, AND, ANDN, OR, ORN, TON, TOFF, CTU, CTD)

### Input/Output Management
- `/home/user/Simulador_Clp/src/ilcompiler/input/Input.java` - Input class with InputType enum (SWITCH, NO, NC)
- `/home/user/Simulador_Clp/src/ilcompiler/input/InputActions.java` - Creates 16 inputs (I0.0-I1.7)
- `/home/user/Simulador_Clp/src/ilcompiler/output/Output.java` - Output class
- `/home/user/Simulador_Clp/src/ilcompiler/output/OutputActions.java` - Creates 16 outputs (Q0.0-Q1.7, Q1.0-Q1.7)

### Memory Variables (Timers & Counters)
- `/home/user/Simulador_Clp/src/ilcompiler/memoryvariable/MemoryVariable.java` - M (boolean), T (timer), C (counter) implementations with 100ms timer intervals

### UI Utilities
- `/home/user/Simulador_Clp/src/ilcompiler/edit/Colors.java` - 4 color themes with 3 colors each
- `/home/user/Simulador_Clp/src/ilcompiler/edit/Language.java` - 4 languages: PT-BR, EN, JA, DE
- `/home/user/Simulador_Clp/src/ilcompiler/uppercasedocumentfilter/UpperCaseDocumentFilter.java` - Text filter for code editor

## Screens/UI Components

### Main Window
- `/home/user/Simulador_Clp/src/screens/HomePg.java` - Main window (1100px x 900px): menu, controls, code editor, scene, status panel

### Secondary Windows
- `/home/user/Simulador_Clp/src/screens/ListaDeVariaveisPg.java` - Variables data table with ID, CurrentValue, Counter, MaxTimer, EndTimer
- `/home/user/Simulador_Clp/src/screens/HelpPopUp.java` - Help dialog with instruction list and links
- `/home/user/Simulador_Clp/src/screens/SobrePopup.java` - About dialog with project credits

### Scene System
- `/home/user/Simulador_Clp/src/screens/scenes/IScenePanel.java` - Interface defining scene contract
- `/home/user/Simulador_Clp/src/screens/scenes/ScenesEnum.java` - Enum: DEFAULT, BATCH_SIMULATION
- `/home/user/Simulador_Clp/src/screens/scenes/DefaultScenePanel.java` - Basic 8-input/8-output panel with switch/button/LED icons
- `/home/user/Simulador_Clp/src/screens/scenes/BatchSimulationScenePanel.java` - Tank simulator with pumps, sensors, critical failure detection
- `/home/user/Simulador_Clp/src/screens/scenes/InputEventListener.java` - Interface for input press/release events
- `/home/user/Simulador_Clp/src/screens/scenes/PushButton.java` - Custom rendered button component (GRAY/RED palettes, NO/NC types)
- `/home/user/Simulador_Clp/src/screens/scenes/RedIndicator.java` - Custom LED/sensor indicator component

## File I/O
- `/home/user/Simulador_Clp/src/save/Save.java` - File save/load with .txt extension

## Colors
- `/home/user/Simulador_Clp/src/colors/SimColors.java` - (currently unused)

## Configuration Files
- `/home/user/Simulador_Clp/build.gradle` - Gradle build configuration (Java 17, AbsoluteLayout dependency)
- `/home/user/Simulador_Clp/README.md` - Project documentation

## Assets (Referenced but not listed)
- `/Assets/` folder contains:
  - `bloco_notas.png` - Notepad icon
  - `temporizador.png` - Timer icon
  - `contador.png` - Counter icon
  - `start.png`, `start_green.png` - Start button icons
  - `pause.png` - Pause button icon
  - `refresh.png` - Refresh button icon
  - `menu.png` - Data table button icon
  - `chave_aberta.png`, `chave_fechada.png` - Switch icons
  - `buttom.png`, `botao_fechado.png` - Button icons
  - `button_pi_aberto.png`, `buttom_pi.png` - PI button icons
  - `led_desligado.png`, `led_ligado.png` - LED icons
  - `batch_bg.png` - Tank simulator background

## Total Java Classes: 28

---

## Architecture Summary

### Layers:
1. **Presentation Layer** (screens/ folder)
   - HomePg (main), ListaDeVariaveisPg, Scene panels

2. **Controller Layer** (Controllers/ folder)
   - HomePageController (100ms cycle orchestration)
   - BatchSimulatorController (tank physics)

3. **Business Logic Layer** (ilcompiler/interpreter/)
   - Interpreter (IL instruction execution)
   - MemoryVariable (timer/counter management)

4. **Data Management Layer** (Models/, ilcompiler/input/, ilcompiler/output/)
   - HomePageModel (global state)
   - Input/Output/MemoryVariable classes

5. **Utility Layer** (ilcompiler/edit/, save/)
   - Colors, Language, Save, UpperCaseDocumentFilter

---

## Key Statistics

- **Total Lines of Code:** ~5,000
- **Main Window:** ~1,100 lines (HomePg.java)
- **Interpreter:** ~466 lines
- **DefaultScenePanel:** ~605 lines
- **Memory Variable:** ~142 lines
- **Cycle Interval:** 100 milliseconds
- **Inputs:** 16 (I0.0-I0.7, I1.0-I1.7)
- **Outputs:** 16 (Q0.0-Q0.7, Q1.0-Q1.7)
- **Instructions Supported:** 12
- **Color Themes:** 4
- **Languages:** 4
- **Memory Variable Types:** 3 (M, T, C)
- **Input Types:** 3 (SWITCH, NO, NC)

