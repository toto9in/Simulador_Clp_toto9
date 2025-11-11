/**
 * About Dialog Component
 * Shows application information and version
 * Converted from src/screens/Sobre.java
 */

import { useTranslation } from 'react-i18next';
import './AboutDialog.css';

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="about-dialog-overlay" onClick={onClose}>
      <div className="about-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="about-dialog__header">
          <h2 className="about-dialog__title">{t('about.title')}</h2>
          <button className="about-dialog__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="about-dialog__content">
          <div className="about-logo">
            <div className="about-logo__icon">🏭</div>
            <h1 className="about-logo__title">PLC Simulator</h1>
            <p className="about-logo__subtitle">{t('about.description')}</p>
          </div>

          <div className="about-info">
            <div className="about-info__item">
              <strong>{t('about.version')}:</strong> 2.0.0 Web
            </div>
            <div className="about-info__item">
              <strong>{t('about.technology')}:</strong> React + TypeScript + Vite
            </div>
            <div className="about-info__item">
              <strong>{t('about.features')}:</strong>
              <ul>
                <li>12 {t('about.instructions')}</li>
                <li>{t('about.timers')}</li>
                <li>{t('about.counters')}</li>
                <li>{t('about.multiLanguage')}</li>
                <li>{t('about.multiTheme')}</li>
              </ul>
            </div>
            <div className="about-info__item">
              <strong>{t('about.credits')}:</strong>
              <p>{t('about.creditsText')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="about-dialog__footer">
          <p className="about-dialog__copyright">
            © 2024 PLC Simulator - {t('about.allRightsReserved')}
          </p>
          <button className="about-dialog__button" onClick={onClose}>
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
