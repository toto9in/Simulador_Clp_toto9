/**
 * Batch Simulation Scene Component
 * Interactive tank with fill/drain physics
 * Converted from src/screens/components/Simulacao1.java
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { PushButton, ButtonPalette } from '../PushButton';
import { InputType } from '../../types/plc';
import './BatchScene.css';

// Tank configuration (matching Java implementation)
const TANK_MAX_LEVEL = 100; // Maximum level (100%)
const FILL_RATE = 0.8; // Fill rate per cycle when valve is open (slower for reflex game)
const DRAIN_RATE = 1.5; // Drain rate per cycle when valve is open

export function BatchScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const [tankLevel, setTankLevel] = useState(0); // 0-100% (can overflow past 100)
  const [overflowWarning, setOverflowWarning] = useState(false);
  const [fillRate, setFillRate] = useState(FILL_RATE); // Adjustable fill rate
  const animationRef = useRef<number>();
  const prevMemoryKeysCount = useRef<number>(0);

  // Map PLC I/O to batch simulation (matching Java BatchSimulationScenePanel)
  // Inputs:
  // I0.0 = Start button (NO - Normally Open)
  // I0.1 = Stop button (NC - Normally Closed)
  // I1.0 = HI-LEVEL sensor (active when tankLevel >= 100%)
  // I1.1 = LO-LEVEL sensor (active when tankLevel > 1%)

  // Outputs:
  // Q0.1 = Pump1 (fill valve - opens to fill tank)
  // Q0.2 = Mixer motor
  // Q0.3 = Pump3 (drain valve - opens to drain tank)
  // Q1.0 = RUN LED (system running indicator)
  // Q1.1 = IDLE LED (system idle indicator)
  // Q1.2 = FULL LED (tank full indicator)

  // Update level sensors based on tank level
  useEffect(() => {
    // HIGH sensor: active at 100% (matching Java isAtHighLevel: value >= MAX_VALUE)
    const hiLevelSensor = tankLevel >= 100;
    // LOW sensor: active above ~1% (matching Java isAtLowLevel: value >= 3)
    const loLevelSensor = tankLevel > 1;

    // Update input sensors I1.0 and I1.1
    if (state.inputs['I1.0'] !== hiLevelSensor) {
      dispatch({ type: 'SET_INPUT', key: 'I1.0', value: hiLevelSensor });
    }
    if (state.inputs['I1.1'] !== loLevelSensor) {
      dispatch({ type: 'SET_INPUT', key: 'I1.1', value: loLevelSensor });
    }
  }, [tankLevel, state.inputs, dispatch]);

  // Animate tank level based on outputs
  useEffect(() => {
    const animate = () => {
      setTankLevel(prevLevel => {
        let newLevel = prevLevel;

        // Fill valve open (Q0.1 = pump1)
        // NOTE: No Math.min here - allows overflow for testing!
        if (state.outputs['Q0.1']) {
          newLevel = newLevel + fillRate;
        }

        // Drain valve open (Q0.3 = pump3)
        if (state.outputs['Q0.3']) {
          newLevel = Math.max(0, newLevel - DRAIN_RATE);
        }

        return newLevel;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.outputs, fillRate]);

  /**
   * Handle button press (NO activates, NC deactivates)
   */
  const handlePressed = (key: string) => {
    const inputType = state.inputsType[key];
    dispatch({
      type: 'SET_INPUT',
      key,
      value: inputType === InputType.NO ? true : false
    });
  };

  /**
   * Handle button release (NO deactivates, NC activates)
   */
  const handleReleased = (key: string) => {
    const inputType = state.inputsType[key];
    dispatch({
      type: 'SET_INPUT',
      key,
      value: inputType === InputType.NO ? false : true
    });
  };

  // Set input types on mount (START = NO, STOP = NC)
  useEffect(() => {
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I0.0', inputType: InputType.NO });
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I0.1', inputType: InputType.NC });
    // NC defaults to true
    dispatch({ type: 'SET_INPUT', key: 'I0.1', value: true });
  }, [dispatch]);

  // Detect overflow condition (tank > 100% AND error LED is ON)
  useEffect(() => {
    const errorLED = state.outputs['Q1.1']; // ERROR LED
    const isOverflowing = tankLevel > TANK_MAX_LEVEL && errorLED;

    if (isOverflowing && !overflowWarning) {
      setOverflowWarning(true);
    } else if (!errorLED && overflowWarning) {
      // Clear warning when error LED is turned off (user pressed RESET)
      setOverflowWarning(false);
    }
  }, [tankLevel, state.outputs, overflowWarning]);

  // Reset tank level when PLC variables are reset
  // This detects when memory variables were cleared (transition from having variables to none)
  useEffect(() => {
    const currentMemoryKeysCount = Object.keys(state.memoryVariables).length;

    // Detect a reset: had memory variables before, now they're gone
    if (prevMemoryKeysCount.current > 0 && currentMemoryKeysCount === 0 && tankLevel > 0) {
      setTankLevel(0);
      setOverflowWarning(false);
    }

    // Update the previous count
    prevMemoryKeysCount.current = currentMemoryKeysCount;
  }, [state.memoryVariables, tankLevel]);

  return (
    <div className="batch-scene">
      <div className="batch-scene__header">
        <h2 className="batch-scene__title">{t('scenes.batch')}</h2>
      </div>

      {/* Overflow Warning */}
      {overflowWarning && (
        <div className="overflow-warning">
          💧 YOU OVERFILLED! Emergency drain activated. Press STOP to reset and try again!
        </div>
      )}

      <div className="batch-scene__container">
        {/* Tank Visualization - Background image shows the tank */}
        <div className="batch-scene__tank-area">
          {/* Tank liquid fill - positioned to match Java coordinates */}
          <div
            className="tank__liquid"
            style={{
              height: `${tankLevel}%`,
              opacity: tankLevel > 0 ? 1 : 0
            }}
          />

          {/* Level percentage display */}
          <div className="tank__level-display">
            <span className="tank__level-value">{Math.round(tankLevel)}%</span>
            <span className="tank__level-label">Nível</span>
          </div>
        </div>

        {/* Control Panel */}
        <div className="batch-scene__controls">
          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">{t('labels.inputs')}</h3>

            <div className="batch-scene__buttons">
              {/* Start Button (I0.0 - Normally Open) */}
              <div className="batch-scene__button-container">
                <PushButton
                  inputKey="I0.0"
                  inputType={InputType.NO}
                  palette={ButtonPalette.GRAY}
                  value={state.inputs['I0.0']}
                  onPressed={handlePressed}
                  onReleased={handleReleased}
                />
                <span className="batch-scene__button-label">START</span>
                <span className="batch-scene__button-status">
                  I0.0: {state.inputs['I0.0'] ? '1' : '0'}
                </span>
              </div>

              {/* Stop Button (I0.1 - Normally Closed) */}
              <div className="batch-scene__button-container">
                <PushButton
                  inputKey="I0.1"
                  inputType={InputType.NC}
                  palette={ButtonPalette.RED}
                  value={state.inputs['I0.1']}
                  onPressed={handlePressed}
                  onReleased={handleReleased}
                />
                <span className="batch-scene__button-label">STOP</span>
                <span className="batch-scene__button-status">
                  I0.1: {state.inputs['I0.1'] ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Fill Rate Control */}
          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">Fill Speed Control</h3>
            <div className="fill-rate-control">
              <label htmlFor="fill-rate-slider" className="fill-rate-label">
                Fill Speed: {fillRate.toFixed(2)}x
              </label>
              <input
                id="fill-rate-slider"
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={fillRate}
                onChange={(e) => setFillRate(parseFloat(e.target.value))}
                className="fill-rate-slider"
              />
              <div className="fill-rate-markers">
                <span>Slow (0.1x)</span>
                <span>Normal (0.8x)</span>
                <span>Fast (3.0x)</span>
              </div>
            </div>
          </div>

          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">{t('labels.outputs')}</h3>

            {/* Pump1 (Q0.1) */}
            <div className={`batch-indicator ${state.outputs['Q0.1'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">PUMP1 (Q0.1)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q0.1'] ? 'ON' : 'OFF'}</span>
            </div>

            {/* Mixer (Q0.2) */}
            <div className={`batch-indicator ${state.outputs['Q0.2'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">MIXER (Q0.2)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q0.2'] ? 'ON' : 'OFF'}</span>
            </div>

            {/* Pump3 (Q0.3) */}
            <div className={`batch-indicator ${state.outputs['Q0.3'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">PUMP3 (Q0.3)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q0.3'] ? 'ON' : 'OFF'}</span>
            </div>
          </div>

          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">Status LEDs</h3>

            {/* Run LED (Q1.0) */}
            <div className={`batch-indicator ${state.outputs['Q1.0'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">RUN (Q1.0)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q1.0'] ? 'ON' : 'OFF'}</span>
            </div>

            {/* Error LED (Q1.1) - Overflow detection */}
            <div className={`batch-indicator ${state.outputs['Q1.1'] ? 'active error' : ''}`}>
              <span className="batch-indicator__label">ERROR (Q1.1)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q1.1'] ? 'ON' : 'OFF'}</span>
            </div>

            {/* Alarm LED (Q1.2) - Audio/visual alarm */}
            <div className={`batch-indicator ${state.outputs['Q1.2'] ? 'active alarm' : ''}`}>
              <span className="batch-indicator__label">ALARM (Q1.2)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q1.2'] ? 'ON' : 'OFF'}</span>
            </div>
          </div>

          <div className="batch-scene__sensors">
            <h3 className="batch-scene__control-title">{t('batch.sensors')}</h3>
            <div className="sensor-list">
              <div className={`sensor-item ${state.inputs['I1.0'] ? 'active' : ''}`}>
                HI-LEVEL (I1.0): {state.inputs['I1.0'] ? '1' : '0'}
              </div>
              <div className={`sensor-item ${state.inputs['I1.1'] ? 'active' : ''}`}>
                LO-LEVEL (I1.1): {state.inputs['I1.1'] ? '1' : '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="batch-scene__footer">
        <p className="batch-scene__info">
          {t('batch.info')}
        </p>
      </div>
    </div>
  );
}
