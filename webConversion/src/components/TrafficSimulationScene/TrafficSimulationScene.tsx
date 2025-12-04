/**
 * Traffic Simulation Scene Component
 * Displays a traffic light crossroad with animated cars obeying the lights
 * Includes collision detection and traffic control
 */

import { useTranslation } from 'react-i18next';
import { TrafficSimulation } from '../TrafficSimulation/TrafficSimulation';
import './TrafficSimulationScene.css';

export function TrafficSimulationScene() {
  const { t } = useTranslation();

  return (
    <div className="traffic-simulation-scene">
      <div className="traffic-simulation-scene__header">
        <h2 className="traffic-simulation-scene__title">
          {t('scenes.trafficSimulation') || 'Semáforo (Tráfego)'}
        </h2>
      </div>

      <div className="traffic-simulation-scene__container">
        <TrafficSimulation />
      </div>
    </div>
  );
}
