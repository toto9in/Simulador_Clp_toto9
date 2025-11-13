/**
 * Traffic Light Scene Component
 * Displays a crossroad intersection with 2 independent traffic lights
 * North-South (I0.0): Q0.0=Red, Q0.1=Yellow, Q0.2=Green
 * East-West (I0.1): Q1.0=Red, Q1.1=Yellow, Q1.2=Green
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import './TrafficLightScene.css';

export function TrafficLightScene() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();

  // Traffic light 1 (North-South) uses Q0.x
  const light1Red = state.outputs['Q0.0'];
  const light1Yellow = state.outputs['Q0.1'];
  const light1Green = state.outputs['Q0.2'];

  // Traffic light 2 (East-West) uses Q1.x for independent control
  const light2Red = state.outputs['Q1.0'];
  const light2Yellow = state.outputs['Q1.1'];
  const light2Green = state.outputs['Q1.2'];

  // Toggle input I0.0 for North-South traffic light
  const toggleNorthSouth = () => {
    dispatch({
      type: 'SET_INPUT',
      key: 'I0.0',
      value: !state.inputs['I0.0']
    });
  };

  // Toggle input I0.1 for East-West traffic light
  const toggleEastWest = () => {
    dispatch({
      type: 'SET_INPUT',
      key: 'I0.1',
      value: !state.inputs['I0.1']
    });
  };

  return (
    <div className="traffic-light-scene">
      <div className="traffic-light-scene__header">
        <h2 className="traffic-light-scene__title">{t('scenes.trafficLight') || 'Traffic Light Crossroad'}</h2>
      </div>

      <div className="traffic-light-scene__container">
        {/* Control Panel */}
        <div className="traffic-light-scene__controls">
          <div className="traffic-control-group">
            <span className="traffic-control-group__title">Norte-Sul (N-S)</span>
            <button
              className={`traffic-control-button ${state.inputs['I0.0'] ? 'active' : ''}`}
              onClick={toggleNorthSouth}
            >
              <span className="traffic-control-button__label">I0.0</span>
              <span className="traffic-control-button__text">
                {state.inputs['I0.0'] ? t('labels.stop') || 'STOP' : t('labels.start') || 'START'}
              </span>
            </button>
          </div>

          <div className="traffic-control-group">
            <span className="traffic-control-group__title">Leste-Oeste (L-O)</span>
            <button
              className={`traffic-control-button ${state.inputs['I0.1'] ? 'active' : ''}`}
              onClick={toggleEastWest}
            >
              <span className="traffic-control-button__label">I0.1</span>
              <span className="traffic-control-button__text">
                {state.inputs['I0.1'] ? t('labels.stop') || 'STOP' : t('labels.start') || 'START'}
              </span>
            </button>
          </div>
        </div>

        {/* Crossroad Visualization */}
        <svg
          className="traffic-light-scene__crossroad"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect x="0" y="0" width="600" height="600" fill="#2a4a2a" />

          {/* Horizontal Road (East-West) */}
          <rect x="0" y="220" width="600" height="160" fill="#444" />
          <rect x="0" y="225" width="600" height="5" fill="#fff" />
          <rect x="0" y="370" width="600" height="5" fill="#fff" />

          {/* Road center dashed line - horizontal */}
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={`h-dash-${i}`}
              x={i * 50 + 5}
              y="298"
              width="35"
              height="4"
              fill="#ffcc00"
            />
          ))}

          {/* Vertical Road (North-South) */}
          <rect x="220" y="0" width="160" height="600" fill="#444" />
          <rect x="225" y="0" width="5" height="600" fill="#fff" />
          <rect x="370" y="0" width="5" height="600" fill="#fff" />

          {/* Road center dashed line - vertical */}
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={`v-dash-${i}`}
              x="298"
              y={i * 50 + 5}
              width="4"
              height="35"
              fill="#ffcc00"
            />
          ))}

          {/* Intersection center */}
          <rect x="220" y="220" width="160" height="160" fill="#333" />

          {/* Crosswalk markings - North */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={`cross-n-${i}`}
              x={235 + i * 18}
              y="210"
              width="12"
              height="10"
              fill="#fff"
            />
          ))}

          {/* Crosswalk markings - South */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={`cross-s-${i}`}
              x={235 + i * 18}
              y="380"
              width="12"
              height="10"
              fill="#fff"
            />
          ))}

          {/* Crosswalk markings - West */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={`cross-w-${i}`}
              x="210"
              y={235 + i * 18}
              width="10"
              height="12"
              fill="#fff"
            />
          ))}

          {/* Crosswalk markings - East */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={`cross-e-${i}`}
              x="380"
              y={235 + i * 18}
              width="10"
              height="12"
              fill="#fff"
            />
          ))}

          {/* Traffic Light 1 - North Side (for South-bound traffic) */}
          <g className="traffic-light" transform="translate(320, 190)">
            {/* Pole */}
            <rect x="-3" y="0" width="6" height="30" fill="#333" />
            {/* Housing */}
            <rect x="-20" y="-80" width="40" height="90" rx="5" fill="#222" stroke="#000" strokeWidth="2" />
            {/* Red Light */}
            <circle
              cx="0"
              cy="-60"
              r="12"
              fill={light1Red ? '#ff0000' : '#440000'}
              stroke="#000"
              strokeWidth="1"
            />
            {light1Red && <circle cx="0" cy="-60" r="12" fill="url(#redGlow)" opacity="0.8" />}

            {/* Yellow Light */}
            <circle
              cx="0"
              cy="-35"
              r="12"
              fill={light1Yellow ? '#ffff00' : '#444400'}
              stroke="#000"
              strokeWidth="1"
            />
            {light1Yellow && <circle cx="0" cy="-35" r="12" fill="url(#yellowGlow)" opacity="0.8" />}

            {/* Green Light */}
            <circle
              cx="0"
              cy="-10"
              r="12"
              fill={light1Green ? '#00ff00' : '#004400'}
              stroke="#000"
              strokeWidth="1"
            />
            {light1Green && <circle cx="0" cy="-10" r="12" fill="url(#greenGlow)" opacity="0.8" />}
          </g>

          {/* Traffic Light 2 - East Side (for West-bound traffic) */}
          <g className="traffic-light" transform="translate(410, 280)">
            {/* Pole */}
            <rect x="-3" y="0" width="6" height="30" fill="#333" />
            {/* Housing */}
            <rect x="-20" y="-80" width="40" height="90" rx="5" fill="#222" stroke="#000" strokeWidth="2" />
            {/* Red Light */}
            <circle
              cx="0"
              cy="-60"
              r="12"
              fill={light2Red ? '#ff0000' : '#440000'}
              stroke="#000"
              strokeWidth="1"
            />
            {light2Red && <circle cx="0" cy="-60" r="12" fill="url(#redGlow)" opacity="0.8" />}

            {/* Yellow Light */}
            <circle
              cx="0"
              cy="-35"
              r="12"
              fill={light2Yellow ? '#ffff00' : '#444400'}
              stroke="#000"
              strokeWidth="1"
            />
            {light2Yellow && <circle cx="0" cy="-35" r="12" fill="url(#yellowGlow)" opacity="0.8" />}

            {/* Green Light */}
            <circle
              cx="0"
              cy="-10"
              r="12"
              fill={light2Green ? '#00ff00' : '#004400'}
              stroke="#000"
              strokeWidth="1"
            />
            {light2Green && <circle cx="0" cy="-10" r="12" fill="url(#greenGlow)" opacity="0.8" />}
          </g>

          {/* Reserved spaces for future car animations */}
          {/* Car placeholder - coming from North */}
          <rect x="245" y="100" width="45" height="80" fill="transparent" stroke="#555" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />

          {/* Car placeholder - coming from East */}
          <rect x="450" y="265" width="80" height="45" fill="transparent" stroke="#555" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />

          {/* Glow effect definitions */}
          <defs>
            <radialGradient id="redGlow">
              <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="yellowGlow">
              <stop offset="0%" stopColor="#ffff00" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffff00" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="greenGlow">
              <stop offset="0%" stopColor="#00ff00" stopOpacity="1" />
              <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Output Status */}
        <div className="traffic-light-scene__status">
          <div className="status-group">
            <span className="status-group__title">Norte-Sul (N-S)</span>
            <div className="status-items">
              <div className="status-item">
                <span className="status-label">Q0.0 (Red):</span>
                <span className={`status-value status-value--red ${light1Red ? 'active' : ''}`}>
                  {light1Red ? '1' : '0'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Q0.1 (Yellow):</span>
                <span className={`status-value status-value--yellow ${light1Yellow ? 'active' : ''}`}>
                  {light1Yellow ? '1' : '0'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Q0.2 (Green):</span>
                <span className={`status-value status-value--green ${light1Green ? 'active' : ''}`}>
                  {light1Green ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="status-group">
            <span className="status-group__title">Leste-Oeste (L-O)</span>
            <div className="status-items">
              <div className="status-item">
                <span className="status-label">Q1.0 (Red):</span>
                <span className={`status-value status-value--red ${light2Red ? 'active' : ''}`}>
                  {light2Red ? '1' : '0'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Q1.1 (Yellow):</span>
                <span className={`status-value status-value--yellow ${light2Yellow ? 'active' : ''}`}>
                  {light2Yellow ? '1' : '0'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Q1.2 (Green):</span>
                <span className={`status-value status-value--green ${light2Green ? 'active' : ''}`}>
                  {light2Green ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
