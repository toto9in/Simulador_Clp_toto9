import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchScene } from './BatchScene';
import { InputType } from '../../types/plc';
import * as PLCContext from '../../context/PLCStateContext';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock PLC Context
const mockDispatch = vi.fn();
const mockState = {
  inputs: {
    'I0.0': false,
    'I0.1': true, // NC default
    'I1.0': false,
    'I1.1': false,
  },
  outputs: {
    'Q0.1': false,
    'Q0.2': false,
    'Q0.3': false,
    'Q1.0': false,
    'Q1.1': false,
    'Q1.2': false,
  },
  inputsType: {
    'I0.0': InputType.NO,
    'I0.1': InputType.NC,
  },
  memoryVariables: {},
};

describe('BatchScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(PLCContext, 'usePLCState').mockReturnValue({
      state: mockState as any,
      dispatch: mockDispatch,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    render(<BatchScene />);
    expect(screen.getByText('scenes.batch')).toBeInTheDocument();
    expect(screen.getByText('START')).toBeInTheDocument();
    expect(screen.getByText('STOP')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles Start button press (NO)', () => {
    render(<BatchScene />);
    const startBtn = screen.getByText('START').parentElement?.querySelector('button');
    
    if (!startBtn) throw new Error('Start button not found');

    fireEvent.mouseDown(startBtn);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_INPUT',
      key: 'I0.0',
      value: true,
    });

    fireEvent.mouseUp(startBtn);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_INPUT',
      key: 'I0.0',
      value: false,
    });
  });

  it('handles Stop button press (NC)', () => {
    render(<BatchScene />);
    const stopBtn = screen.getByText('STOP').parentElement?.querySelector('button');
    
    if (!stopBtn) throw new Error('Stop button not found');

    // NC button: true by default, false when pressed
    fireEvent.mouseDown(stopBtn);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_INPUT',
      key: 'I0.1',
      value: false,
    });

    fireEvent.mouseUp(stopBtn);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_INPUT',
      key: 'I0.1',
      value: true,
    });
  });

  it('updates sensors when tank fills', () => {
    // Mock state with Pump1 (Q0.1) ON to fill the tank
    vi.spyOn(PLCContext, 'usePLCState').mockReturnValue({
      state: {
        ...mockState,
        outputs: { ...mockState.outputs, 'Q0.1': true },
      } as any,
      dispatch: mockDispatch,
    });

    render(<BatchScene />);

    // Advance time to fill tank
    // Fill rate is 0.8 per frame (approx 60fps)
    // To reach > 1 (Low Level), we need ~2 frames
    // To reach 100 (High Level), we need ~125 frames
    
    act(() => {
      vi.advanceTimersByTime(1000); // Advance 1 second (approx 60 frames)
    });

    // Should have triggered Low Level sensor (I1.1)
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'SET_INPUT',
      key: 'I1.1',
      value: true,
    }));

    act(() => {
      vi.advanceTimersByTime(3000); // Advance more to reach full
    });

    // Should have triggered High Level sensor (I1.0)
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'SET_INPUT',
      key: 'I1.0',
      value: true,
    }));
  });

  it('shows overflow warning when overfilled and error LED is on', () => {
     // Mock state with Pump1 ON and Error LED (Q1.1) ON
     vi.spyOn(PLCContext, 'usePLCState').mockReturnValue({
      state: {
        ...mockState,
        outputs: { ...mockState.outputs, 'Q0.1': true, 'Q1.1': true },
      } as any,
      dispatch: mockDispatch,
    });

    render(<BatchScene />);

    // Fill past 100%
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/YOU OVERFILLED/i)).toBeInTheDocument();
  });

  it('resets tank when memory variables are cleared', () => {
    // This test is tricky because it relies on a transition in props (state).
    // We need to rerender with different state.
    
    const { rerender } = render(<BatchScene />);

    // Initial render has empty memory variables (mockState)
    
    // 1. Update to have memory variables
    vi.spyOn(PLCContext, 'usePLCState').mockReturnValue({
      state: {
        ...mockState,
        memoryVariables: { 'M0.0': true },
      } as any,
      dispatch: mockDispatch,
    });
    rerender(<BatchScene />);

    // 2. Update to clear memory variables (reset)
    vi.spyOn(PLCContext, 'usePLCState').mockReturnValue({
      state: {
        ...mockState,
        memoryVariables: {},
      } as any,
      dispatch: mockDispatch,
    });
    rerender(<BatchScene />);

    // We can't easily check the internal state 'tankLevel' directly, 
    // but we can check if the visual level is 0%.
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
