/**
 * Traffic Light Scene Component
 * Displays a crossroad intersection with 2 independent traffic lights
 * North-South (I0.0): Q0.0=Red, Q0.1=Yellow, Q0.2=Green
 * East-West (I0.1): Q1.0=Red, Q1.1=Yellow, Q1.2=Green
 */

import { useTranslation } from 'react-i18next';
import { TrafficSimulation } from '../TrafficSimulation/TrafficSimulation';
import './TrafficLightScene.css';

export function TrafficLightScene() {
  const { t } = useTranslation();

  return (
    <div className="traffic-light-scene">
      <div className="traffic-light-scene__header">
        <h2 className="traffic-light-scene__title">{t('scenes.trafficLight') || 'Traffic Light Crossroad'}</h2>
      </div>

      <div className="traffic-light-scene__container">
        {/* Traffic Simulation with Cars */}
        <div className="traffic-light-scene__simulation">
          <TrafficSimulation />
        </div>
      </div>
    </div>
  );
}
