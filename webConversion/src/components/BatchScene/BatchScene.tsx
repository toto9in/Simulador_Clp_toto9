/**
 * Batch Simulation Scene Component
 * Interactive tank with fill/drain physics
 * Converted from src/screens/components/Simulacao1.java
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import './BatchScene.css';

// Tank configuration (matching Java implementation)
const TANK_MAX_LEVEL = 100; // Maximum level (100%)
const FILL_RATE = 2; // Fill rate per cycle when valve is open
const DRAIN_RATE = 1.5; // Drain rate per cycle when valve is open

export function BatchScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const [tankLevel, setTankLevel] = useState(0); // 0-100%
  const animationRef = useRef<number>();

  // Map PLC I/O to batch simulation
  // Inputs:
  // I0.0 = Start button
  // I0.1 = Stop button
  // I0.2 = Level sensor LOW (tankLevel > 10%)
  // I0.3 = Level sensor MID (tankLevel > 50%)
  // I0.4 = Level sensor HIGH (tankLevel > 90%)
  // I0.5 = Emergency stop

  // Outputs:
  // Q0.0 = Fill valve (opens to fill tank)
  // Q0.1 = Drain valve (opens to drain tank)
  // Q0.2 = Pump motor
  // Q0.3 = Alarm indicator

  // Update level sensors based on tank level
  useEffect(() => {
    const lowSensor = tankLevel > 10;
    const midSensor = tankLevel > 50;
    const highSensor = tankLevel > 90;

    // Update input sensors
    if (state.inputs['I0.2'] !== lowSensor) {
      dispatch({ type: 'SET_INPUT', key: 'I0.2', value: lowSensor });
    }
    if (state.inputs['I0.3'] !== midSensor) {
      dispatch({ type: 'SET_INPUT', key: 'I0.3', value: midSensor });
    }
    if (state.inputs['I0.4'] !== highSensor) {
      dispatch({ type: 'SET_INPUT', key: 'I0.4', value: highSensor });
    }
  }, [tankLevel, state.inputs, dispatch]);

  // Animate tank level based on outputs
  useEffect(() => {
    const animate = () => {
      setTankLevel(prevLevel => {
        let newLevel = prevLevel;

        // Fill valve open (Q0.0)
        if (state.outputs['Q0.0']) {
          newLevel = Math.min(TANK_MAX_LEVEL, newLevel + FILL_RATE);
        }

        // Drain valve open (Q0.1)
        if (state.outputs['Q0.1']) {
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
  }, [state.outputs]);

  const toggleInput = (index: number) => {
    const key = `I0.${index}`;
    dispatch({
      type: 'SET_INPUT',
      key,
      value: !state.inputs[key]
    });
  };

  return (
    <div className="batch-scene">
      <div className="batch-scene__header">
        <h2 className="batch-scene__title">{t('scenes.batch')}</h2>
      </div>

      <div className="batch-scene__container">
        {/* Tank Visualization */}
        <div className="batch-scene__tank-area">
          <div className="tank">
            {/* Tank body */}
            <div className="tank__body">
              {/* Fill level */}
              <div
                className="tank__fill"
                style={{ height: `${tankLevel}%` }}
              >
                <div className="tank__wave" />
              </div>

              {/* Level markers */}
              <div className="tank__marker tank__marker--high">
                <span>HIGH (90%)</span>
                <div className={`tank__marker-indicator ${state.inputs['I0.4'] ? 'active' : ''}`} />
              </div>
              <div className="tank__marker tank__marker--mid">
                <span>MID (50%)</span>
                <div className={`tank__marker-indicator ${state.inputs['I0.3'] ? 'active' : ''}`} />
              </div>
              <div className="tank__marker tank__marker--low">
                <span>LOW (10%)</span>
                <div className={`tank__marker-indicator ${state.inputs['I0.2'] ? 'active' : ''}`} />
              </div>
            </div>

            {/* Level percentage display */}
            <div className="tank__level-display">
              <span className="tank__level-value">{Math.round(tankLevel)}%</span>
            </div>

            {/* Fill pipe */}
            <div className={`tank__pipe tank__pipe--fill ${state.outputs['Q0.0'] ? 'active' : ''}`}>
              <div className="tank__valve">
                <span>FILL</span>
                <div className={`tank__valve-indicator ${state.outputs['Q0.0'] ? 'open' : 'closed'}`}>
                  {state.outputs['Q0.0'] ? '▼' : '■'}
                </div>
              </div>
            </div>

            {/* Drain pipe */}
            <div className={`tank__pipe tank__pipe--drain ${state.outputs['Q0.1'] ? 'active' : ''}`}>
              <div className="tank__valve">
                <span>DRAIN</span>
                <div className={`tank__valve-indicator ${state.outputs['Q0.1'] ? 'open' : 'closed'}`}>
                  {state.outputs['Q0.1'] ? '▼' : '■'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="batch-scene__controls">
          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">{t('labels.inputs')}</h3>

            {/* Start Button (I0.0) */}
            <button
              className={`batch-button ${state.inputs['I0.0'] ? 'active' : ''}`}
              onClick={() => toggleInput(0)}
            >
              <span className="batch-button__label">START (I0.0)</span>
              <span className="batch-button__status">{state.inputs['I0.0'] ? '1' : '0'}</span>
            </button>

            {/* Stop Button (I0.1) */}
            <button
              className={`batch-button ${state.inputs['I0.1'] ? 'active' : ''}`}
              onClick={() => toggleInput(1)}
            >
              <span className="batch-button__label">STOP (I0.1)</span>
              <span className="batch-button__status">{state.inputs['I0.1'] ? '1' : '0'}</span>
            </button>

            {/* Emergency Stop (I0.5) */}
            <button
              className={`batch-button batch-button--emergency ${state.inputs['I0.5'] ? 'active' : ''}`}
              onClick={() => toggleInput(5)}
            >
              <span className="batch-button__label">E-STOP (I0.5)</span>
              <span className="batch-button__status">{state.inputs['I0.5'] ? '1' : '0'}</span>
            </button>
          </div>

          <div className="batch-scene__control-group">
            <h3 className="batch-scene__control-title">{t('labels.outputs')}</h3>

            {/* Pump Motor (Q0.2) */}
            <div className={`batch-indicator ${state.outputs['Q0.2'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">PUMP (Q0.2)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q0.2'] ? 'ON' : 'OFF'}</span>
            </div>

            {/* Alarm (Q0.3) */}
            <div className={`batch-indicator batch-indicator--alarm ${state.outputs['Q0.3'] ? 'active' : ''}`}>
              <span className="batch-indicator__label">ALARM (Q0.3)</span>
              <div className="batch-indicator__led" />
              <span className="batch-indicator__status">{state.outputs['Q0.3'] ? 'ON' : 'OFF'}</span>
            </div>
          </div>

          <div className="batch-scene__sensors">
            <h3 className="batch-scene__control-title">{t('batch.sensors')}</h3>
            <div className="sensor-list">
              <div className={`sensor-item ${state.inputs['I0.2'] ? 'active' : ''}`}>
                LOW (I0.2): {state.inputs['I0.2'] ? '1' : '0'}
              </div>
              <div className={`sensor-item ${state.inputs['I0.3'] ? 'active' : ''}`}>
                MID (I0.3): {state.inputs['I0.3'] ? '1' : '0'}
              </div>
              <div className={`sensor-item ${state.inputs['I0.4'] ? 'active' : ''}`}>
                HIGH (I0.4): {state.inputs['I0.4'] ? '1' : '0'}
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
