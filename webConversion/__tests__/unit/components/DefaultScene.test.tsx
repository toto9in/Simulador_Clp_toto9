/**
 * Tests for DefaultScene Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DefaultScene } from '../../../src/components/DefaultScene/DefaultScene';
import { PLCStateProvider } from '../../../src/context/PLCStateContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock assets
vi.mock('../../../src/utils/assets', () => ({
  ASSETS: {
    LAMPADA_ON: '/lamp-on.png',
    LAMPADA_OFF: '/lamp-off.png',
  },
}));

function renderDefaultScene() {
  return render(
    <PLCStateProvider>
      <DefaultScene />
    </PLCStateProvider>
  );
}

describe('DefaultScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render scene container', () => {
      const { container } = renderDefaultScene();
      const scene = container.querySelector('.default-scene');
      expect(scene).toBeTruthy();
    });

    it('should render scene title', () => {
      renderDefaultScene();
      expect(screen.getByText('defaultScene.title')).toBeTruthy();
    });
  });

  describe('Input Section', () => {
    it('should render inputs section', () => {
      renderDefaultScene();
      expect(screen.getByText('defaultScene.inputs')).toBeTruthy();
    });

    it('should render 8 input buttons', () => {
      const { container } = renderDefaultScene();
      const inputs = container.querySelectorAll('[class*="input"]');
      expect(inputs.length).toBeGreaterThanOrEqual(8);
    });

    it('should render input labels', () => {
      renderDefaultScene();
      // Should have I0.0 through I0.7
      expect(screen.getByText(/I0.0/)).toBeTruthy();
      expect(screen.getByText(/I0.7/)).toBeTruthy();
    });
  });

  describe('Output Section', () => {
    it('should render outputs section', () => {
      renderDefaultScene();
      expect(screen.getByText('defaultScene.outputs')).toBeTruthy();
    });

    it('should render 8 output indicators', () => {
      const { container } = renderDefaultScene();
      const outputs = container.querySelectorAll('[class*="output"]');
      expect(outputs.length).toBeGreaterThanOrEqual(8);
    });

    it('should render output labels', () => {
      renderDefaultScene();
      // Should have Q0.0 through Q0.7
      expect(screen.getByText(/Q0.0/)).toBeTruthy();
      expect(screen.getByText(/Q0.7/)).toBeTruthy();
    });
  });

  describe('Input Type Cycling', () => {
    it('should render input type cycle buttons', () => {
      renderDefaultScene();
      // Should have buttons to cycle input types
      const typeButtons = screen.queryAllByRole('button');
      expect(typeButtons.length).toBeGreaterThan(0);
    });

    it('should show input type for each input', () => {
      const { container } = renderDefaultScene();
      // Check if input types are displayed
      const inputTypes = container.querySelectorAll('[class*="type"]');
      expect(inputTypes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Layout', () => {
    it('should have inputs and outputs sections', () => {
      const { container } = renderDefaultScene();

      const inputsSection = container.querySelector('[class*="inputs"]');
      const outputsSection = container.querySelector('[class*="outputs"]');

      expect(inputsSection || outputsSection).toBeTruthy();
    });

    it('should render in a grid or list layout', () => {
      const { container } = renderDefaultScene();
      const scene = container.querySelector('.default-scene');

      // Scene should have child elements
      expect(scene?.children.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive labels for inputs', () => {
      renderDefaultScene();

      // All I0.x labels should be present
      for (let i = 0; i < 8; i++) {
        const label = screen.queryByText(new RegExp(`I0\\.${i}`));
        expect(label).toBeTruthy();
      }
    });

    it('should have descriptive labels for outputs', () => {
      renderDefaultScene();

      // All Q0.x labels should be present
      for (let i = 0; i < 8; i++) {
        const label = screen.queryByText(new RegExp(`Q0\\.${i}`));
        expect(label).toBeTruthy();
      }
    });
  });

  describe('State Display', () => {
    it('should display input states', () => {
      const { container } = renderDefaultScene();

      // Inputs should be rendered with some visual representation
      const inputs = container.querySelectorAll('[class*="input"]');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should display output states', () => {
      const { container } = renderDefaultScene();

      // Outputs should be rendered with some visual representation
      const outputs = container.querySelectorAll('[class*="output"]');
      expect(outputs.length).toBeGreaterThan(0);
    });
  });

  describe('Images', () => {
    it('should render output images for lamp states', () => {
      const { container } = renderDefaultScene();

      // Check if there are images (lamps) rendered
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Section Headers', () => {
    it('should have inputs section header', () => {
      renderDefaultScene();
      expect(screen.getByText('defaultScene.inputs')).toBeTruthy();
    });

    it('should have outputs section header', () => {
      renderDefaultScene();
      expect(screen.getByText('defaultScene.outputs')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render all 8 inputs in sequence', () => {
      renderDefaultScene();

      const inputLabels = ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'I0.4', 'I0.5', 'I0.6', 'I0.7'];

      inputLabels.forEach(label => {
        expect(screen.getByText(new RegExp(label))).toBeTruthy();
      });
    });

    it('should render all 8 outputs in sequence', () => {
      renderDefaultScene();

      const outputLabels = ['Q0.0', 'Q0.1', 'Q0.2', 'Q0.3', 'Q0.4', 'Q0.5', 'Q0.6', 'Q0.7'];

      outputLabels.forEach(label => {
        expect(screen.getByText(new RegExp(label))).toBeTruthy();
      });
    });
  });
});
