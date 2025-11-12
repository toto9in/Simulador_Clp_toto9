/**
 * Collapsible Panel Component
 * A reusable panel that can be expanded/collapsed with a title bar
 */

import { useState } from 'react';
import './CollapsiblePanel.css';

export interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsiblePanel({
  title,
  children,
  defaultCollapsed = false,
  className = ''
}: CollapsiblePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`collapsible-panel ${className} ${isCollapsed ? 'collapsible-panel--collapsed' : ''}`}>
      <div
        className="collapsible-panel__header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        <span className="collapsible-panel__icon">
          {isCollapsed ? '¶' : '¼'}
        </span>
        <h3 className="collapsible-panel__title">{title}</h3>
      </div>

      {!isCollapsed && (
        <div className="collapsible-panel__content">
          {children}
        </div>
      )}
    </div>
  );
}
