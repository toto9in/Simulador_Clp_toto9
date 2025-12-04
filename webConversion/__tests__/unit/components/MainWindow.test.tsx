/**
 * Tests for MainWindow Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainWindow } from '../../../src/components/MainWindow/MainWindow';
import { ToastProvider } from '../../../src/context/ToastContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock all child components
vi.mock('../../../src/components/MenuBar/MenuBar', () => ({
  MenuBar: () => <div data-testid="menu-bar">MenuBar</div>,
}));

vi.mock('../../../src/components/ControlPanel/ControlPanel', () => ({
  ControlPanel: () => <div data-testid="control-panel">ControlPanel</div>,
}));

vi.mock('../../../src/components/CodeEditor/CodeEditor', () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock('../../../src/components/SceneContainer/SceneContainer', () => ({
  SceneContainer: () => <div data-testid="scene-container">SceneContainer</div>,
}));

vi.mock('../../../src/components/DataTable/DataTable', () => ({
  DataTable: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="data-table">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../../../src/components/HelpDialog/HelpDialog', () => ({
  HelpDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="help-dialog">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../../../src/components/AboutDialog/AboutDialog', () => ({
  AboutDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="about-dialog">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../../../src/components/TimerCounterStatus/TimerCounterStatus', () => ({
  TimerCounterStatus: () => <div data-testid="timer-counter-status">TimerCounterStatus</div>,
}));

vi.mock('../../../src/components/KeyboardShortcuts/KeyboardShortcuts', () => ({
  KeyboardShortcuts: () => null,
}));

vi.mock('../../../src/components/DragDropOverlay/DragDropOverlay', () => ({
  DragDropOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="drag-drop-overlay">Drag & Drop</div> : null,
}));

vi.mock('../../../src/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message || 'Loading...'}</div>
  ),
}));

vi.mock('../../../src/components/CollapsiblePanel/CollapsiblePanel', () => ({
  CollapsiblePanel: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid={`collapsible-panel-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// Mock hooks
vi.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'default',
    nextTheme: vi.fn(),
  }),
}));

vi.mock('../../../src/hooks/useExecutionCycle', () => ({
  useExecutionCycle: () => ({
    mode: 'IDLE',
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    isRunning: false,
  }),
}));

vi.mock('../../../src/hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    isDragging: false,
  }),
}));

vi.mock('../../../src/hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: () => ({
    hasUnsavedChanges: false,
    markAsSaved: vi.fn(),
    resetSavedState: vi.fn(),
  }),
}));

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => ({
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PanelGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PanelResizeHandle: () => <div data-testid="resize-handle" />,
}));

function renderMainWindow() {
  return render(
    <ToastProvider>
      <MainWindow />
    </ToastProvider>
  );
}

describe('MainWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render main window container', () => {
      const { container } = renderMainWindow();
      const mainWindow = container.querySelector('.main-window');
      expect(mainWindow).toBeTruthy();
    });

    it('should render MenuBar', () => {
      renderMainWindow();
      expect(screen.getByTestId('menu-bar')).toBeTruthy();
    });

    it('should render ControlPanel', () => {
      renderMainWindow();
      expect(screen.getByTestId('control-panel')).toBeTruthy();
    });

    it('should render CodeEditor', () => {
      renderMainWindow();
      expect(screen.getByTestId('code-editor')).toBeTruthy();
    });

    it('should render SceneContainer', () => {
      renderMainWindow();
      expect(screen.getByTestId('scene-container')).toBeTruthy();
    });

    it('should render TimerCounterStatus', () => {
      renderMainWindow();
      expect(screen.getByTestId('timer-counter-status')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should have top bar with menu and control panel', () => {
      const { container } = renderMainWindow();
      const topBar = container.querySelector('.main-window__top-bar');
      expect(topBar).toBeTruthy();
    });

    it('should have content area', () => {
      const { container } = renderMainWindow();
      const content = container.querySelector('.main-window__content');
      expect(content).toBeTruthy();
    });

    it('should have footer', () => {
      const { container } = renderMainWindow();
      const footer = container.querySelector('.main-window__footer');
      expect(footer).toBeTruthy();
    });

    it('should display mode in footer', () => {
      renderMainWindow();
      expect(screen.getByText(/Mode: IDLE/)).toBeTruthy();
    });

    it('should display theme in footer', () => {
      renderMainWindow();
      expect(screen.getByText(/Theme: default/)).toBeTruthy();
    });
  });

  describe('Collapsible Panels', () => {
    it('should render code editor in collapsible panel', () => {
      renderMainWindow();
      expect(screen.getByTestId('collapsible-panel-il-code-editor')).toBeTruthy();
      expect(screen.getByText('IL Code Editor')).toBeTruthy();
    });

    it('should render timers & counters in collapsible panel', () => {
      renderMainWindow();
      expect(screen.getByTestId('collapsible-panel-timers-&-counters')).toBeTruthy();
      expect(screen.getByText('Timers & Counters')).toBeTruthy();
    });

    it('should have resize handle between panels', () => {
      renderMainWindow();
      expect(screen.getByTestId('resize-handle')).toBeTruthy();
    });
  });

  describe('Dialogs', () => {
    it('should not show dialogs by default', () => {
      renderMainWindow();
      expect(screen.queryByTestId('data-table')).toBeFalsy();
      expect(screen.queryByTestId('help-dialog')).toBeFalsy();
      expect(screen.queryByTestId('about-dialog')).toBeFalsy();
    });
  });

  describe('Drag and Drop', () => {
    it('should not show drag overlay by default', () => {
      renderMainWindow();
      expect(screen.queryByTestId('drag-drop-overlay')).toBeFalsy();
    });
  });

  describe('Loading State', () => {
    it('should not show loading spinner by default', () => {
      renderMainWindow();
      expect(screen.queryByTestId('loading-spinner')).toBeFalsy();
    });
  });

  describe('Scene and Editor Layout', () => {
    it('should have scene area', () => {
      const { container } = renderMainWindow();
      const scene = container.querySelector('.main-window__scene');
      expect(scene).toBeTruthy();
    });

    it('should have editor panel area', () => {
      const { container } = renderMainWindow();
      const editorPanel = container.querySelector('.main-window__editor-panel');
      expect(editorPanel).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should integrate all major components', () => {
      renderMainWindow();

      // Verify all main components are rendered
      expect(screen.getByTestId('menu-bar')).toBeTruthy();
      expect(screen.getByTestId('control-panel')).toBeTruthy();
      expect(screen.getByTestId('code-editor')).toBeTruthy();
      expect(screen.getByTestId('scene-container')).toBeTruthy();
      expect(screen.getByTestId('timer-counter-status')).toBeTruthy();
    });

    it('should render collapsible panels for editor and status', () => {
      renderMainWindow();

      expect(screen.getByText('IL Code Editor')).toBeTruthy();
      expect(screen.getByText('Timers & Counters')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = renderMainWindow();

      // Main container should exist
      const mainWindow = container.querySelector('.main-window');
      expect(mainWindow).toBeTruthy();

      // Should have distinct sections
      const topBar = container.querySelector('.main-window__top-bar');
      const content = container.querySelector('.main-window__content');
      const footer = container.querySelector('.main-window__footer');

      expect(topBar).toBeTruthy();
      expect(content).toBeTruthy();
      expect(footer).toBeTruthy();
    });
  });
});
