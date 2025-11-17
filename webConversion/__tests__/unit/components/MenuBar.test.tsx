/**
 * Tests for MenuBar Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuBar } from '../../../src/components/MenuBar/MenuBar';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { ToastProvider } from '../../../src/context/ToastContext';

// Mock translation
const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

// Mock assets
vi.mock('../../../src/utils/assets', () => ({
  ASSETS: {
    BLOCO_NOTAS: '/notes.png',
  },
}));

// Mock FileIO Service
vi.mock('../../../src/services/fileIO', () => ({
  FileIOService: {
    saveProgramToFile: vi.fn().mockResolvedValue(undefined),
    openProgram: vi.fn().mockResolvedValue('LD I0.0\nOUT Q0.0'),
    isRunningInElectron: vi.fn().mockReturnValue(false),
  },
}));

// Mock hooks
vi.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'default',
    nextTheme: vi.fn(),
  }),
}));

vi.mock('../../../src/hooks/useLoading', () => ({
  useLoading: () => ({
    withLoading: (fn: () => Promise<void>) => fn(),
  }),
}));

// Mock child components
vi.mock('../../../src/components/ExamplesMenu/ExamplesMenu', () => ({
  ExamplesMenu: () => <div data-testid="examples-menu">Examples Menu</div>,
}));

vi.mock('../../../src/components/UnsavedIndicator/UnsavedIndicator', () => ({
  UnsavedIndicator: ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) => (
    <div data-testid="unsaved-indicator">{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</div>
  ),
}));

function renderMenuBar(props = {}) {
  const defaultProps = {
    onOpenHelp: vi.fn(),
    onOpenAbout: vi.fn(),
    onOpenDataTable: vi.fn(),
    hasUnsavedChanges: false,
    onMarkAsSaved: vi.fn(),
    onResetSavedState: vi.fn(),
    onLoadingChange: vi.fn(),
  };

  return render(
    <ToastProvider>
      <PLCStateProvider>
        <MenuBar {...defaultProps} {...props} />
      </PLCStateProvider>
    </ToastProvider>
  );
}

describe('MenuBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm for load tests
    global.window.confirm = vi.fn().mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render all menu buttons', () => {
      renderMenuBar();

      expect(screen.getByText('menu.save')).toBeTruthy();
      expect(screen.getByText('menu.load')).toBeTruthy();
      expect(screen.getByText('menu.help')).toBeTruthy();
      expect(screen.getByText('menu.about')).toBeTruthy();
    });

    it('should render scene selector', () => {
      renderMenuBar();

      const sceneSelect = screen.getByRole('combobox');
      expect(sceneSelect).toBeTruthy();
    });

    it('should render theme and language buttons', () => {
      renderMenuBar();

      expect(screen.getByText(/menu.theme/)).toBeTruthy();
      expect(screen.getByText('EN')).toBeTruthy();
    });

    it('should render ExamplesMenu component', () => {
      renderMenuBar();

      expect(screen.getByTestId('examples-menu')).toBeTruthy();
    });

    it('should render UnsavedIndicator component', () => {
      renderMenuBar();

      expect(screen.getByTestId('unsaved-indicator')).toBeTruthy();
    });
  });

  describe('File Operations', () => {
    it('should call onOpenHelp when Help button is clicked', () => {
      const onOpenHelp = vi.fn();
      renderMenuBar({ onOpenHelp });

      const helpButton = screen.getByText('menu.help');
      fireEvent.click(helpButton);

      expect(onOpenHelp).toHaveBeenCalled();
    });

    it('should call onOpenAbout when About button is clicked', () => {
      const onOpenAbout = vi.fn();
      renderMenuBar({ onOpenAbout });

      const aboutButton = screen.getByText('menu.about');
      fireEvent.click(aboutButton);

      expect(onOpenAbout).toHaveBeenCalled();
    });

    it('should call onOpenDataTable when Data Table button is clicked', () => {
      const onOpenDataTable = vi.fn();
      renderMenuBar({ onOpenDataTable });

      const dataTableButton = screen.getByText(/dataTable.title/);
      fireEvent.click(dataTableButton);

      expect(onOpenDataTable).toHaveBeenCalled();
    });
  });

  describe('Scene Selection', () => {
    it('should have default scene selected', () => {
      renderMenuBar();

      const sceneSelect = screen.getByRole('combobox') as HTMLSelectElement;
      expect(sceneSelect.value).toBe('DEFAULT');
    });

    it('should render all scene options', () => {
      renderMenuBar();

      expect(screen.getByText('scenes.default')).toBeTruthy();
      expect(screen.getByText('scenes.batch')).toBeTruthy();
      expect(screen.getByText('scenes.trafficLight')).toBeTruthy();
      expect(screen.getByText('scenes.trafficSimulation')).toBeTruthy();
    });

    it('should change scene when option is selected', () => {
      renderMenuBar();

      const sceneSelect = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(sceneSelect, { target: { value: 'TRAFFIC_LIGHT' } });

      expect(sceneSelect.value).toBe('TRAFFIC_LIGHT');
    });
  });

  describe('Language Switching', () => {
    it('should display current language', () => {
      renderMenuBar();

      expect(screen.getByText('EN')).toBeTruthy();
    });

    it('should call changeLanguage when language button is clicked', () => {
      renderMenuBar();

      const langButton = screen.getByText('EN');
      fireEvent.click(langButton);

      expect(mockChangeLanguage).toHaveBeenCalled();
    });
  });

  describe('Unsaved Changes', () => {
    it('should show unsaved indicator when hasUnsavedChanges is true', () => {
      renderMenuBar({ hasUnsavedChanges: true });

      const indicator = screen.getByTestId('unsaved-indicator');
      expect(indicator.textContent).toBe('Unsaved');
    });

    it('should show saved indicator when hasUnsavedChanges is false', () => {
      renderMenuBar({ hasUnsavedChanges: false });

      const indicator = screen.getByTestId('unsaved-indicator');
      expect(indicator.textContent).toBe('Saved');
    });
  });

  describe('Save Functionality', () => {
    it('should call save handler when Save button is clicked', async () => {
      const onMarkAsSaved = vi.fn();
      renderMenuBar({ onMarkAsSaved });

      const saveButton = screen.getByText('menu.save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onMarkAsSaved).toHaveBeenCalled();
      });
    });

    it('should show loading state during save', async () => {
      const onLoadingChange = vi.fn();
      renderMenuBar({ onLoadingChange });

      const saveButton = screen.getByText('menu.save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onLoadingChange).toHaveBeenCalledWith(true, 'Saving program...');
      });
    });
  });

  describe('Load Functionality', () => {
    it('should show confirm dialog when loading with unsaved changes', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      renderMenuBar({ hasUnsavedChanges: true });

      const loadButton = screen.getByText('menu.load');
      fireEvent.click(loadButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should not show confirm dialog when loading without unsaved changes', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      renderMenuBar({ hasUnsavedChanges: false });

      const loadButton = screen.getByText('menu.load');
      fireEvent.click(loadButton);

      await waitFor(() => {
        // Confirm should not be called when there are no unsaved changes
        expect(confirmSpy).not.toHaveBeenCalled();
      });
    });

    it('should call onResetSavedState when program is loaded', async () => {
      const onResetSavedState = vi.fn();
      renderMenuBar({ onResetSavedState });

      const loadButton = screen.getByText('menu.load');
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(onResetSavedState).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have title attributes on theme and language buttons', () => {
      renderMenuBar();

      expect(screen.getByTitle('menu.theme')).toBeTruthy();
      expect(screen.getByTitle('menu.language')).toBeTruthy();
    });

    it('should have label for scene select', () => {
      renderMenuBar();

      const label = screen.getByLabelText(/menu.scene/);
      expect(label).toBeTruthy();
    });

    it('should have alt text on save icon', () => {
      renderMenuBar();

      expect(screen.getByAltText('Save')).toBeTruthy();
    });
  });

  describe('Icons and Emojis', () => {
    it('should display emojis for menu items', () => {
      renderMenuBar();

      expect(screen.getByText(/🎨/)).toBeTruthy(); // Theme
      expect(screen.getByText(/🌐/)).toBeTruthy(); // Language
      expect(screen.getByText(/🎬/)).toBeTruthy(); // Scene
      expect(screen.getByText(/📊/)).toBeTruthy(); // Data Table
      expect(screen.getByText(/❓/)).toBeTruthy(); // Help
      expect(screen.getByText(/ℹ️/)).toBeTruthy(); // About
    });
  });
});
