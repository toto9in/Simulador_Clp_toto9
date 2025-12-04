/**
 * Theme Hook
 * Manages theme switching (4 color themes)
 * Converted from src/ilcompiler/edit/Colors.java
 */

import { useEffect } from 'react';
import { Theme } from '../types/plc';
import { usePLCState } from '../context/PLCStateContext';

/**
 * Hook to manage application theme
 */
export function useTheme() {
  const { state, dispatch } = usePLCState();

  /**
   * Set theme and persist to localStorage
   */
  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', theme });
    localStorage.setItem('plc-theme', theme.toString());
  };

  /**
   * Cycle to next theme (1 → 2 → 3 → 4 → 1)
   */
  const nextTheme = () => {
    const next = (state.theme % 4) + 1;
    setTheme(next as Theme);
  };

  /**
   * Apply theme to document root
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme.toString());
  }, [state.theme]);

  /**
   * Load theme from localStorage on mount
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('plc-theme');
    if (savedTheme) {
      const theme = parseInt(savedTheme, 10);
      if (theme >= 1 && theme <= 4) {
        dispatch({ type: 'SET_THEME', theme: theme as Theme });
      }
    }
  }, [dispatch]);

  return {
    theme: state.theme,
    setTheme,
    nextTheme,
  };
}
