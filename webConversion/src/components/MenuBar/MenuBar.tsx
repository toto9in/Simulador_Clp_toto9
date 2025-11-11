/**
 * Menu Bar Component
 * Top menu with File/Edit/Help options
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { useTheme } from '../../hooks/useTheme';
import { FileIOService } from '../../services/fileIO';
import { SceneType } from '../../types/plc';
import './MenuBar.css';

interface MenuBarProps {
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenDataTable: () => void;
}

export function MenuBar({ onOpenHelp, onOpenAbout, onOpenDataTable }: MenuBarProps) {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = usePLCState();
  const { nextTheme, theme } = useTheme();

  const handleSave = async () => {
    try {
      FileIOService.saveProgramToFile(state.programText);
    } catch (error) {
      console.error('Save error:', error);
      alert(t('messages.error') + ': ' + (error as Error).message);
    }
  };

  const handleLoad = async () => {
    try {
      const programText = await FileIOService.openProgram();
      dispatch({ type: 'SET_PROGRAM_TEXT', programText });
      alert(t('messages.programLoaded'));
    } catch (error) {
      if ((error as Error).message.includes('cancelled')) return;
      console.error('Load error:', error);
      alert(t('messages.error') + ': ' + (error as Error).message);
    }
  };

  const handleChangeLanguage = () => {
    const languages = ['pt-BR', 'en', 'ja', 'de'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  const handleChangeScene = () => {
    const newScene: SceneType = state.currentScene === SceneType.DEFAULT ? SceneType.BATCH_SIMULATION : SceneType.DEFAULT;
    dispatch({ type: 'SET_SCENE', scene: newScene });
  };

  return (
    <div className="menu-bar">
      {/* File Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={handleSave}>
          <img src="/assets/bloco_notas.png" alt="Save" className="menu-icon" />
          {t('menu.save')}
        </button>
        <button className="menu-button" onClick={handleLoad}>
          {t('menu.load')}
        </button>
      </div>

      <div className="menu-divider" />

      {/* Edit Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={nextTheme} title={t('menu.theme')}>
          🎨 {t('menu.theme')} {theme}
        </button>
        <button className="menu-button" onClick={handleChangeLanguage} title={t('menu.language')}>
          🌐 {i18n.language.toUpperCase()}
        </button>
      </div>

      <div className="menu-divider" />

      {/* Simulation Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={handleChangeScene}>
          {state.currentScene === 'DEFAULT' ? t('scenes.batch') : t('scenes.default')}
        </button>
      </div>

      <div className="menu-divider" />

      {/* View Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={onOpenDataTable}>
          📊 {t('dataTable.title')}
        </button>
      </div>

      <div className="menu-divider" />

      {/* Help Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={onOpenHelp}>
          ❓ {t('menu.help')}
        </button>
        <button className="menu-button" onClick={onOpenAbout}>
          ℹ️ {t('menu.about')}
        </button>
      </div>
    </div>
  );
}
