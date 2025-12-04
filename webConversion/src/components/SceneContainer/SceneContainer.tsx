/**
 * Scene Container Component
 * Switches between Default, Batch, Traffic Light, Traffic Simulation, and Compressor scenes
 */

import { usePLCState } from '../../context/PLCStateContext';
import { SceneType } from '../../types/plc';
import { DefaultScene } from '../DefaultScene/DefaultScene';
import { BatchScene } from '../BatchScene/BatchScene';
import { TrafficLightScene } from '../TrafficLightScene/TrafficLightScene';
import { TrafficSimulationScene } from '../TrafficSimulationScene/TrafficSimulationScene';
import { CompressorScene } from '../CompressorScene/CompressorScene';
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
      case SceneType.TRAFFIC_SIMULATION:
        return <TrafficSimulationScene />;
      case SceneType.COMPRESSOR:
        return <CompressorScene />;
      default:
        return <DefaultScene />;
    }
  };

  return <div className="scene-container">{renderScene()}</div>;
}
