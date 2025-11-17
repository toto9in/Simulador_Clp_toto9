/**
 * About Dialog Component
 * Shows application information, version, and technologies
 * Converted from src/screens/Sobre.java
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileIOService } from '../../services/fileIO';
import './AboutDialog.css';

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const { t } = useTranslation();
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(FileIOService.isRunningInElectron());
  }, []);

  return (
    <div className="about-dialog-overlay" onClick={onClose}>
      <div className="about-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="about-dialog__header">
          <h2 className="about-dialog__title">ℹ️ {t('about.title')}</h2>
          <button className="about-dialog__close" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="about-dialog__content">
          <div className="about-logo">
            <div className="about-logo__icon">🏭</div>
            <h1 className="about-logo__title">PLC Simulator</h1>
            <p className="about-logo__subtitle">{t('about.description')}</p>
            <div className="about-logo__badges">
              <span className="about-badge">v2.0.0</span>
              {isElectron && <span className="about-badge about-badge--electron">🖥️ Desktop</span>}
              {!isElectron && <span className="about-badge about-badge--web">🌐 Web</span>}
            </div>
          </div>

          {/* Technology Stack */}
          <section className="about-section">
            <h3 className="about-section__title">⚙️ {t('about.technology')}</h3>
            <div className="about-tech-grid">
              <div className="about-tech-item">
                <span className="about-tech-item__icon">⚛️</span>
                <div>
                  <strong>React 18.3.1</strong>
                  <p>UI Framework</p>
                </div>
              </div>
              <div className="about-tech-item">
                <span className="about-tech-item__icon">📘</span>
                <div>
                  <strong>TypeScript 5.6.3</strong>
                  <p>Type Safety</p>
                </div>
              </div>
              <div className="about-tech-item">
                <span className="about-tech-item__icon">⚡</span>
                <div>
                  <strong>Vite 5.4.11</strong>
                  <p>Build Tool</p>
                </div>
              </div>
              {isElectron && (
                <div className="about-tech-item">
                  <span className="about-tech-item__icon">🖥️</span>
                  <div>
                    <strong>Electron 39.1.2</strong>
                    <p>Desktop App</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Features */}
          <section className="about-section">
            <h3 className="about-section__title">✨ {t('about.features')}</h3>
            <div className="about-features">
              <div className="about-feature">
                <span className="about-feature__icon">📝</span>
                <div>
                  <strong>12 {t('about.instructions')}</strong>
                  <p>LD, ST, AND, OR, TON, TOFF, CTU, CTD, etc</p>
                </div>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">⏱️</span>
                <div>
                  <strong>{t('about.timers')}</strong>
                  <p>32 timers with 0.1s precision</p>
                </div>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">🔢</span>
                <div>
                  <strong>{t('about.counters')}</strong>
                  <p>32 up/down counters</p>
                </div>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">🌐</span>
                <div>
                  <strong>{t('about.multiLanguage')}</strong>
                  <p>PT-BR, EN, JA, DE</p>
                </div>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">🎨</span>
                <div>
                  <strong>{t('about.multiTheme')}</strong>
                  <p>Multiple color schemes</p>
                </div>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">⌨️</span>
                <div>
                  <strong>Keyboard Shortcuts</strong>
                  <p>Ctrl+S, F5, F8, and more</p>
                </div>
              </div>
            </div>
          </section>

          {/* UX Improvements */}
          <section className="about-section">
            <h3 className="about-section__title">💎 UX Improvements</h3>
            <div className="about-ux-list">
              <div className="about-ux-item">
                <span className="about-ux-icon">✓</span>
                Toast notifications (no more alerts!)
              </div>
              <div className="about-ux-item">
                <span className="about-ux-icon">✓</span>
                Drag & drop file loading
              </div>
              <div className="about-ux-item">
                <span className="about-ux-icon">✓</span>
                Unsaved changes warning
              </div>
              <div className="about-ux-item">
                <span className="about-ux-icon">✓</span>
                Loading indicators
              </div>
              {isElectron && (
                <div className="about-ux-item">
                  <span className="about-ux-icon">✓</span>
                  Native file dialogs (Electron)
                </div>
              )}
            </div>
          </section>

          {/* Credits */}
          <section className="about-section">
            <h3 className="about-section__title">👥 {t('about.credits')}</h3>
            <p className="about-credits__text">{t('about.creditsText')}</p>
            <p className="about-credits__text">
              Original Java version converted to modern TypeScript/React web application.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="about-dialog__footer">
          <p className="about-dialog__copyright">
            © 2024-2025 PLC Simulator - {t('about.allRightsReserved')}
          </p>
          <button className="about-dialog__button" onClick={onClose}>
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
