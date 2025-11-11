/**
 * Help Dialog Component
 * Shows available IL instructions and usage
 * Converted from src/screens/Ajuda.java
 */

import { useTranslation } from 'react-i18next';
import './HelpDialog.css';

interface HelpDialogProps {
  onClose: () => void;
}

export function HelpDialog({ onClose }: HelpDialogProps) {
  const { t } = useTranslation();

  const instructions = [
    { name: 'LD', description: t('help.ld') },
    { name: 'LDN', description: t('help.ldn') },
    { name: 'ST', description: t('help.st') },
    { name: 'STN', description: t('help.stn') },
    { name: 'AND', description: t('help.and') },
    { name: 'ANDN', description: t('help.andn') },
    { name: 'OR', description: t('help.or') },
    { name: 'ORN', description: t('help.orn') },
    { name: 'TON', description: t('help.ton') },
    { name: 'TOFF', description: t('help.toff') },
    { name: 'CTU', description: t('help.ctu') },
    { name: 'CTD', description: t('help.ctd') },
  ];

  return (
    <div className="help-dialog-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="help-dialog__header">
          <h2 className="help-dialog__title">{t('help.title')}</h2>
          <button className="help-dialog__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="help-dialog__content">
          <section className="help-section">
            <h3 className="help-section__title">{t('help.instructions')}</h3>
            <div className="help-instructions">
              {instructions.map((instruction) => (
                <div key={instruction.name} className="help-instruction">
                  <div className="help-instruction__name">{instruction.name}</div>
                  <div className="help-instruction__description">{instruction.description}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="help-section">
            <h3 className="help-section__title">{t('help.examples')}</h3>
            <div className="help-example">
              <h4>{t('help.exampleBasic')}</h4>
              <pre className="help-code">
{`LD I0.0
AND I0.1
ST Q0.0`}
              </pre>
            </div>
            <div className="help-example">
              <h4>{t('help.exampleTimer')}</h4>
              <pre className="help-code">
{`LD I0.0
TON T0 50
LD T0
ST Q0.0`}
              </pre>
            </div>
            <div className="help-example">
              <h4>{t('help.exampleCounter')}</h4>
              <pre className="help-code">
{`LD I0.0
CTU C0 10
LD C0
ST Q0.0`}
              </pre>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="help-dialog__footer">
          <button className="help-dialog__button" onClick={onClose}>
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
