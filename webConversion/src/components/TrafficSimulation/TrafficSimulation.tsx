/**
 * Traffic Simulation Component
 * Simulates cars moving through a crossroad controlled by traffic lights
 * Single car per direction with looping behavior
 */

import { useEffect, useState, useRef } from 'react';
import { usePLCState } from '../../context/PLCStateContext';
import './TrafficSimulation.css';

interface TrafficSimulationProps {
  onCollision?: () => void;
}

export function TrafficSimulation({ onCollision }: TrafficSimulationProps) {
  const { state } = usePLCState();

  // Single car per direction - position state
  const [nsCarPosition, setNsCarPosition] = useState(0);
  const [ewCarPosition, setEwCarPosition] = useState(0);

  // Traffic control - simple boolean states
  const [nsTrafficEnabled, setNsTrafficEnabled] = useState(true);
  const [ewTrafficEnabled, setEwTrafficEnabled] = useState(true);

  // Collision warning state
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const collisionTimeoutRef = useRef<NodeJS.Timeout>();

  // Refs to track latest state values without causing re-renders
  const nsTrafficRef = useRef(nsTrafficEnabled);
  const ewTrafficRef = useRef(ewTrafficEnabled);

  // Update refs when state changes
  useEffect(() => {
    nsTrafficRef.current = nsTrafficEnabled;
  }, [nsTrafficEnabled]);

  useEffect(() => {
    ewTrafficRef.current = ewTrafficEnabled;
  }, [ewTrafficEnabled]);

  // Get traffic light states from PLC outputs
  const nsRed = state.outputs['Q0.0'] || false;
  const nsYellow = state.outputs['Q0.1'] || false;
  const nsGreen = state.outputs['Q0.2'] || false;
  const ewRed = state.outputs['Q1.0'] || false;
  const ewYellow = state.outputs['Q1.1'] || false;
  const ewGreen = state.outputs['Q1.2'] || false;

  // Car speed (percentage per frame)
  const CAR_SPEED = 0.5;

  // Animation loop - runs once and uses refs to avoid re-creation
  useEffect(() => {
    let nsPos = 0;
    let ewPos = 0;
    let animationFrameId: number;

    const animate = () => {
      // Update NS car position
      if (nsTrafficRef.current) {
        const isAtIntersection = nsPos >= 40 && nsPos <= 60;
        const shouldStop = isAtIntersection && (nsRed || (!nsGreen && !nsYellow));

        if (!shouldStop) {
          nsPos += CAR_SPEED;
          if (nsPos >= 100) {
            nsPos = 0;
          }
        }
        setNsCarPosition(nsPos);
      }

      // Update EW car position
      if (ewTrafficRef.current) {
        const isAtIntersection = ewPos >= 40 && ewPos <= 60;
        const shouldStop = isAtIntersection && (ewRed || (!ewGreen && !ewYellow));

        if (!shouldStop) {
          ewPos += CAR_SPEED;
          if (ewPos >= 100) {
            ewPos = 0;
          }
        }
        setEwCarPosition(ewPos);
      }

      // Check for collision
      const nsAtIntersection = nsPos >= 45 && nsPos <= 55;
      const ewAtIntersection = ewPos >= 45 && ewPos <= 55;
      const nsCanGo = nsGreen || nsYellow;
      const ewCanGo = ewGreen || ewYellow;

      if (nsAtIntersection && ewAtIntersection && nsCanGo && ewCanGo &&
          nsTrafficRef.current && ewTrafficRef.current) {
        setShowCollisionWarning(true);
        onCollision?.();

        if (collisionTimeoutRef.current) {
          clearTimeout(collisionTimeoutRef.current);
        }

        collisionTimeoutRef.current = setTimeout(() => {
          setShowCollisionWarning(false);
        }, 3000);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (collisionTimeoutRef.current) {
        clearTimeout(collisionTimeoutRef.current);
      }
    };
  }, [nsRed, nsGreen, nsYellow, ewRed, ewGreen, ewYellow, onCollision]);

  return (
    <div className="traffic-simulation">
      {/* Collision Warning */}
      {showCollisionWarning && (
        <div className="collision-warning">
          ⚠️ COLLISION DETECTED! Both lights are allowing traffic at the same time!
        </div>
      )}

      {/* Traffic Control Buttons */}
      <div className="traffic-controls">
        <button
          className={`traffic-toggle ${nsTrafficEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => {
            console.log('NS Toggle clicked, current:', nsTrafficEnabled);
            setNsTrafficEnabled(prev => !prev);
          }}
          type="button"
        >
          {nsTrafficEnabled ? '🚗 Enabled' : '🚫 Disabled'} North-South Traffic
        </button>
        <button
          className={`traffic-toggle ${ewTrafficEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => {
            console.log('EW Toggle clicked, current:', ewTrafficEnabled);
            setEwTrafficEnabled(prev => !prev);
          }}
          type="button"
        >
          {ewTrafficEnabled ? '🚗 Enabled' : '🚫 Disabled'} East-West Traffic
        </button>
      </div>

      {/* Crossroad Visualization */}
      <div className="crossroad">
        {/* Roads */}
        <div className="road road-vertical" />
        <div className="road road-horizontal" />

        {/* Intersection */}
        <div className="intersection" />

        {/* Traffic Lights */}
        <div className="traffic-light traffic-light-ns">
          <div className={`light light-red ${nsRed ? 'active' : ''}`} />
          <div className={`light light-yellow ${nsYellow ? 'active' : ''}`} />
          <div className={`light light-green ${nsGreen ? 'active' : ''}`} />
          <span className="light-label">NS</span>
        </div>

        <div className="traffic-light traffic-light-ew">
          <div className={`light light-red ${ewRed ? 'active' : ''}`} />
          <div className={`light light-yellow ${ewYellow ? 'active' : ''}`} />
          <div className={`light light-green ${ewGreen ? 'active' : ''}`} />
          <span className="light-label">EW</span>
        </div>

        {/* Cars - only show if traffic is enabled */}
        {nsTrafficEnabled && (
          <div
            className="car car-ns"
            style={{
              top: `${nsCarPosition}%`
            }}
          >
            🚗
          </div>
        )}

        {ewTrafficEnabled && (
          <div
            className="car car-ew"
            style={{
              left: `${ewCarPosition}%`
            }}
          >
            🚕
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="traffic-status">
        <div className="status-item">
          <strong>NS Traffic:</strong>
          {nsTrafficEnabled ? ' 🚗 Enabled' : ' 🚫 Disabled'}
        </div>
        <div className="status-item">
          <strong>EW Traffic:</strong>
          {ewTrafficEnabled ? ' 🚗 Enabled' : ' 🚫 Disabled'}
        </div>
        <div className="status-item">
          <strong>NS Light:</strong>
          {nsRed && ' 🔴 Red'}
          {nsYellow && ' 🟡 Yellow'}
          {nsGreen && ' 🟢 Green'}
          {!nsRed && !nsYellow && !nsGreen && ' ⚫ Off'}
        </div>
        <div className="status-item">
          <strong>EW Light:</strong>
          {ewRed && ' 🔴 Red'}
          {ewYellow && ' 🟡 Yellow'}
          {ewGreen && ' 🟢 Green'}
          {!ewRed && !ewYellow && !ewGreen && ' ⚫ Off'}
        </div>
      </div>
    </div>
  );
}
