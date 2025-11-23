/**
 * Menu Bar Component
 * Top menu with File/Edit/Help options
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { useToastContext } from '../../context/ToastContext';
import { useTheme } from '../../hooks/useTheme';
import { useLoading } from '../../hooks/useLoading';
import { FileIOService } from '../../services/fileIO';
import { SceneType, ExecutionMode } from '../../types/plc';

import { UnsavedIndicator } from '../UnsavedIndicator/UnsavedIndicator';
import { ExamplesMenu } from '../ExamplesMenu/ExamplesMenu';
import './MenuBar.css';

interface MenuBarProps {
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenDataTable: () => void;
  hasUnsavedChanges?: boolean;
  onMarkAsSaved?: () => void;
  onResetSavedState?: (newProgram: string) => void;
  onLoadingChange?: (isLoading: boolean, message?: string) => void;
}

export function MenuBar({
  onOpenHelp,
  onOpenAbout,
  onOpenDataTable,
  hasUnsavedChanges = false,
  onMarkAsSaved,
  onResetSavedState,
  onLoadingChange
}: MenuBarProps) {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = usePLCState();
  const { nextTheme, theme } = useTheme();
  const toast = useToastContext();
  const { withLoading } = useLoading();

  const handleSave = async () => {
    await withLoading(async () => {
      if (onLoadingChange) onLoadingChange(true, 'Saving program...');
      try {
        await FileIOService.saveProgramToFile(state.programText);
        if (onMarkAsSaved) {
          onMarkAsSaved();
        }
        toast.success(t('messages.programSaved') || 'Program saved successfully!');
      } catch (error) {
        console.error('Save error:', error);
        toast.error(t('messages.error') + ': ' + (error as Error).message);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    });
  };

  const handleLoad = async () => {
    // Warn if there are unsaved changes
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Loading a new program will discard them. Continue?'
      );
      if (!confirmed) return;
    }

    await withLoading(async () => {
      if (onLoadingChange) onLoadingChange(true, 'Loading program...');
      try {
        const programText = await FileIOService.openProgram();

        // Reset PLC state and pause execution when loading a file
        dispatch({ type: 'RESET_OUTPUTS' });
        dispatch({ type: 'RESET_MEMORY' });
        dispatch({ type: 'SET_MODE', mode: ExecutionMode.IDLE });
        dispatch({ type: 'SET_PROGRAM_TEXT', programText });

        if (onResetSavedState) {
          onResetSavedState(programText);
        }
        toast.success(t('messages.programLoaded'));
      } catch (error) {
        if ((error as Error).message.includes('cancelled')) return;
        console.error('Load error:', error);
        toast.error(t('messages.error') + ': ' + (error as Error).message);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    });
  };

  const handleChangeLanguage = () => {
    const languages = ['pt-BR', 'en', 'ja', 'de'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  const handleChangeScene = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newScene = event.target.value as SceneType;

    // Reset PLC state and pause execution when changing scenes
    dispatch({ type: 'RESET_OUTPUTS' });
    dispatch({ type: 'RESET_MEMORY' });
    dispatch({ type: 'SET_MODE', mode: ExecutionMode.IDLE });
    dispatch({ type: 'SET_SCENE', scene: newScene });
  };

  return (
    <div className="menu-bar">
      {/* File Menu */}
      <div className="menu-group">
        <button className="menu-button" onClick={handleSave}>
          💾 {t('menu.save')}
        </button>
        <button className="menu-button" onClick={handleLoad}>
          📂 {t('menu.load')}
        </button>
        <ExamplesMenu
          hasUnsavedChanges={hasUnsavedChanges}
          onResetSavedState={onResetSavedState}
          onLoadingChange={onLoadingChange}
        />
        <UnsavedIndicator hasUnsavedChanges={hasUnsavedChanges} />
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
        <label className="menu-label" htmlFor="scene-select">
          🎬 {t('menu.scene')}:
        </label>
        <select
          id="scene-select"
          className="menu-select"
          value={state.currentScene}
          onChange={handleChangeScene}
        >
          <option value={SceneType.DEFAULT}>{t('scenes.default')}</option>
          <option value={SceneType.BATCH_SIMULATION}>{t('scenes.batch')}</option>
          <option value={SceneType.TRAFFIC_LIGHT}>{t('scenes.trafficLight')}</option>
          <option value={SceneType.TRAFFIC_SIMULATION}>{t('scenes.trafficSimulation')}</option>
        </select>
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
