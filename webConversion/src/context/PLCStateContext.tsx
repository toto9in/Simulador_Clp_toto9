/**
 * PLC State Context
 * Global state management for the PLC simulator
 * Replaces the singleton HomePageModel.java
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { PLCState, InputType, ExecutionMode, Theme, Language, SceneType } from '../types/plc';
import { createInitialPLCState } from '../types/plc';

/**
 * Actions that can be dispatched to update PLC state
 */
export type PLCAction =
  | { type: 'SET_INPUT'; key: string; value: boolean }
  | { type: 'SET_INPUT_TYPE'; key: string; inputType: InputType }
  | { type: 'SET_OUTPUT'; key: string; value: boolean }
  | { type: 'SET_PROGRAM_TEXT'; programText: string }
  | { type: 'UPDATE_STATE'; state: Partial<PLCState> }
  | { type: 'SET_MODE'; mode: ExecutionMode }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_SCENE'; scene: SceneType }
  | { type: 'RESET_OUTPUTS' }
  | { type: 'RESET_MEMORY' }
  | { type: 'RESET_ALL' };

/**
 * PLC State Reducer
 * Handles all state updates
 */
function plcReducer(state: PLCState, action: PLCAction): PLCState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.key]: action.value,
        },
      };

    case 'SET_INPUT_TYPE':
      return {
        ...state,
        inputsType: {
          ...state.inputsType,
          [action.key]: action.inputType,
        },
      };

    case 'SET_OUTPUT':
      return {
        ...state,
        outputs: {
          ...state.outputs,
          [action.key]: action.value,
        },
      };

    case 'SET_PROGRAM_TEXT':
      return {
        ...state,
        programText: action.programText,
        program: [], // Clear parsed program, will be reparsed on next execution
      };

    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.state,
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.theme,
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.language,
      };

    case 'SET_SCENE':
      return {
        ...state,
        currentScene: action.scene,
      };

    case 'RESET_OUTPUTS': {
      const outputs: Record<string, boolean> = {};
      for (const key in state.outputs) {
        outputs[key] = false;
      }
      return {
        ...state,
        outputs,
      };
    }

    case 'RESET_MEMORY':
      return {
        ...state,
        memoryVariables: {},
        accumulator: false,
      };

    case 'RESET_ALL':
      return createInitialPLCState();

    default:
      return state;
  }
}

/**
 * Context type
 */
interface PLCContextType {
  state: PLCState;
  dispatch: React.Dispatch<PLCAction>;
}

/**
 * Create context
 */
const PLCStateContext = createContext<PLCContextType | undefined>(undefined);

/**
 * PLC State Provider Props
 */
interface PLCStateProviderProps {
  children: ReactNode;
  initialState?: PLCState;
}

/**
 * PLC State Provider Component
 * Wraps the application and provides PLC state to all components
 */
export function PLCStateProvider({ children, initialState }: PLCStateProviderProps) {
  const [state, dispatch] = useReducer(
    plcReducer,
    initialState ?? createInitialPLCState()
  );

  return (
    <PLCStateContext.Provider value={{ state, dispatch }}>
      {children}
    </PLCStateContext.Provider>
  );
}

/**
 * Custom hook to use PLC state
 * @returns PLC state and dispatch function
 * @throws Error if used outside PLCStateProvider
 */
export function usePLCState(): PLCContextType {
  const context = useContext(PLCStateContext);

  if (context === undefined) {
    throw new Error('usePLCState must be used within a PLCStateProvider');
  }

  return context;
}

/**
 * Helper hook to get only the state (read-only)
 */
export function usePLCStateValue(): PLCState {
  const { state } = usePLCState();
  return state;
}

/**
 * Helper hook to get only the dispatch function
 */
export function usePLCDispatch(): React.Dispatch<PLCAction> {
  const { dispatch } = usePLCState();
  return dispatch;
}
