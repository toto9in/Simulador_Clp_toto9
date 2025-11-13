/**
 * Scene Container Component
 * Switches between Default, Batch, and Traffic Light simulation scenes
 */

import { usePLCState } from '../../context/PLCStateContext';
import { SceneType } from '../../types/plc';
import { DefaultScene } from '../DefaultScene/DefaultScene';
import { BatchScene } from '../BatchScene/BatchScene';
import { TrafficLightScene } from '../TrafficLightScene/TrafficLightScene';
import './SceneContainer.css';

export function SceneContainer() {
  const { state } = usePLCState();

  const renderScene = () => {
    switch (state.currentScene) {
      case SceneType.DEFAULT:
        return <DefaultScene />;
      case SceneType.BATCH_SIMULATION:
        return <BatchScene />;
      case SceneType.TRAFFIC_LIGHT:
        return <TrafficLightScene />;
      default:
        return <DefaultScene />;
    }
  };

  return (
    <div className="scene-container">
      {renderScene()}
    </div>
  );
}
