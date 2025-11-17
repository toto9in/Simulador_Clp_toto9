/**
 * Tests for SceneContainer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SceneContainer } from '../../../src/components/SceneContainer/SceneContainer';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';
import { SceneType } from '../../../src/types/plc';

// Mock scene components
vi.mock('../../../src/components/DefaultScene/DefaultScene', () => ({
  DefaultScene: () => <div data-testid="default-scene">Default Scene</div>,
}));

vi.mock('../../../src/components/BatchScene/BatchScene', () => ({
  BatchScene: () => <div data-testid="batch-scene">Batch Scene</div>,
}));

vi.mock('../../../src/components/TrafficLightScene/TrafficLightScene', () => ({
  TrafficLightScene: () => <div data-testid="traffic-light-scene">Traffic Light Scene</div>,
}));

vi.mock('../../../src/components/TrafficSimulationScene/TrafficSimulationScene', () => ({
  TrafficSimulationScene: () => <div data-testid="traffic-simulation-scene">Traffic Simulation Scene</div>,
}));

// Mock PLCStateContext with different scenes
let mockCurrentScene = SceneType.DEFAULT;

vi.mock('../../../src/context/PLCStateContext', async () => {
  const actual = await vi.importActual<typeof import('../../../src/context/PLCStateContext')>(
    '../../../src/context/PLCStateContext'
  );
  return {
    ...actual,
    usePLCState: () => ({
      state: { currentScene: mockCurrentScene },
      dispatch: vi.fn(),
    }),
  };
});

function renderSceneContainer() {
  return render(
    <PLCStateProvider>
      <SceneContainer />
    </PLCStateProvider>
  );
}

describe('SceneContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentScene = SceneType.DEFAULT;
  });

  describe('Rendering', () => {
    it('should render container element', () => {
      const { container } = renderSceneContainer();
      const sceneContainer = container.querySelector('.scene-container');
      expect(sceneContainer).toBeTruthy();
    });

    it('should render a scene component', () => {
      renderSceneContainer();
      expect(screen.getByTestId('default-scene')).toBeTruthy();
    });
  });

  describe('Scene Switching', () => {
    it('should render DefaultScene when currentScene is DEFAULT', () => {
      mockCurrentScene = SceneType.DEFAULT;
      renderSceneContainer();

      expect(screen.getByTestId('default-scene')).toBeTruthy();
      expect(screen.queryByTestId('batch-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-light-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-simulation-scene')).toBeFalsy();
    });

    it('should render BatchScene when currentScene is BATCH_SIMULATION', () => {
      mockCurrentScene = SceneType.BATCH_SIMULATION;
      renderSceneContainer();

      expect(screen.getByTestId('batch-scene')).toBeTruthy();
      expect(screen.queryByTestId('default-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-light-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-simulation-scene')).toBeFalsy();
    });

    it('should render TrafficLightScene when currentScene is TRAFFIC_LIGHT', () => {
      mockCurrentScene = SceneType.TRAFFIC_LIGHT;
      renderSceneContainer();

      expect(screen.getByTestId('traffic-light-scene')).toBeTruthy();
      expect(screen.queryByTestId('default-scene')).toBeFalsy();
      expect(screen.queryByTestId('batch-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-simulation-scene')).toBeFalsy();
    });

    it('should render TrafficSimulationScene when currentScene is TRAFFIC_SIMULATION', () => {
      mockCurrentScene = SceneType.TRAFFIC_SIMULATION;
      renderSceneContainer();

      expect(screen.getByTestId('traffic-simulation-scene')).toBeTruthy();
      expect(screen.queryByTestId('default-scene')).toBeFalsy();
      expect(screen.queryByTestId('batch-scene')).toBeFalsy();
      expect(screen.queryByTestId('traffic-light-scene')).toBeFalsy();
    });
  });

  describe('Default Case', () => {
    it('should render DefaultScene for unknown scene type', () => {
      mockCurrentScene = 'UNKNOWN_SCENE' as SceneType;
      renderSceneContainer();

      expect(screen.getByTestId('default-scene')).toBeTruthy();
    });
  });

  describe('Scene Content', () => {
    it('should display correct text for DefaultScene', () => {
      mockCurrentScene = SceneType.DEFAULT;
      renderSceneContainer();

      expect(screen.getByText('Default Scene')).toBeTruthy();
    });

    it('should display correct text for BatchScene', () => {
      mockCurrentScene = SceneType.BATCH_SIMULATION;
      renderSceneContainer();

      expect(screen.getByText('Batch Scene')).toBeTruthy();
    });

    it('should display correct text for TrafficLightScene', () => {
      mockCurrentScene = SceneType.TRAFFIC_LIGHT;
      renderSceneContainer();

      expect(screen.getByText('Traffic Light Scene')).toBeTruthy();
    });

    it('should display correct text for TrafficSimulationScene', () => {
      mockCurrentScene = SceneType.TRAFFIC_SIMULATION;
      renderSceneContainer();

      expect(screen.getByText('Traffic Simulation Scene')).toBeTruthy();
    });
  });

  describe('Scene Type Enum', () => {
    it('should handle all SceneType enum values', () => {
      const sceneTypes = [
        SceneType.DEFAULT,
        SceneType.BATCH_SIMULATION,
        SceneType.TRAFFIC_LIGHT,
        SceneType.TRAFFIC_SIMULATION,
      ];

      sceneTypes.forEach(sceneType => {
        mockCurrentScene = sceneType;
        const { unmount } = renderSceneContainer();

        // Verify a scene is rendered (not null/undefined)
        const container = document.querySelector('.scene-container');
        expect(container?.children.length).toBeGreaterThan(0);

        unmount();
      });
    });
  });
});
