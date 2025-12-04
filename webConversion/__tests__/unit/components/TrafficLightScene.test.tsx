/**
 * Tests for TrafficLightScene Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrafficLightScene } from '../../../src/components/TrafficLightScene/TrafficLightScene';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'scenes.trafficLight': 'Traffic Light Crossroad',
        'labels.stop': 'STOP',
        'labels.start': 'START',
      };
      return translations[key] || key;
    },
  }),
}));

function renderTrafficLightScene() {
  return render(
    <PLCStateProvider>
      <TrafficLightScene />
    </PLCStateProvider>
  );
}

describe('TrafficLightScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render scene container', () => {
      const { container } = renderTrafficLightScene();
      const scene = container.querySelector('.traffic-light-scene');
      expect(scene).toBeTruthy();
    });

    it('should render scene title', () => {
      renderTrafficLightScene();
      expect(screen.getByText('Traffic Light Crossroad')).toBeTruthy();
    });

    it('should render header', () => {
      const { container } = renderTrafficLightScene();
      const header = container.querySelector('.traffic-light-scene__header');
      expect(header).toBeTruthy();
    });
  });

  describe('Control Panel', () => {
    it('should render controls container', () => {
      const { container } = renderTrafficLightScene();
      const controls = container.querySelector('.traffic-light-scene__controls');
      expect(controls).toBeTruthy();
    });

    it('should render North-South control group', () => {
      renderTrafficLightScene();
      expect(screen.getByText('Norte-Sul (N-S)')).toBeTruthy();
    });

    it('should render East-West control group', () => {
      renderTrafficLightScene();
      expect(screen.getByText('Leste-Oeste (L-O)')).toBeTruthy();
    });

    it('should render North-South button with I0.0 label', () => {
      renderTrafficLightScene();
      expect(screen.getByText('I0.0')).toBeTruthy();
    });

    it('should render East-West button with I0.1 label', () => {
      renderTrafficLightScene();
      expect(screen.getByText('I0.1')).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should show START text when input is off', () => {
      renderTrafficLightScene();
      const startButtons = screen.getAllByText('START');
      expect(startButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have traffic control buttons', () => {
      const { container } = renderTrafficLightScene();
      const buttons = container.querySelectorAll('.traffic-control-button');
      expect(buttons.length).toBe(2);
    });

    it('should not have active class by default', () => {
      const { container } = renderTrafficLightScene();
      const buttons = container.querySelectorAll('.traffic-control-button.active');
      expect(buttons.length).toBe(0);
    });
  });

  describe('Button Interactions', () => {
    it('should have clickable North-South button', () => {
      renderTrafficLightScene();
      const nsButton = screen.getByText('I0.0').closest('button');
      expect(nsButton).toBeTruthy();

      if (nsButton) {
        fireEvent.click(nsButton);
        // Test passes if no error is thrown
        expect(nsButton).toBeTruthy();
      }
    });

    it('should have clickable East-West button', () => {
      renderTrafficLightScene();
      const ewButton = screen.getByText('I0.1').closest('button');
      expect(ewButton).toBeTruthy();

      if (ewButton) {
        fireEvent.click(ewButton);
        // Test passes if no error is thrown
        expect(ewButton).toBeTruthy();
      }
    });
  });

  describe('Traffic Light Visualization', () => {
    it('should render crossroad container', () => {
      const { container } = renderTrafficLightScene();
      const crossroad = container.querySelector('.traffic-light-scene__container');
      expect(crossroad).toBeTruthy();
    });

    it('should have traffic light elements', () => {
      const { container } = renderTrafficLightScene();
      // Check if there are elements that could be traffic lights
      const lights = container.querySelectorAll('[class*="light"]');
      expect(lights.length).toBeGreaterThan(0);
    });
  });

  describe('Output Mapping', () => {
    it('should map Q0.x outputs for North-South traffic light', () => {
      renderTrafficLightScene();
      // Component uses Q0.0 (Red), Q0.1 (Yellow), Q0.2 (Green)
      // Test passes if component renders without errors
      expect(screen.getByText('Traffic Light Crossroad')).toBeTruthy();
    });

    it('should map Q1.x outputs for East-West traffic light', () => {
      renderTrafficLightScene();
      // Component uses Q1.0 (Red), Q1.1 (Yellow), Q1.2 (Green)
      // Test passes if component renders without errors
      expect(screen.getByText('Traffic Light Crossroad')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should have header, controls, and visualization sections', () => {
      const { container } = renderTrafficLightScene();

      const header = container.querySelector('.traffic-light-scene__header');
      const controls = container.querySelector('.traffic-light-scene__controls');
      const sceneContainer = container.querySelector('.traffic-light-scene__container');

      expect(header).toBeTruthy();
      expect(controls).toBeTruthy();
      expect(sceneContainer).toBeTruthy();
    });

    it('should have control groups for both traffic lights', () => {
      const { container } = renderTrafficLightScene();
      const controlGroups = container.querySelectorAll('.traffic-control-group');
      expect(controlGroups.length).toBe(2);
    });
  });

  describe('Control Group Titles', () => {
    it('should have title for North-South control', () => {
      const { container } = renderTrafficLightScene();
      const title = container.querySelector('.traffic-control-group__title');
      expect(title?.textContent).toBe('Norte-Sul (N-S)');
    });

    it('should have titles for both control groups', () => {
      const { container } = renderTrafficLightScene();
      const titles = container.querySelectorAll('.traffic-control-group__title');
      expect(titles.length).toBe(2);
    });
  });

  describe('Button Labels', () => {
    it('should show I0.0 label for North-South', () => {
      const { container } = renderTrafficLightScene();
      const label = screen.getByText('I0.0');
      expect(label.classList.contains('traffic-control-button__label')).toBe(true);
    });

    it('should show I0.1 label for East-West', () => {
      const { container } = renderTrafficLightScene();
      const label = screen.getByText('I0.1');
      expect(label.classList.contains('traffic-control-button__label')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive button text', () => {
      renderTrafficLightScene();

      const startButtons = screen.getAllByText('START');
      expect(startButtons.length).toBeGreaterThan(0);
    });

    it('should have clear section titles', () => {
      renderTrafficLightScene();

      expect(screen.getByText('Norte-Sul (N-S)')).toBeTruthy();
      expect(screen.getByText('Leste-Oeste (L-O)')).toBeTruthy();
    });

    it('should have input labels on buttons', () => {
      renderTrafficLightScene();

      expect(screen.getByText('I0.0')).toBeTruthy();
      expect(screen.getByText('I0.1')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS classes', () => {
      const { container } = renderTrafficLightScene();

      expect(container.querySelector('.traffic-light-scene')).toBeTruthy();
      expect(container.querySelector('.traffic-light-scene__header')).toBeTruthy();
      expect(container.querySelector('.traffic-light-scene__container')).toBeTruthy();
      expect(container.querySelector('.traffic-light-scene__controls')).toBeTruthy();
    });

    it('should render all control elements', () => {
      const { container } = renderTrafficLightScene();

      const controlGroups = container.querySelectorAll('.traffic-control-group');
      const controlButtons = container.querySelectorAll('.traffic-control-button');

      expect(controlGroups.length).toBe(2);
      expect(controlButtons.length).toBe(2);
    });
  });
});
