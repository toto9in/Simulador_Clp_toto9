/**
 * Scene Container Component
 * Switches between Default and Batch simulation scenes
 */

import { usePLCState } from '../../context/PLCStateContext';
import { DefaultScene } from '../DefaultScene/DefaultScene';
import { BatchScene } from '../BatchScene/BatchScene';
import './SceneContainer.css';

export function SceneContainer() {
  const { state } = usePLCState();

  return (
    <div className="scene-container">
      {state.currentScene === 'DEFAULT' ? <DefaultScene /> : <BatchScene />}
    </div>
  );
}
