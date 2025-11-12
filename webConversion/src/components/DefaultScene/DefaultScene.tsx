/**
 * Default Scene Component
 * 8 Inputs + 8 Outputs interactive panel
 * Converted from src/screens/components/PainelComBotoes.java
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { InputType } from '../../types/plc';
import './DefaultScene.css';

export function DefaultScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();

  const toggleInput = (index: number) => {
    const key = `I0.${index}`;
    dispatch({
      type: 'SET_INPUT',
      key,
      value: !state.inputs[key]
    });
  };

  const getInputIcon = (index: number): string => {
    const key = `I0.${index}`;
    const inputType = state.inputsType[key];
    const inputValue = state.inputs[key];

    switch (inputType) {
      case InputType.SWITCH:
        return inputValue ? '/assets/chave_fechada.png' : '/assets/chave_aberta.png';
      case InputType.NO: // Normally Open
        return inputValue ? '/assets/botao_fechado.png' : '/assets/buttom.png';
      case InputType.NC: // Normally Closed
        return inputValue ? '/assets/buttom_pi.png' : '/assets/button_pi_aberto.png';
      default:
        return '/assets/chave_aberta.png';
    }
  };

  const getOutputIcon = (index: number): string => {
    const key = `Q0.${index}`;
    return state.outputs[key]
      ? '/assets/led_ligado.png'
      : '/assets/led_desligado.png';
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
                    title={`I0.${i} - ${t(`inputTypes.${state.inputsType[inputKey].toLowerCase()}`)}`}
                  >
                    <img
                      src={getInputIcon(i)}
                      alt={`Input ${i}`}
                      className="io-item__icon"
                    />
                  </button>
                  <span className="io-item__label">I0.{i}</span>
                  <span className={`io-item__status ${state.inputs[inputKey] ? 'active' : ''}`}>
                    {state.inputs[inputKey] ? '1' : '0'}
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
