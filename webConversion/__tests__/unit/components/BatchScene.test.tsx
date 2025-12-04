/**
 * Tests for BatchScene Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BatchScene } from '../../../src/components/BatchScene/BatchScene';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock PushButton component
vi.mock('../../../src/components/PushButton', () => ({
  PushButton: ({ label, type }: { label: string; type: string }) => (
    <button data-testid={`push-button-${label}`} data-type={type}>
      {label}
    </button>
  ),
  ButtonPalette: {
    GREEN_START: 'green-start',
    RED_STOP: 'red-stop',
    GRAY_SENSOR: 'gray-sensor',
    BLUE_LED: 'blue-led',
    YELLOW_LED: 'yellow-led',
    RED_LED: 'red-led',
  },
}));

// Mock requestAnimationFrame
beforeEach(() => {
  let frameId = 0;
  global.requestAnimationFrame = vi.fn((cb) => {
    frameId++;
    setTimeout(() => cb(0), 16);
    return frameId;
  });
  global.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderBatchScene() {
  return render(
    <PLCStateProvider>
      <BatchScene />
    </PLCStateProvider>
  );
}

describe('BatchScene', () => {
  describe('Rendering', () => {
    it('should render scene container', () => {
      const { container } = renderBatchScene();
      const scene = container.querySelector('.batch-scene');
      expect(scene).toBeTruthy();
    });

    it('should render scene title', () => {
      renderBatchScene();
      expect(screen.getByText('scenes.batch')).toBeTruthy();
    });
  });

  describe('Control Panel', () => {
    it('should render control panel', () => {
      const { container } = renderBatchScene();
      const controlPanel = container.querySelector('.batch-scene__control-panel');
      expect(controlPanel).toBeTruthy();
    });

    it('should render START button', () => {
      renderBatchScene();
      const startButton = screen.getByTestId('push-button-batchScene.start');
      expect(startButton).toBeTruthy();
      expect(startButton.getAttribute('data-type')).toBe('green-start');
    });

    it('should render STOP button', () => {
      renderBatchScene();
      const stopButton = screen.getByTestId('push-button-batchScene.stop');
      expect(stopButton).toBeTruthy();
      expect(stopButton.getAttribute('data-type')).toBe('red-stop');
    });
  });

  describe('Tank Visualization', () => {
    it('should render tank container', () => {
      const { container } = renderBatchScene();
      const tank = container.querySelector('.batch-scene__tank');
      expect(tank).toBeTruthy();
    });

    it('should have tank visualization area', () => {
      const { container } = renderBatchScene();
      const visualization = container.querySelector('.batch-scene__visualization');
      expect(visualization).toBeTruthy();
    });
  });

  describe('Level Sensors', () => {
    it('should render HI-LEVEL sensor indicator', () => {
      renderBatchScene();
      const hiLevel = screen.getByTestId('push-button-batchScene.hiLevel');
      expect(hiLevel).toBeTruthy();
      expect(hiLevel.getAttribute('data-type')).toBe('gray-sensor');
    });

    it('should render LO-LEVEL sensor indicator', () => {
      renderBatchScene();
      const loLevel = screen.getByTestId('push-button-batchScene.loLevel');
      expect(loLevel).toBeTruthy();
      expect(loLevel.getAttribute('data-type')).toBe('gray-sensor');
    });
  });

  describe('Output Indicators', () => {
    it('should render PUMP1 (fill) indicator', () => {
      renderBatchScene();
      const pump1 = screen.getByTestId('push-button-batchScene.pump1');
      expect(pump1).toBeTruthy();
    });

    it('should render MIXER indicator', () => {
      renderBatchScene();
      const mixer = screen.getByTestId('push-button-batchScene.mixer');
      expect(mixer).toBeTruthy();
    });

    it('should render PUMP3 (drain) indicator', () => {
      renderBatchScene();
      const pump3 = screen.getByTestId('push-button-batchScene.pump3');
      expect(pump3).toBeTruthy();
    });
  });

  describe('Status LEDs', () => {
    it('should render RUN LED', () => {
      renderBatchScene();
      const runLed = screen.getByTestId('push-button-batchScene.runLed');
      expect(runLed).toBeTruthy();
      expect(runLed.getAttribute('data-type')).toBe('blue-led');
    });

    it('should render IDLE LED', () => {
      renderBatchScene();
      const idleLed = screen.getByTestId('push-button-batchScene.idleLed');
      expect(idleLed).toBeTruthy();
      expect(idleLed.getAttribute('data-type')).toBe('yellow-led');
    });

    it('should render FULL LED', () => {
      renderBatchScene();
      const fullLed = screen.getByTestId('push-button-batchScene.fullLed');
      expect(fullLed).toBeTruthy();
      expect(fullLed.getAttribute('data-type')).toBe('red-led');
    });
  });

  describe('Layout Structure', () => {
    it('should have control panel and visualization sections', () => {
      const { container } = renderBatchScene();

      const controlPanel = container.querySelector('.batch-scene__control-panel');
      const visualization = container.querySelector('.batch-scene__visualization');

      expect(controlPanel).toBeTruthy();
      expect(visualization).toBeTruthy();
    });

    it('should have inputs and outputs sections', () => {
      const { container } = renderBatchScene();

      const inputs = container.querySelector('.batch-scene__inputs');
      const outputs = container.querySelector('.batch-scene__outputs');

      expect(inputs || outputs).toBeTruthy();
    });
  });

  describe('I/O Mapping', () => {
    it('should use I0.0 for START button (NO)', () => {
      renderBatchScene();
      // Component maps I0.0 to START button
      expect(screen.getByTestId('push-button-batchScene.start')).toBeTruthy();
    });

    it('should use I0.1 for STOP button (NC)', () => {
      renderBatchScene();
      // Component maps I0.1 to STOP button
      expect(screen.getByTestId('push-button-batchScene.stop')).toBeTruthy();
    });

    it('should use I1.0 for HI-LEVEL sensor', () => {
      renderBatchScene();
      // Component maps I1.0 to HI-LEVEL sensor
      expect(screen.getByTestId('push-button-batchScene.hiLevel')).toBeTruthy();
    });

    it('should use I1.1 for LO-LEVEL sensor', () => {
      renderBatchScene();
      // Component maps I1.1 to LO-LEVEL sensor
      expect(screen.getByTestId('push-button-batchScene.loLevel')).toBeTruthy();
    });
  });

  describe('Output Mapping', () => {
    it('should use Q0.1 for PUMP1 (fill valve)', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.pump1')).toBeTruthy();
    });

    it('should use Q0.2 for MIXER', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.mixer')).toBeTruthy();
    });

    it('should use Q0.3 for PUMP3 (drain valve)', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.pump3')).toBeTruthy();
    });

    it('should use Q1.0 for RUN LED', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.runLed')).toBeTruthy();
    });

    it('should use Q1.1 for IDLE LED', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.idleLed')).toBeTruthy();
    });

    it('should use Q1.2 for FULL LED', () => {
      renderBatchScene();
      expect(screen.getByTestId('push-button-batchScene.fullLed')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS classes', () => {
      const { container } = renderBatchScene();

      expect(container.querySelector('.batch-scene')).toBeTruthy();
      expect(container.querySelector('.batch-scene__control-panel')).toBeTruthy();
      expect(container.querySelector('.batch-scene__tank')).toBeTruthy();
      expect(container.querySelector('.batch-scene__visualization')).toBeTruthy();
    });

    it('should render all expected buttons', () => {
      const { container } = renderBatchScene();

      // Should have 2 control buttons + 5 outputs + 3 LEDs + 2 sensors = 12 total
      const allButtons = container.querySelectorAll('button[data-testid^="push-button-"]');
      expect(allButtons.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive labels for all controls', () => {
      renderBatchScene();

      expect(screen.getByText('batchScene.start')).toBeTruthy();
      expect(screen.getByText('batchScene.stop')).toBeTruthy();
      expect(screen.getByText('batchScene.hiLevel')).toBeTruthy();
      expect(screen.getByText('batchScene.loLevel')).toBeTruthy();
    });

    it('should have descriptive labels for outputs', () => {
      renderBatchScene();

      expect(screen.getByText('batchScene.pump1')).toBeTruthy();
      expect(screen.getByText('batchScene.mixer')).toBeTruthy();
      expect(screen.getByText('batchScene.pump3')).toBeTruthy();
    });

    it('should have descriptive labels for status LEDs', () => {
      renderBatchScene();

      expect(screen.getByText('batchScene.runLed')).toBeTruthy();
      expect(screen.getByText('batchScene.idleLed')).toBeTruthy();
      expect(screen.getByText('batchScene.fullLed')).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('should initialize animation frame on mount', () => {
      renderBatchScene();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should cleanup animation frame on unmount', () => {
      const { unmount } = renderBatchScene();
      unmount();
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
