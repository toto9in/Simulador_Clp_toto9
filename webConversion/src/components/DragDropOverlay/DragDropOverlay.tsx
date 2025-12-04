/**
 * Drag Drop Overlay Component
 * Visual feedback when dragging files over the window
 */

import './DragDropOverlay.css';

interface DragDropOverlayProps {
  isVisible: boolean;
}

export function DragDropOverlay({ isVisible }: DragDropOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="drag-drop-overlay">
      <div className="drag-drop-overlay__content">
        <div className="drag-drop-overlay__icon">📁</div>
        <div className="drag-drop-overlay__text">
          Drop IL program file here
        </div>
        <div className="drag-drop-overlay__subtext">
          .txt files only
        </div>
      </div>
    </div>
  );
}
