/**
 * Default Scene Component
 * 8 Inputs + 8 Outputs interactive panel
 * Converted from src/screens/components/PainelComBotoes.java
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { InputType } from '../../types/plc';
import { ASSETS } from '../../utils/assets';
import './DefaultScene.css';

export function DefaultScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();

  /**
   * Toggle input (for SWITCH type)
   * SWITCH: Toggles state on click and maintains it
   */
  const toggleInput = (index: number) => {
    const key = `I0.${index}`;
    const inputType = state.inputsType[key];

    // Only toggle for SWITCH type
    if (inputType === InputType.SWITCH) {
      dispatch({
        type: 'SET_INPUT',
        key,
        value: !state.inputs[key]
      });
    }
  };

  /**
   * Handle mouse down on button
   * NO: Activates (true) when pressed
   * NC: Deactivates (false) when pressed
   */
  const handleMouseDown = (index: number) => {
    const key = `I0.${index}`;
    const inputType = state.inputsType[key];

    switch (inputType) {
      case InputType.NO: // Normally Open - activates when pressed
        dispatch({
          type: 'SET_INPUT',
          key,
          value: true
        });
        break;
      case InputType.NC: // Normally Closed - deactivates when pressed
        dispatch({
          type: 'SET_INPUT',
          key,
          value: false
        });
        break;
    }
  };

  /**
   * Handle mouse up on button
   * NO: Deactivates (false) when released
   * NC: Activates (true) when released
   */
  const handleMouseUp = (index: number) => {
    const key = `I0.${index}`;
    const inputType = state.inputsType[key];

    switch (inputType) {
      case InputType.NO: // Normally Open - deactivates when released
        dispatch({
          type: 'SET_INPUT',
          key,
          value: false
        });
        break;
      case InputType.NC: // Normally Closed - activates when released
        dispatch({
          type: 'SET_INPUT',
          key,
          value: true
        });
        break;
    }
  };

  /**
   * Cycle through input types (right-click)
   * SWITCH → NO → NC → SWITCH
   */
  const cycleInputType = (index: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
    const key = `I0.${index}`;
    const currentType = state.inputsType[key];

    let newType: InputType;
    switch (currentType) {
      case InputType.SWITCH:
        newType = InputType.NO;
        break;
      case InputType.NO:
        newType = InputType.NC;
        break;
      case InputType.NC:
        newType = InputType.SWITCH;
        break;
      default:
        newType = InputType.SWITCH;
    }

    // Update input type
    dispatch({
      type: 'SET_INPUT_TYPE',
      key,
      inputType: newType
    });

    // Set default state for new type
    // NC defaults to true, others to false
    dispatch({
      type: 'SET_INPUT',
      key,
      value: newType === InputType.NC
    });
  };

  const getInputIcon = (index: number): string => {
    const key = `I0.${index}`;
    const inputType = state.inputsType[key];
    const inputValue = state.inputs[key];

    switch (inputType) {
      case InputType.SWITCH:
        return inputValue ? ASSETS.CHAVE_FECHADA : ASSETS.CHAVE_ABERTA;
      case InputType.NO: // Normally Open
        return inputValue ? ASSETS.BUTTON_CLOSED : ASSETS.BUTTON;
      case InputType.NC: // Normally Closed
        return inputValue ? ASSETS.BUTTON_PI : ASSETS.BUTTON_PI_OPEN;
      default:
        return ASSETS.CHAVE_ABERTA;
    }
  };

  const getOutputIcon = (index: number): string => {
    const key = `Q0.${index}`;
    return state.outputs[key] ? ASSETS.LED_ON : ASSETS.LED_OFF;
  };

  return (
    <div className="default-scene">
      <div className="default-scene__header">
        <h2 className="default-scene__title">{t('labels.inputs')} / {t('labels.outputs')}</h2>
      </div>

      <div className="default-scene__container">
        {/* Inputs Section */}
        <div className="default-scene__section">
          <h3 className="default-scene__section-title">{t('labels.inputs')}</h3>
          <div className="default-scene__grid">
            {Array.from({ length: 8 }, (_, i) => {
              const inputKey = `I0.${i}`;
              return (
                <div key={`input-${i}`} className="io-item">
                  <button
                    className="io-item__button"
                    onClick={() => toggleInput(i)}
                    onMouseDown={() => handleMouseDown(i)}
                    onMouseUp={() => handleMouseUp(i)}
                    onMouseLeave={() => handleMouseUp(i)}
                    onContextMenu={(e) => cycleInputType(i, e)}
                    title={`I0.${i} - ${t(`inputTypes.${state.inputsType[inputKey].toLowerCase()}`)} (Right-click to change type)`}
                  >
                    <img
                      src={getInputIcon(i)}
                      alt={`Input ${i}`}
                      className="io-item__icon"
                      draggable={false}
                    />
                  </button>
                  <span className="io-item__label">I0.{i}</span>
                  <span className={`io-item__status ${state.inputs[inputKey] ? 'active' : ''}`}>
                    {state.inputs[inputKey] ? '1' : '0'}
                  </span>
                  <span className="io-item__type">
                    {state.inputsType[inputKey]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outputs Section */}
        <div className="default-scene__section">
          <h3 className="default-scene__section-title">{t('labels.outputs')}</h3>
          <div className="default-scene__grid">
            {Array.from({ length: 8 }, (_, i) => {
              const outputKey = `Q0.${i}`;
              return (
                <div key={`output-${i}`} className="io-item">
                  <div className="io-item__led-container">
                    <img
                      src={getOutputIcon(i)}
                      alt={`Output ${i}`}
                      className="io-item__icon"
                    />
                  </div>
                  <span className="io-item__label">Q0.{i}</span>
                  <span className={`io-item__status ${state.outputs[outputKey] ? 'active' : ''}`}>
                    {state.outputs[outputKey] ? '1' : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="default-scene__footer">
        <p className="default-scene__info">
          {t('scenes.defaultInfo')}
        </p>
      </div>
    </div>
  );
}
