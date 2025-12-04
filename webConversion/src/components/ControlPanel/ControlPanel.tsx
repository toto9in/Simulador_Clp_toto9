/**
 * Control Panel Component
 * PROGRAM / STOP / RUN mode buttons
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionMode } from '../../types/plc';
import { useExecutionCycle } from '../../hooks/useExecutionCycle';
import { usePLCState } from '../../context/PLCStateContext';
import { ASSETS } from '../../utils/assets';
import './ControlPanel.css';

export function ControlPanel() {
  const { t } = useTranslation();
  const { mode, start, stop, pause, isRunning } = useExecutionCycle();
  const { dispatch } = usePLCState();
  const [isCompact, setIsCompact] = useState(true);

  const handleProgram = () => {
    pause(); // Sets mode to IDLE
  };

  const handleStop = () => {
    stop(); // Sets mode to STOPPED
  };

  const handleRun = () => {
    start(); // Initialize and set mode to RUNNING
  };

  const handleReset = () => {
    // Reset all outputs and memory variables
    dispatch({ type: 'RESET_OUTPUTS' });
    dispatch({ type: 'RESET_MEMORY' });
    // Set mode to IDLE
    dispatch({ type: 'SET_MODE', mode: ExecutionMode.IDLE });
  };

  return (
    <div className={`control-panel ${isCompact ? 'control-panel--compact' : ''}`}>
      <div className="control-panel__buttons">
        <button
          className={`control-button control-button--program ${mode === ExecutionMode.IDLE ? 'active' : ''}`}
          onClick={handleProgram}
          disabled={mode === ExecutionMode.IDLE}
          title={t('modes.program')}
        >
          <img src={ASSETS.MENU} alt="Program" className="control-icon" />
          {!isCompact && <span>{t('modes.program')}</span>}
        </button>

        <button
          className={`control-button control-button--stop ${mode === ExecutionMode.STOPPED ? 'active' : ''}`}
          onClick={handleStop}
          disabled={mode === ExecutionMode.STOPPED}
          title={t('modes.stop')}
        >
          <img src={ASSETS.PAUSE} alt="Stop" className="control-icon" />
          {!isCompact && <span>{t('modes.stop')}</span>}
        </button>

        <button
          className={`control-button control-button--run ${isRunning ? 'active' : ''}`}
          onClick={handleRun}
          disabled={isRunning}
          title={t('modes.run')}
        >
          <img
            src={isRunning ? ASSETS.START_GREEN : ASSETS.START}
            alt="Run"
            className="control-icon"
          />
          {!isCompact && <span>{t('modes.run')}</span>}
        </button>

        <button
          className="control-button control-button--reset"
          onClick={handleReset}
          title="Reset all variables"
        >
          <span className="reset-icon">⟲</span>
          {!isCompact && <span>RESET</span>}
        </button>
      </div>

      <div className="control-panel__status">
        <div className="status-indicator">
          {!isCompact && <span className="status-label">{t('labels.value')}</span>}
          <span className={`status-value status-value--${mode.toLowerCase()}`}>
            {t(`modes.${mode.toLowerCase()}`)}
          </span>
        </div>

        <button
          className="control-panel__toggle"
          onClick={() => setIsCompact(!isCompact)}
          title={isCompact ? 'Expand controls' : 'Compact controls'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            {isCompact ? (
              <path d="M2 8 L8 2 L14 8 M2 14 L8 8 L14 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M2 2 L8 8 L14 2 M2 8 L8 14 L14 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
