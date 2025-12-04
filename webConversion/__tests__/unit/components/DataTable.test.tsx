import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../../../src/components/DataTable/DataTable';
import type { PLCState } from '../../../src/types/plc';

// Mock the context
vi.mock('../../../src/context/PLCStateContext', () => ({
  usePLCState: vi.fn(),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dataTable.title': 'Memory Variables',
        'dataTable.variable': 'Variable',
        'dataTable.type': 'Type',
        'dataTable.value': 'Value',
        'dataTable.preset': 'Preset',
        'dataTable.accumulated': 'Accumulated',
        'dataTable.noVariables': 'No variables in memory',
        'dataTable.count': 'Total',
        'buttons.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

import { usePLCState } from '../../../src/context/PLCStateContext';

describe('DataTable', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with empty state', () => {
    beforeEach(() => {
      const emptyState: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {},
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: emptyState,
        dispatch: vi.fn(),
      });
    });

    it('should render title', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('Memory Variables')).toBeTruthy();
    });

    it('should show no variables message when memory is empty', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('No variables in memory')).toBeTruthy();
    });

    it('should show count of 0 variables', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('Total: 0')).toBeTruthy();
    });
  });

  describe('Rendering with timer variables', () => {
    beforeEach(() => {
      const stateWithTimer: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          T0: {
            id: 'T0',
            type: 'TIMER',
            timerType: 'TON',
            currentValue: false,
            preset: 10,
            accumulated: 5,
            enabled: true,
            done: false,
          },
          T1: {
            id: 'T1',
            type: 'TIMER',
            timerType: 'TOFF',
            currentValue: true,
            preset: 20,
            accumulated: 15,
            enabled: false,
            done: true,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithTimer,
        dispatch: vi.fn(),
      });
    });

    it('should display timer variables', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('T0')).toBeTruthy();
      expect(screen.getByText('T1')).toBeTruthy();
    });

    it('should show correct timer types', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('TON')).toBeTruthy();
      expect(screen.getByText('TOFF')).toBeTruthy();
    });

    it('should display preset values', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const presetCells = container.querySelectorAll('.data-table__preset');
      expect(presetCells[0].textContent).toBe('10');
      expect(presetCells[1].textContent).toBe('20');
    });

    it('should display accumulated values', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const accCells = container.querySelectorAll('.data-table__accumulated');
      expect(accCells[0].textContent).toBe('5');
      expect(accCells[1].textContent).toBe('15');
    });

    it('should display EN flags', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const enFlags = container.querySelectorAll('.data-table__flag');
      // T0 enabled=true, T1 enabled=false
      expect(enFlags[0].textContent).toBe('1');
      expect(enFlags[2].textContent).toBe('0');
    });

    it('should display DN flags', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const dnFlags = container.querySelectorAll('.data-table__flag');
      // T0 done=false, T1 done=true
      expect(dnFlags[1].textContent).toBe('0');
      expect(dnFlags[3].textContent).toBe('1');
    });

    it('should show count of 2 variables', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('Total: 2')).toBeTruthy();
    });
  });

  describe('Rendering with counter variables', () => {
    beforeEach(() => {
      const stateWithCounter: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          C0: {
            id: 'C0',
            type: 'COUNTER',
            counterType: 'CTU',
            currentValue: false,
            preset: 10,
            accumulated: 3,
            enabled: true,
            done: false,
          },
          C1: {
            id: 'C1',
            type: 'COUNTER',
            counterType: 'CTD',
            currentValue: true,
            preset: 5,
            accumulated: 2,
            enabled: false,
            done: true,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithCounter,
        dispatch: vi.fn(),
      });
    });

    it('should display counter variables', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('C0')).toBeTruthy();
      expect(screen.getByText('C1')).toBeTruthy();
    });

    it('should show correct counter types', () => {
      render(<DataTable onClose={mockOnClose} />);

      expect(screen.getByText('CTU')).toBeTruthy();
      expect(screen.getByText('CTD')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      const emptyState: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {},
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: emptyState,
        dispatch: vi.fn(),
      });
    });

    it('should call onClose when close button is clicked', () => {
      render(<DataTable onClose={mockOnClose} />);

      const closeButtons = screen.getAllByText('✕');
      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when footer close button is clicked', () => {
      render(<DataTable onClose={mockOnClose} />);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const overlay = container.querySelector('.data-table-overlay');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking table content', () => {
      const { container } = render(<DataTable onClose={mockOnClose} />);

      const table = container.querySelector('.data-table');
      fireEvent.click(table!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Value formatting', () => {
    it('should format currentValue as 1 or 0', () => {
      const stateWithValues: PLCState = {
        inputs: {},
        outputs: {},
        memoryVariables: {
          T0: {
            id: 'T0',
            type: 'TIMER',
            timerType: 'TON',
            currentValue: true,
            preset: 10,
            accumulated: 5,
            enabled: true,
            done: false,
          },
          T1: {
            id: 'T1',
            type: 'TIMER',
            timerType: 'TON',
            currentValue: false,
            preset: 10,
            accumulated: 2,
            enabled: false,
            done: false,
          },
        },
        accumulator: null,
        programCounter: 0,
        isRunning: false,
      };

      vi.mocked(usePLCState).mockReturnValue({
        state: stateWithValues,
        dispatch: vi.fn(),
      });

      const { container } = render(<DataTable onClose={mockOnClose} />);

      const valueCells = container.querySelectorAll('.data-table__value');
      expect(valueCells[0].textContent).toBe('1');
      expect(valueCells[1].textContent).toBe('0');
    });
  });
});
