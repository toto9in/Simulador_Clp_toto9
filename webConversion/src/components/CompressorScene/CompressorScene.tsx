/**
 * Compressor System Scene Component
 * Dual compressor system with pressure sensors and selector switch
 * Based on LogixPro compressor simulation
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { PushButton, ButtonPalette } from '../PushButton';
import { InputType } from '../../types/plc';
import './CompressorScene.css';

// Compressor configuration
const MAX_PRESSURE = 150; // Maximum pressure (PSI)
// Capacity per compressor (PSI per animation tick). Reduced for slower, more realistic cycles.
const COMPRESSOR_CAPACITY = 0.8;
// Base consumption at 100% flow (PSI per tick). Increased for more balanced behavior.
const BASE_CONSUMPTION_100 = 0.5;

export function CompressorScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const [pressure, setPressure] = useState(0); // Current pressure (0-150 PSI)
  const [flowRate, setFlowRate] = useState(100); // Flow rate percentage (0–100)
  const [selectorPosition, setSelectorPosition] = useState<'A' | 'B' | 'C'>('C'); // Selector switch position

  // Pressure switch thresholds (editable via UI)
  const [pe1High, setPe1High] = useState(110); // PE1 activates at 110 PSI (default tuned)
  const [pe1Low, setPe1Low] = useState(70); // PE1 deactivates at 70 PSI
  const [pe2High, setPe2High] = useState(110); // PE2 activates at 110 PSI (default tuned)
  const [pe2Low, setPe2Low] = useState(70); // PE2 deactivates at 70 PSI
  const animationRef = useRef<number>();

  // Map PLC I/O to compressor simulation
  // Inputs:
  // I1.0 = START button (NA - Normally Open)
  // I1.1 = STOP button (NF - Normally Closed)
  // I1.2 = Pressure switch PE1 (Motor 1)
  // I1.3 = Pressure switch PE2 (Motor 2)
  // I1.4 = Selector switch position A
  // I1.5 = Selector switch position B
  // I1.6 = Selector switch position C

  // Outputs:
  // Q0.0 = Motor 1 (MOTOR)
  // Q0.1 = Motor 2 (MOTOR #2)
  // Q0.2 = RUN indicator lamp
  // Q0.3 = C1 indicator lamp (Motor 1)
  // Q0.4 = C2 indicator lamp (Motor 2)

  // Update pressure switches based solely on pressure (with hysteresis), independent of motors
  useEffect(() => {
    let pe1Active = state.inputs['I1.2'];
    if (pressure >= pe1High) pe1Active = true;
    else if (pressure <= pe1Low) pe1Active = false;
    if (state.inputs['I1.2'] !== pe1Active) {
      dispatch({ type: 'SET_INPUT', key: 'I1.2', value: pe1Active });
    }

    let pe2Active = state.inputs['I1.3'];
    if (pressure >= pe2High) pe2Active = true;
    else if (pressure <= pe2Low) pe2Active = false;
    if (state.inputs['I1.3'] !== pe2Active) {
      dispatch({ type: 'SET_INPUT', key: 'I1.3', value: pe2Active });
    }
  }, [pressure, pe1High, pe1Low, pe2High, pe2Low, state.inputs, dispatch]);

  // Animate pressure based on motor outputs
  useEffect(() => {
    const animate = () => {
      setPressure((prevPressure) => {
        let pressurePSI = prevPressure;

        // Determine number of active compressors
        const compressorsRunning = (state.outputs['Q0.0'] ? 1 : 0) + (state.outputs['Q0.1'] ? 1 : 0);

        // Production: sum of capacities
        const production = compressorsRunning * COMPRESSOR_CAPACITY;

        // Flow control: map 0–100% slider to 0.0–1.0 consumption factor
        const flowPercent = Math.max(0, Math.min(100, flowRate)) / 100;

        // Consumption at current flow. At 100%, single compressor balances (production≈consumption).
        // With two compressors at 100%, PSI rises (production > consumption).
        const consumption = BASE_CONSUMPTION_100 * flowPercent;

        // Net change: production minus consumption. Add mild damping to smooth transitions.
        const net = production - consumption;
        const damping = 0.01 * (pressurePSI / MAX_PRESSURE); // small damping near max

        pressurePSI = pressurePSI + net - damping;
        pressurePSI = Math.max(0, Math.min(MAX_PRESSURE, pressurePSI));

        return pressurePSI;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.outputs, flowRate]);

  /**
   * Handle button press (NO activates, NC deactivates)
   */
  const handlePressed = (key: string) => {
    const inputType = state.inputsType[key];
    dispatch({
      type: 'SET_INPUT',
      key,
      value: inputType === InputType.NO ? true : false,
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
      value: inputType === InputType.NO ? false : true,
    });
  };

  /**
   * Handle selector switch position change
   */
  const handleSelectorChange = (position: 'A' | 'B' | 'C') => {
    setSelectorPosition(position);

    // Update selector inputs
    dispatch({ type: 'SET_INPUT', key: 'I1.4', value: position === 'A' });
    dispatch({ type: 'SET_INPUT', key: 'I1.5', value: position === 'B' });
    dispatch({ type: 'SET_INPUT', key: 'I1.6', value: position === 'C' });
  };

  // Set input types on mount
  useEffect(() => {
    // START = NO (Normally Open)
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.0', inputType: InputType.NO });
    // STOP = NC (Normally Closed) - defaults to true when not pressed
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.1', inputType: InputType.NC });
    dispatch({ type: 'SET_INPUT', key: 'I1.1', value: true });

    // Selector switches (treated as regular inputs)
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.4', inputType: InputType.SWITCH });
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.5', inputType: InputType.SWITCH });
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.6', inputType: InputType.SWITCH });

    // Initialize selector to position C
    dispatch({ type: 'SET_INPUT', key: 'I1.4', value: false });
    dispatch({ type: 'SET_INPUT', key: 'I1.5', value: false });
    dispatch({ type: 'SET_INPUT', key: 'I1.6', value: true });

    // Pressure switches (read-only, controlled by simulation)
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.2', inputType: InputType.SWITCH });
    dispatch({ type: 'SET_INPUT_TYPE', key: 'I1.3', inputType: InputType.SWITCH });
  }, [dispatch]);

  // Calculate pressure gauge rotation (0-150 PSI = 0-180 degrees)
  const gaugeRotation = (pressure / MAX_PRESSURE) * 180 - 90;

  return (
    <div className="compressor-scene">
      <div className="compressor-scene__header">
        <h2 className="compressor-scene__title">{t('scenes.compressor')}</h2>
      </div>

      <div className="compressor-scene__container">
        {/* Compressor System Visualization */}
        <div className="compressor-scene__visual-area">
          {/* Pressure Gauge */}
          <div className="pressure-gauge">
            <div className="pressure-gauge__face">
              <div className="pressure-gauge__markers">
                {[0, 25, 50, 75, 100, 125, 150].map((value) => (
                  <div
                    key={value}
                    className="pressure-gauge__marker"
                    style={{
                      transform: `rotate(${(value / MAX_PRESSURE) * 180 - 90}deg)`,
                    }}
                  >
                    <span className="pressure-gauge__marker-label">{value}</span>
                  </div>
                ))}
              </div>
              <div
                className="pressure-gauge__needle"
                style={{
                  transform: `rotate(${gaugeRotation}deg)`,
                }}
              />
              <div className="pressure-gauge__center" />
            </div>
            <div className="pressure-gauge__label">PSI</div>
            <div className="pressure-gauge__digital">{Math.round(pressure)} PSI</div>
          </div>

          {/* Compressor Motors Visual */}
          <div className="compressor-motors">
            <div className={`compressor-motor ${state.outputs['Q0.0'] ? 'running' : ''}`}>
              <div className="compressor-motor__icon">M1</div>
              <div className="compressor-motor__label">MOTOR 1</div>
              <div className="compressor-motor__status">
                {state.outputs['Q0.0'] ? 'RUNNING' : 'STOPPED'}
              </div>
              <div className="compressor-motor__badge">Q0.0: {state.outputs['Q0.0'] ? 'ON' : 'OFF'}</div>
            </div>

            <div className={`compressor-motor ${state.outputs['Q0.1'] ? 'running' : ''}`}>
              <div className="compressor-motor__icon">M2</div>
              <div className="compressor-motor__label">MOTOR 2</div>
              <div className="compressor-motor__status">
                {state.outputs['Q0.1'] ? 'RUNNING' : 'STOPPED'}
              </div>
              <div className="compressor-motor__badge">Q0.1: {state.outputs['Q0.1'] ? 'ON' : 'OFF'}</div>
            </div>
          </div>

          {/* Pressure Switches Indicators */}
          <div className="pressure-switches">
            <div className={`pressure-switch ${state.inputs['I1.2'] ? 'active' : ''}`}>
              <span className="pressure-switch__label">PE1</span>
              <div className="pressure-switch__led" />
              <span className="pressure-switch__range">
                {pe1Low}-{pe1High} PSI
              </span>
            </div>
            <div className={`pressure-switch ${state.inputs['I1.3'] ? 'active' : ''}`}>
              <span className="pressure-switch__label">PE2</span>
              <div className="pressure-switch__led" />
              <span className="pressure-switch__range">
                {pe2Low}-{pe2High} PSI
              </span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="compressor-scene__controls">
          <div className="compressor-scene__control-group">
            <h3 className="compressor-scene__control-title">{t('labels.inputs')}</h3>

            <div className="compressor-scene__buttons">
              {/* Start Button (I1.0 - Normally Open) */}
              <div className="compressor-scene__button-container">
                <PushButton
                  inputKey="I1.0"
                  inputType={InputType.NO}
                  palette={ButtonPalette.GRAY}
                  value={state.inputs['I1.0']}
                  onPressed={handlePressed}
                  onReleased={handleReleased}
                />
                <span className="compressor-scene__button-label">START</span>
                <span className="compressor-scene__button-status">
                  I1.0: {state.inputs['I1.0'] ? '1' : '0'}
                </span>
              </div>

              {/* Stop Button (I1.1 - Normally Closed) */}
              <div className="compressor-scene__button-container">
                <PushButton
                  inputKey="I1.1"
                  inputType={InputType.NC}
                  palette={ButtonPalette.RED}
                  value={state.inputs['I1.1']}
                  onPressed={handlePressed}
                  onReleased={handleReleased}
                />
                <span className="compressor-scene__button-label">STOP</span>
                <span className="compressor-scene__button-status">
                  I1.1: {state.inputs['I1.1'] ? '1' : '0'}
                </span>
              </div>
            </div>

            {/* Selector Switch */}
            <div className="selector-switch">
              <h4 className="selector-switch__title">Motor Selector</h4>
              <div className="selector-switch__buttons">
                <button
                  className={`selector-switch__button ${selectorPosition === 'A' ? 'active' : ''}`}
                  onClick={() => handleSelectorChange('A')}
                >
                  A<span className="selector-switch__button-label">Motor 1</span>
                  <span className="selector-switch__button-status">I1.4</span>
                </button>
                <button
                  className={`selector-switch__button ${selectorPosition === 'B' ? 'active' : ''}`}
                  onClick={() => handleSelectorChange('B')}
                >
                  B<span className="selector-switch__button-label">Motor 2</span>
                  <span className="selector-switch__button-status">I1.5</span>
                </button>
                <button
                  className={`selector-switch__button ${selectorPosition === 'C' ? 'active' : ''}`}
                  onClick={() => handleSelectorChange('C')}
                >
                  C<span className="selector-switch__button-label">Blocked</span>
                  <span className="selector-switch__button-status">I1.6</span>
                </button>
              </div>
            </div>
          </div>

          {/* Flow Rate Control */}
          <div className="compressor-scene__control-group">
            <h3 className="compressor-scene__control-title">Flow Rate Control</h3>
            <div className="flow-rate-control">
              <label htmlFor="flow-rate-slider" className="flow-rate-label">
                Consumption: {flowRate}%
              </label>
              <input
                id="flow-rate-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={flowRate}
                onChange={(e) => setFlowRate(parseInt(e.target.value, 10))}
                className="flow-rate-slider"
              />
              <div className="flow-rate-markers">
                <span>Low (0%)</span>
                <span>Normal (50%)</span>
                <span>High (100%)</span>
              </div>
            </div>
          </div>

          {/* Pressure Switch PE1 Configuration */}
          <div className="compressor-scene__control-group">
            <h3 className="compressor-scene__control-title">Pressure Switch PE1</h3>

            <div className="pressure-config">
              <label htmlFor="pe1-high-slider" className="pressure-config-label">
                PE1 High (Activate): {pe1High} PSI
              </label>
              <input
                id="pe1-high-slider"
                type="range"
                min="10"
                max="150"
                step="5"
                value={pe1High}
                onChange={(e) => setPe1High(parseFloat(e.target.value))}
                className="pressure-config-slider"
              />
            </div>

            <div className="pressure-config">
              <label htmlFor="pe1-low-slider" className="pressure-config-label">
                PE1 Low (Deactivate): {pe1Low} PSI
              </label>
              <input
                id="pe1-low-slider"
                type="range"
                min="5"
                max="145"
                step="5"
                value={pe1Low}
                onChange={(e) => setPe1Low(parseFloat(e.target.value))}
                className="pressure-config-slider"
              />
            </div>
          </div>

          {/* Pressure Switch PE2 Configuration */}
          <div className="compressor-scene__control-group">
            <h3 className="compressor-scene__control-title">Pressure Switch PE2</h3>

            <div className="pressure-config">
              <label htmlFor="pe2-high-slider" className="pressure-config-label">
                PE2 High (Activate): {pe2High} PSI
              </label>
              <input
                id="pe2-high-slider"
                type="range"
                min="10"
                max="150"
                step="5"
                value={pe2High}
                onChange={(e) => setPe2High(parseFloat(e.target.value))}
                className="pressure-config-slider"
              />
            </div>

            <div className="pressure-config">
              <label htmlFor="pe2-low-slider" className="pressure-config-label">
                PE2 Low (Deactivate): {pe2Low} PSI
              </label>
              <input
                id="pe2-low-slider"
                type="range"
                min="5"
                max="145"
                step="5"
                value={pe2Low}
                onChange={(e) => setPe2Low(parseFloat(e.target.value))}
                className="pressure-config-slider"
              />
            </div>
          </div>

          <div className="compressor-scene__control-group">
            <h3 className="compressor-scene__control-title">Status Lamps</h3>

            {/* RUN Lamp (Q0.2) */}
            <div className={`compressor-indicator ${state.outputs['Q0.2'] ? 'active' : ''}`}>
              <span className="compressor-indicator__label">RUN</span>
              <div className="compressor-indicator__led compressor-indicator__led--green" />
              <span className="compressor-indicator__status">
                Q0.2: {state.outputs['Q0.2'] ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* C1 Lamp (Q0.3) - Motor 1 */}
            <div className={`compressor-indicator ${state.outputs['Q0.3'] ? 'active' : ''}`}>
              <span className="compressor-indicator__label">C1 (Motor 1)</span>
              <div className="compressor-indicator__led compressor-indicator__led--yellow" />
              <span className="compressor-indicator__status">
                Q0.3: {state.outputs['Q0.3'] ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* C2 Lamp (Q0.4) - Motor 2 */}
            <div className={`compressor-indicator ${state.outputs['Q0.4'] ? 'active' : ''}`}>
              <span className="compressor-indicator__label">C2 (Motor 2)</span>
              <div className="compressor-indicator__led compressor-indicator__led--yellow" />
              <span className="compressor-indicator__status">
                Q0.4: {state.outputs['Q0.4'] ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="compressor-scene__sensors">
            <h3 className="compressor-scene__control-title">Pressure Sensors</h3>
            <div className="sensor-list">
              <div className={`sensor-item ${state.inputs['I1.2'] ? 'active' : ''}`}>
                PE1 (I1.2): {state.inputs['I1.2'] ? '1 (HIGH)' : '0 (LOW)'}
              </div>
              <div className={`sensor-item ${state.inputs['I1.3'] ? 'active' : ''}`}>
                PE2 (I1.3): {state.inputs['I1.3'] ? '1 (HIGH)' : '0 (LOW)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="compressor-scene__footer">
        <p className="compressor-scene__info">{t('compressor.info')}</p>
      </div>
    </div>
  );
}
