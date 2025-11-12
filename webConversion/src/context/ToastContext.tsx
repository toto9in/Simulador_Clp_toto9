/**
 * Toast Context
 * Provides toast notifications throughout the application
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast/ToastContainer';
import type { ToastType } from '../components/Toast/Toast';

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  addToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, removeToast, success, error, warning, info, addToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
