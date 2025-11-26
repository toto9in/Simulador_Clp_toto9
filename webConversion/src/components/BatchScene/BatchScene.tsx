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
const FILL_RATE = 1.0; // Fill rate per cycle when valve is open (slower for reflex game)
// const DRAIN_RATE = 1.5; // Drain rate per cycle when valve is open (Now using fillRate)
const PHYSICS_SPEED_SCALE = 0.05; // Global scaling factor to normalize speed (20x slower)

export function BatchScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const [tankLevel, setTankLevel] = useState(0); // 0-100% (for display only)
  const levelRef = useRef(0); // High precision level for physics
  const liquidRef = useRef<HTMLDivElement>(null); // Ref for direct DOM manipulation
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

  // Update level sensors based on tank level (using ref for latest value)
  useEffect(() => {
    // We need to check sensors on every frame or when outputs change
    // But since we moved physics to animation loop, we should check sensors there too
    // However, dispatch causes re-renders, so we should be careful.
    // Let's keep sensor logic in the animation loop or a separate effect that depends on the integer level.
  }, []); // Removed dependencies as we'll handle this in the animation loop or via tankLevel updates

  // Animate tank level based on outputs
  useEffect(() => {
    const animate = () => {
      let newLevel = levelRef.current;
      let changed = false;

      // Fill valve open (Q0.1 = pump1)
      if (state.outputs['Q0.1']) {
        newLevel = newLevel + (fillRate * PHYSICS_SPEED_SCALE);
        changed = true;
      }

      // Drain valve open (Q0.3 = pump3)
      if (state.outputs['Q0.3']) {
        newLevel = Math.max(0, newLevel - (fillRate * PHYSICS_SPEED_SCALE));
        changed = true;
      }

      if (changed) {
        levelRef.current = newLevel;
        
        // Direct DOM update for smooth animation
        if (liquidRef.current) {
          liquidRef.current.style.height = `${newLevel * 0.675}%`;
          liquidRef.current.style.opacity = newLevel > 0 ? '1' : '0';
        }

        // Update React state only when integer percentage changes (for text display and sensors)
        // Or if we hit 0 or 100 exactly
        const prevInt = Math.floor(tankLevel);
        const newInt = Math.floor(newLevel);
        
        if (prevInt !== newInt || (newLevel === 0 && tankLevel !== 0)) {
           setTankLevel(newLevel);
        }
      }
      
      // Update sensors based on precise level
      const hiLevelSensor = newLevel >= 100;
      const loLevelSensor = newLevel > 1;

      if (state.inputs['I1.0'] !== hiLevelSensor) {
        dispatch({ type: 'SET_INPUT', key: 'I1.0', value: hiLevelSensor });
      }
      if (state.inputs['I1.1'] !== loLevelSensor) {
        dispatch({ type: 'SET_INPUT', key: 'I1.1', value: loLevelSensor });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.outputs, fillRate, state.inputs, dispatch, tankLevel]); // Added tankLevel to dep array for comparison

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
        {/* Tank Visualization - Background image shows the tank */}
        <div className="batch-scene__tank-area">
          <div className="tank-wrapper">
            {/* Tank liquid fill - positioned to match Java coordinates */}
            <div
              ref={liquidRef}
              className="tank__liquid"
              style={{
                // Scale 0-100% to the visual tank height (approx 67.5% of the image height)
                height: `${tankLevel * 0.675}%`,
                opacity: tankLevel > 0 ? 1 : 0
              }}
            />

            {/* Level percentage display */}
            <div className="tank__level-display">
              <span className="tank__level-value">{Math.round(tankLevel)}%</span>
              <span className="tank__level-label">Nível</span>
            </div>
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
            <h3 className="batch-scene__control-title">{t('batch.fillSpeedControl')}</h3>
            <div className="fill-rate-control">
              <label htmlFor="fill-rate-slider" className="fill-rate-label">
                Fill Speed: {fillRate.toFixed(2)}x
              </label>
              <input
                id="fill-rate-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={fillRate <= 1.0 
                  ? ((fillRate - 0.1) / 0.9) * 50 
                  : 50 + ((fillRate - 1.0) / 2.0) * 50}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  let newRate;
                  if (val <= 50) {
                    // 0-50 maps to 0.1-1.0
                    newRate = 0.1 + (val / 50) * 0.9;
                  } else {
                    // 50-100 maps to 1.0-3.0
                    newRate = 1.0 + ((val - 50) / 50) * 2.0;
                  }
                  // Snap to 1.0 if close
                  if (Math.abs(newRate - 1.0) < 0.05) newRate = 1.0;
                  setFillRate(newRate);
                }}
                className="fill-rate-slider"
              />
              <div className="fill-rate-markers">
                <span>Slow (0.1x)</span>
                <span>Normal (1.0x)</span>
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
