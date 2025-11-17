import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AboutDialog } from '../../../src/components/AboutDialog/AboutDialog';

// Mock FileIOService
vi.mock('../../../src/services/fileIO', () => ({
  FileIOService: {
    isRunningInElectron: vi.fn(() => false),
  },
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'about.title': 'About',
        'about.description': 'Educational PLC Simulator with IL programming',
        'about.technology': 'Technology Stack',
        'about.features': 'Features',
        'about.instructions': 'IL Instructions',
        'about.timers': 'Timers & Delays',
        'about.counters': 'Counters',
        'about.multiLanguage': 'Multi-language',
        'about.multiTheme': 'Theme Support',
        'about.credits': 'Credits',
        'about.creditsText': 'Developed for educational purposes',
        'about.allRightsReserved': 'All Rights Reserved',
        'buttons.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

import { FileIOService } from '../../../src/services/fileIO';

describe('AboutDialog', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog title', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/About/)).toBeTruthy();
    });

    it('should render PLC Simulator title', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('PLC Simulator')).toBeTruthy();
    });

    it('should render description', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('Educational PLC Simulator with IL programming')).toBeTruthy();
    });

    it('should render version badge', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('v2.0.0')).toBeTruthy();
    });

    it('should render logo icon', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('🏭')).toBeTruthy();
    });
  });

  describe('Platform detection', () => {
    it('should show Web badge when not in Electron', () => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(false);

      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('🌐 Web')).toBeTruthy();
      expect(screen.queryByText('🖥️ Desktop')).toBeFalsy();
    });

    it('should show Desktop badge when in Electron', () => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(true);

      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('🖥️ Desktop')).toBeTruthy();
    });

    it('should show Electron technology when in Electron', () => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(true);

      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('Electron 39.1.2')).toBeTruthy();
    });

    it('should not show Electron technology when not in Electron', () => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(false);

      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.queryByText(/Electron/)).toBeFalsy();
    });
  });

  describe('Technology Stack', () => {
    beforeEach(() => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(false);
    });

    it('should display React version', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('React 18.3.1')).toBeTruthy();
    });

    it('should display TypeScript version', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('TypeScript 5.6.3')).toBeTruthy();
    });

    it('should display Vite version', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('Vite 5.4.11')).toBeTruthy();
    });
  });

  describe('Features section', () => {
    beforeEach(() => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(false);
    });

    it('should display IL instructions feature', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/IL Instructions/)).toBeTruthy();
      expect(screen.getByText(/LD, ST, AND, OR, TON, TOFF, CTU, CTD, etc/)).toBeTruthy();
    });

    it('should display timers feature', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Timers & Delays/)).toBeTruthy();
      expect(screen.getByText(/32 timers with 0.1s precision/)).toBeTruthy();
    });

    it('should display counters feature', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Counters/)).toBeTruthy();
      expect(screen.getByText(/32 up\/down counters/)).toBeTruthy();
    });

    it('should display multi-language feature', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Multi-language/)).toBeTruthy();
      expect(screen.getByText(/PT-BR, EN, JA, DE/)).toBeTruthy();
    });

    it('should display keyboard shortcuts feature', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Keyboard Shortcuts/)).toBeTruthy();
      expect(screen.getByText(/Ctrl\+S, F5, F8, and more/)).toBeTruthy();
    });
  });

  describe('UX Improvements section', () => {
    it('should list UX improvements', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Toast notifications/)).toBeTruthy();
      expect(screen.getByText(/Drag & drop file loading/)).toBeTruthy();
      expect(screen.getByText(/Unsaved changes warning/)).toBeTruthy();
      expect(screen.getByText(/Loading indicators/)).toBeTruthy();
    });
  });

  describe('Credits section', () => {
    it('should display credits', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Credits/)).toBeTruthy();
      expect(screen.getByText(/Developed for educational purposes/)).toBeTruthy();
    });

    it('should mention conversion from Java', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/Original Java version converted to modern TypeScript\/React web application./)).toBeTruthy();
    });
  });

  describe('Footer', () => {
    it('should display copyright', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText(/© 2024-2025 PLC Simulator/)).toBeTruthy();
      expect(screen.getByText(/All Rights Reserved/)).toBeTruthy();
    });

    it('should display close button', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      expect(screen.getByText('Close')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      vi.mocked(FileIOService.isRunningInElectron).mockReturnValue(false);
    });

    it('should call onClose when X button is clicked', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Close button is clicked', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay', () => {
      const { container } = render(<AboutDialog onClose={mockOnClose} />);

      const overlay = container.querySelector('.about-dialog-overlay');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking dialog content', () => {
      const { container } = render(<AboutDialog onClose={mockOnClose} />);

      const dialog = container.querySelector('.about-dialog');
      fireEvent.click(dialog!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have close button title', () => {
      render(<AboutDialog onClose={mockOnClose} />);

      const closeButton = screen.getByTitle('Close (Esc)');
      expect(closeButton).toBeTruthy();
    });
  });
});
