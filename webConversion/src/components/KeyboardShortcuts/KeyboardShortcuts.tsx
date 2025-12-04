/**
 * Keyboard Shortcuts Component
 * Manages global keyboard shortcuts
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { useToastContext } from '../../context/ToastContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { FileIOService } from '../../services/fileIO';
import { ExecutionMode } from '../../types/plc';

interface KeyboardShortcutsProps {
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenDataTable: () => void;
}

export function KeyboardShortcuts({ onOpenHelp, onOpenAbout, onOpenDataTable }: KeyboardShortcutsProps) {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const toast = useToastContext();

  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    // File operations
    {
      key: 's',
      ctrl: true,
      handler: async () => {
        try {
          await FileIOService.saveProgramToFile(state.programText);
          toast.success(t('messages.programSaved') || 'Program saved!');
        } catch (error) {
          toast.error(t('messages.error') + ': ' + (error as Error).message);
        }
      },
      description: 'Save program'
    },
    {
      key: 'o',
      ctrl: true,
      handler: async () => {
        try {
          const programText = await FileIOService.openProgram();
          dispatch({ type: 'SET_PROGRAM_TEXT', programText });
          toast.success(t('messages.programLoaded'));
        } catch (error) {
          if (!(error as Error).message.includes('cancelled')) {
            toast.error(t('messages.error') + ': ' + (error as Error).message);
          }
        }
      },
      description: 'Open program'
    },

    // Execution control
    {
      key: 'F5',
      handler: () => {
        if (state.mode === ExecutionMode.RUNNING) {
          dispatch({ type: 'SET_MODE', mode: ExecutionMode.STOPPED });
          toast.info('Execution stopped');
        } else {
          dispatch({ type: 'SET_MODE', mode: ExecutionMode.RUNNING });
          toast.success('Execution started');
        }
      },
      description: 'Toggle RUN/STOP'
    },
    {
      key: 'F6',
      handler: () => {
        dispatch({ type: 'SET_MODE', mode: ExecutionMode.IDLE });
        toast.info('Switched to PROGRAM mode');
      },
      description: 'Switch to PROGRAM mode'
    },
    {
      key: 'F7',
      handler: () => {
        dispatch({ type: 'SET_MODE', mode: ExecutionMode.STOPPED });
        toast.warning('Execution stopped');
      },
      description: 'STOP execution'
    },
    {
      key: 'F8',
      handler: () => {
        dispatch({ type: 'RESET_OUTPUTS' });
        dispatch({ type: 'RESET_MEMORY' });
        dispatch({ type: 'SET_MODE', mode: ExecutionMode.IDLE });
        toast.success('All variables reset');
      },
      description: 'RESET all variables'
    },

    // View controls
    {
      key: 'd',
      ctrl: true,
      handler: () => {
        onOpenDataTable();
      },
      description: 'Open Data Table'
    },
    {
      key: 'F1',
      handler: () => {
        onOpenHelp();
      },
      description: 'Open Help'
    },
    {
      key: 'F2',
      handler: () => {
        onOpenAbout();
      },
      description: 'Open About'
    },

    // Navigation
    {
      key: 'Escape',
      handler: () => {
        // Close any open dialogs (handled by dialog components)
        // This is just for prevention of default behavior
      },
      description: 'Close dialogs'
    }
  ], [state.mode, state.programText, dispatch, toast, t, onOpenHelp, onOpenAbout, onOpenDataTable]);

  useKeyboardShortcuts(shortcuts, true);

  return null; // This component doesn't render anything
}
