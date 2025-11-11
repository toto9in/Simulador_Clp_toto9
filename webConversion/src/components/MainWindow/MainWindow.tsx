/**
 * Main Window Component
 * Main application layout
 * Converted from src/screens/HomePg.java
 */

import { useEffect, useState } from 'react';
import { PLCStateProvider } from '../../context/PLCStateContext';
import { useExecutionCycle } from '../../hooks/useExecutionCycle';
import { useTheme } from '../../hooks/useTheme';
import { MenuBar } from '../MenuBar/MenuBar';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { CodeEditor } from '../CodeEditor/CodeEditor';
import { SceneContainer } from '../SceneContainer/SceneContainer';
import { DataTable } from '../DataTable/DataTable';
import { HelpDialog } from '../HelpDialog/HelpDialog';
import { AboutDialog } from '../AboutDialog/AboutDialog';
import '../../i18n/config';
import '../../styles/themes.css';
import '../../styles/globals.css';
import './MainWindow.css';

/**
 * Inner component that uses context
 */
function MainWindowContent() {
  const { theme } = useTheme();
  const executionCycle = useExecutionCycle();
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);

  // Initialize i18n and theme on mount
  useEffect(() => {
    console.log('PLC Simulator initialized');
    console.log('Theme:', theme);
    console.log('Execution cycle:', executionCycle.mode);
  }, [theme, executionCycle.mode]);

  return (
    <div className="main-window">
      {/* Top Bar - Menu and Controls */}
      <div className="main-window__top-bar">
        <MenuBar
          onOpenHelp={() => setShowHelp(true)}
          onOpenAbout={() => setShowAbout(true)}
          onOpenDataTable={() => setShowDataTable(true)}
        />
        <ControlPanel />
      </div>

      {/* Main Content Area */}
      <div className="main-window__content">
        {/* Left Side - Code Editor */}
        <div className="main-window__editor">
          <CodeEditor />
        </div>

        {/* Right Side - Scene and Status */}
        <div className="main-window__right">
          {/* Scene Area */}
          <div className="main-window__scene">
            <SceneContainer />
          </div>

          {/* Status Panel */}
          <div className="main-window__status">
            <div className="placeholder">Status (Timers/Counters)</div>
          </div>
        </div>
      </div>

      {/* Footer - Optional status bar */}
      <div className="main-window__footer">
        <span>Mode: {executionCycle.mode}</span>
        <span>Theme: {theme}</span>
      </div>

      {/* Dialogs */}
      {showDataTable && <DataTable onClose={() => setShowDataTable(false)} />}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  );
}

/**
 * Main Window with Context Provider
 */
export function MainWindow() {
  return (
    <PLCStateProvider>
      <MainWindowContent />
    </PLCStateProvider>
  );
}
