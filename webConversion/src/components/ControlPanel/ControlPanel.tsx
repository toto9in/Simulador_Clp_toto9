/**
 * Control Panel Component
 * PROGRAM / STOP / RUN mode buttons
 */

import { useTranslation } from 'react-i18next';
import { ExecutionMode } from '../../types/plc';
import { useExecutionCycle } from '../../hooks/useExecutionCycle';
import './ControlPanel.css';

export function ControlPanel() {
  const { t } = useTranslation();
  const { mode, start, stop, pause, isRunning } = useExecutionCycle();

  const handleProgram = () => {
    pause(); // Sets mode to IDLE
  };

  const handleStop = () => {
    stop(); // Sets mode to STOPPED
  };

  const handleRun = () => {
    start(); // Initialize and set mode to RUNNING
  };

  return (
    <div className="control-panel">
      <div className="control-panel__buttons">
        <button
          className={`control-button control-button--program ${mode === ExecutionMode.IDLE ? 'active' : ''}`}
          onClick={handleProgram}
          disabled={mode === ExecutionMode.IDLE}
        >
          <img src="/assets/menu.png" alt="Program" className="control-icon" />
          <span>{t('modes.program')}</span>
        </button>

        <button
          className={`control-button control-button--stop ${mode === ExecutionMode.STOPPED ? 'active' : ''}`}
          onClick={handleStop}
          disabled={mode === ExecutionMode.STOPPED}
        >
          <img src="/assets/pause.png" alt="Stop" className="control-icon" />
          <span>{t('modes.stop')}</span>
        </button>

        <button
          className={`control-button control-button--run ${isRunning ? 'active' : ''}`}
          onClick={handleRun}
          disabled={isRunning}
        >
          <img
            src={isRunning ? "/assets/start_green.png" : "/assets/start.png"}
            alt="Run"
            className="control-icon"
          />
          <span>{t('modes.run')}</span>
        </button>
      </div>

      <div className="control-panel__status">
        <div className="status-indicator">
          <span className="status-label">{t('labels.value')}</span>
          <span className={`status-value status-value--${mode.toLowerCase()}`}>
            {t(`modes.${mode.toLowerCase()}`)}
          </span>
        </div>
      </div>
    </div>
  );
}
