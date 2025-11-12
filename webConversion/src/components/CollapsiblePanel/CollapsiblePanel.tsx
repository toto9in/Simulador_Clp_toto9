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
        <svg
          className="collapsible-panel__icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease' }}
        >
          <path d="M4 2 L9 6 L4 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
