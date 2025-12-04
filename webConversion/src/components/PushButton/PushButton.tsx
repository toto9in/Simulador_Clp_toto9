/**
 * PushButton Component
 * Customizable push button with different palettes
 * Converted from src/screens/scenes/PushButton.java
 */

import { InputType } from '../../types/plc';
import './PushButton.css';

export enum ButtonPalette {
  GRAY = 'GRAY',
  RED = 'RED',
}

interface PushButtonProps {
  inputKey: string;
  inputType: InputType.NO | InputType.NC;
  palette?: ButtonPalette;
  value: boolean;
  onPressed: (key: string) => void;
  onReleased: (key: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * PushButton - Interactive button component with visual feedback
 * Supports NO (Normally Open) and NC (Normally Closed) types
 * Supports GRAY and RED color palettes
 */
export function PushButton({
  inputKey,
  inputType,
  palette = ButtonPalette.GRAY,
  value,
  onPressed,
  onReleased,
  disabled = false,
  className = '',
}: PushButtonProps) {
  /**
   * Determine if button should be visually pressed
   * NO: Pressed when value is true
   * NC: Pressed when value is false (inverted logic)
   */
  const visuallyPressed = (inputType === InputType.NO && value) || (inputType === InputType.NC && !value);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onPressed(inputKey);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onReleased(inputKey);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onReleased(inputKey);
    }
  };

  return (
    <button
      className={`push-button push-button--${palette.toLowerCase()} ${
        visuallyPressed ? 'push-button--pressed' : ''
      } ${disabled ? 'push-button--disabled' : ''} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      title={`${inputKey} - ${inputType}`}
      type="button"
    >
      <span className="push-button__inner" />
    </button>
  );
}
