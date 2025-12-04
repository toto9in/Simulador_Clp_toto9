/**
 * Unsaved Changes Indicator
 * Shows visual indicator when there are unsaved changes
 */

import './UnsavedIndicator.css';

interface UnsavedIndicatorProps {
  hasUnsavedChanges: boolean;
}

export function UnsavedIndicator({ hasUnsavedChanges }: UnsavedIndicatorProps) {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="unsaved-indicator" title="You have unsaved changes">
      <span className="unsaved-indicator__dot">●</span>
      <span className="unsaved-indicator__text">Unsaved changes</span>
    </div>
  );
}
