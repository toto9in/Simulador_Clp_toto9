/**
 * Unsaved Changes Hook
 * Tracks if program has unsaved changes and warns before losing work
 */

import { useEffect, useRef } from 'react';
import { usePLCState } from '../context/PLCStateContext';

export interface UnsavedChangesOptions {
  enabled?: boolean;
  onBeforeUnload?: () => void;
}

export function useUnsavedChanges({ enabled = true, onBeforeUnload }: UnsavedChangesOptions = {}) {
  const { state } = usePLCState();
  const savedProgramRef = useRef<string>(state.programText);
  const hasUnsavedChanges = state.programText !== savedProgramRef.current;

  // Mark as saved when explicitly saved
  const markAsSaved = () => {
    savedProgramRef.current = state.programText;
  };

  // Reset saved state (e.g., after loading a new file)
  const resetSavedState = (newProgram: string) => {
    savedProgramRef.current = newProgram;
  };

  // Warn before closing window/tab if there are unsaved changes
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set

        if (onBeforeUnload) {
          onBeforeUnload();
        }

        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, enabled, onBeforeUnload]);

  return {
    hasUnsavedChanges,
    markAsSaved,
    resetSavedState,
  };
}
