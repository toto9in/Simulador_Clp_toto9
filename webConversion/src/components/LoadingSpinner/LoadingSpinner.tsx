/**
 * Loading Spinner Component
 * Shows loading indicator for async operations
 */

import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({ size = 'medium', message, overlay = false }: LoadingSpinnerProps) {
  const content = (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__circle"></div>
      {message && <div className="loading-spinner__message">{message}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        {content}
      </div>
    );
  }

  return content;
}
