/**
 * Help Dialog Component
 * Shows available IL instructions, keyboard shortcuts, and usage examples
 * Converted from src/screens/Ajuda.java
 */

import { useTranslation } from 'react-i18next';
import { ASSETS } from '../../utils/assets';
import './HelpDialog.css';

interface HelpDialogProps {
  onClose: () => void;
}

export function HelpDialog({ onClose }: HelpDialogProps) {
  const { t } = useTranslation();

  const instructions = [
    { name: 'LD', description: t('help.ld'), example: 'LD I0.0' },
    { name: 'LDN', description: t('help.ldn'), example: 'LDN I0.1' },
    { name: 'ST', description: t('help.st'), example: 'ST Q0.0' },
    { name: 'STN', description: t('help.stn'), example: 'STN Q0.1' },
    { name: 'AND', description: t('help.and'), example: 'AND I0.2' },
    { name: 'ANDN', description: t('help.andn'), example: 'ANDN I0.3' },
    { name: 'OR', description: t('help.or'), example: 'OR I0.4' },
    { name: 'ORN', description: t('help.orn'), example: 'ORN I0.5' },
    { name: 'TON', description: t('help.ton'), example: 'TON T0,50' },
    { name: 'TOFF', description: t('help.toff'), example: 'TOFF T1,30' },
    { name: 'CTU', description: t('help.ctu'), example: 'CTU C0,10' },
    { name: 'CTD', description: t('help.ctd'), example: 'CTD C1,5' },
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl+S', action: 'Save program' },
    { key: 'Ctrl+O', action: 'Open program' },
    { key: 'F5', action: 'Toggle RUN/STOP' },
    { key: 'F6', action: 'PROGRAM mode' },
    { key: 'F7', action: 'STOP execution' },
    { key: 'F8', action: 'RESET all variables' },
    { key: 'Ctrl+D', action: 'Open Data Table' },
    { key: 'F1', action: 'Open Help (this dialog)' },
    { key: 'F2', action: 'Open About' },
    { key: 'Esc', action: 'Close dialogs' },
  ];

  return (
    <div className="help-dialog-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="help-dialog__header">
          <h2 className="help-dialog__title">❓ {t('help.title')}</h2>
          <button className="help-dialog__close" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="help-dialog__content">
          {/* IL Instructions */}
          <section className="help-section">
            <h3 className="help-section__title">📝 {t('help.instructions')}</h3>
            <div className="help-instructions">
              {instructions.map((instruction) => (
                <div key={instruction.name} className="help-instruction">
                  <div className="help-instruction__header">
                    <span className="help-instruction__name">{instruction.name}</span>
                    <code className="help-instruction__example">{instruction.example}</code>
                  </div>
                  <div className="help-instruction__description">{instruction.description}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="help-section">
            <h3 className="help-section__title">⌨️ Keyboard Shortcuts</h3>
            <div className="help-shortcuts">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="help-shortcut">
                  <kbd className="help-shortcut__key">{shortcut.key}</kbd>
                  <span className="help-shortcut__action">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Variables Reference */}
          <section className="help-section">
            <h3 className="help-section__title">🔢 Variables & Addressing</h3>
            <div className="help-reference">
              <div className="help-reference-item">
                <strong>Inputs:</strong> I0.0 to I1.7 (16 digital inputs)
              </div>
              <div className="help-reference-item">
                <strong>Outputs:</strong> Q0.0 to Q1.7 (16 digital outputs)
              </div>
              <div className="help-reference-item">
                <strong>Timers:</strong> T0 to T31 (32 timers, time in 0.1s units)
              </div>
              <div className="help-reference-item">
                <strong>Counters:</strong> C0 to C31 (32 counters)
              </div>
              <div className="help-reference-item">
                <strong>Memory:</strong> M0 to M31 (32 memory bits)
              </div>
            </div>
          </section>

          {/* Button Types */}
          <section className="help-section">
            <h3 className="help-section__title">🔘 Button Types (Input Behavior)</h3>
            <p className="help-section__desc">
              Right-click any input button to cycle through types: <strong>SWITCH → NO → NC</strong>
            </p>

            <div className="help-button-types">
              {/* SWITCH */}
              <div className="help-button-type">
                <div className="help-button-type__header">
                  <div className="help-button-type__images">
                    <img src={ASSETS.CHAVE_ABERTA} alt="SWITCH OFF" className="help-button-type__image" />
                    <span className="help-button-type__arrow">↔</span>
                    <img src={ASSETS.CHAVE_FECHADA} alt="SWITCH ON" className="help-button-type__image" />
                  </div>
                  <h4 className="help-button-type__name">SWITCH (Toggle)</h4>
                </div>
                <div className="help-button-type__content">
                  <p><strong>Behavior:</strong> Maintains state when clicked</p>
                  <ul className="help-button-type__list">
                    <li>Click to turn ON (1) - stays ON</li>
                    <li>Click again to turn OFF (0) - stays OFF</li>
                    <li><strong>Use cases:</strong> Main power switches, mode selection, enable/disable controls</li>
                  </ul>
                </div>
              </div>

              {/* NO - Normally Open */}
              <div className="help-button-type">
                <div className="help-button-type__header">
                  <div className="help-button-type__images">
                    <img src={ASSETS.BUTTON} alt="NO Released" className="help-button-type__image" />
                    <span className="help-button-type__arrow">→</span>
                    <img src={ASSETS.BUTTON_CLOSED} alt="NO Pressed" className="help-button-type__image" />
                  </div>
                  <h4 className="help-button-type__name">NO (Normally Open)</h4>
                </div>
                <div className="help-button-type__content">
                  <p><strong>Behavior:</strong> Momentary push button</p>
                  <ul className="help-button-type__list">
                    <li>Released = OFF (0)</li>
                    <li>Press and HOLD = ON (1)</li>
                    <li>Release = OFF (0) immediately</li>
                    <li><strong>Use cases:</strong> START buttons, test/jog buttons, manual overrides</li>
                  </ul>
                </div>
              </div>

              {/* NC - Normally Closed */}
              <div className="help-button-type">
                <div className="help-button-type__header">
                  <div className="help-button-type__images">
                    <img src={ASSETS.BUTTON_PI} alt="NC Released" className="help-button-type__image" />
                    <span className="help-button-type__arrow">→</span>
                    <img src={ASSETS.BUTTON_PI_OPEN} alt="NC Pressed" className="help-button-type__image" />
                  </div>
                  <h4 className="help-button-type__name">NC (Normally Closed)</h4>
                </div>
                <div className="help-button-type__content">
                  <p><strong>Behavior:</strong> Inverted logic (fail-safe)</p>
                  <ul className="help-button-type__list">
                    <li>Released (default) = ON (1)</li>
                    <li>Press = OFF (0)</li>
                    <li>Release = ON (1) again</li>
                    <li><strong>Use cases:</strong> STOP/E-STOP buttons, safety interlocks (broken wire = stop)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="help-button-tip">
              <strong>💡 Tip:</strong> Check the <em>button-types</em> category in Examples menu for interactive demos of each type!
            </div>
          </section>

          {/* Example Programs */}
          <section className="help-section">
            <h3 className="help-section__title">💡 {t('help.examples')}</h3>

            <div className="help-example">
              <h4>🔵 {t('help.exampleBasic')}</h4>
              <p className="help-example__desc">Two inputs must be active to turn on output</p>
              <pre className="help-code">
{`LD I0.0    # Load first input
AND I0.1   # AND with second input
ST Q0.0    # Store to output`}
              </pre>
            </div>

            <div className="help-example">
              <h4>⏱️ {t('help.exampleTimer')}</h4>
              <p className="help-example__desc">Output turns on 5 seconds after input activates</p>
              <pre className="help-code">
{`LD I0.0       # Load input
TON T0,50     # Timer ON delay (50 * 0.1s = 5s)
LD T0         # Load timer done bit
ST Q0.0       # Store to output`}
              </pre>
            </div>

            <div className="help-example">
              <h4>🔢 {t('help.exampleCounter')}</h4>
              <p className="help-example__desc">Output turns on after 10 pulses</p>
              <pre className="help-code">
{`LD I0.0       # Load input pulse
CTU C0,10     # Count up to 10
LD C0         # Load counter done bit
ST Q0.0       # Store to output`}
              </pre>
            </div>
          </section>

          {/* Tips */}
          <section className="help-section">
            <h3 className="help-section__title">💡 Tips & Tricks</h3>
            <ul className="help-tips">
              <li>📁 <strong>Drag & Drop:</strong> Drop .txt files anywhere to load them</li>
              <li>💾 <strong>Auto-save reminder:</strong> Orange dot shows unsaved changes</li>
              <li>⚡ <strong>Use F5:</strong> Fastest way to start/stop execution</li>
              <li>🎨 <strong>Themes:</strong> Click theme button or use menu to cycle themes</li>
              <li>🌐 <strong>Languages:</strong> Switch between PT-BR, EN, JA, DE anytime</li>
              <li>📊 <strong>Data Table:</strong> Press Ctrl+D to view all variables at once</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="help-dialog__footer">
          <button className="help-dialog__button help-dialog__button--primary" onClick={onClose}>
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
