import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PushButton, ButtonPalette } from '../../../src/components/PushButton/PushButton';
import { InputType } from '../../../src/types/plc';

describe('PushButton', () => {
  const mockOnPressed = vi.fn();
  const mockOnReleased = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with default gray palette', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--gray');
      expect(button).toBeTruthy();
    });

    it('should render button with red palette', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          palette={ButtonPalette.RED}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--red');
      expect(button).toBeTruthy();
    });

    it('should render with correct title attribute', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = screen.getByTitle('I0.0 - NO');
      expect(button).toBeTruthy();
    });
  });

  describe('NO (Normally Open) Button', () => {
    it('should not be visually pressed when value is false', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--pressed');
      expect(button).toBeFalsy();
    });

    it('should be visually pressed when value is true', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={true}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--pressed');
      expect(button).toBeTruthy();
    });
  });

  describe('NC (Normally Closed) Button', () => {
    it('should be visually pressed when value is false', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.1"
          inputType={InputType.NC}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--pressed');
      expect(button).toBeTruthy();
    });

    it('should not be visually pressed when value is true', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.1"
          inputType={InputType.NC}
          value={true}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = container.querySelector('.push-button--pressed');
      expect(button).toBeFalsy();
    });
  });

  describe('User Interactions', () => {
    it('should call onPressed when mouse down', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseDown(button);

      expect(mockOnPressed).toHaveBeenCalledWith('I0.0');
      expect(mockOnPressed).toHaveBeenCalledTimes(1);
    });

    it('should call onReleased when mouse up', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseUp(button);

      expect(mockOnReleased).toHaveBeenCalledWith('I0.0');
      expect(mockOnReleased).toHaveBeenCalledTimes(1);
    });

    it('should call onReleased when mouse leaves button', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseLeave(button);

      expect(mockOnReleased).toHaveBeenCalledWith('I0.0');
      expect(mockOnReleased).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should render with disabled class when disabled', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
          disabled={true}
        />
      );

      const button = container.querySelector('.push-button--disabled');
      expect(button).toBeTruthy();
    });

    it('should not call onPressed when disabled and clicked', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseDown(button);

      expect(mockOnPressed).not.toHaveBeenCalled();
    });

    it('should not call onReleased when disabled and mouse up', () => {
      render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseUp(button);

      expect(mockOnReleased).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PushButton
          inputKey="I0.0"
          inputType={InputType.NO}
          value={false}
          onPressed={mockOnPressed}
          onReleased={mockOnReleased}
          className="custom-class"
        />
      );

      const button = container.querySelector('.custom-class');
      expect(button).toBeTruthy();
    });
  });
});
