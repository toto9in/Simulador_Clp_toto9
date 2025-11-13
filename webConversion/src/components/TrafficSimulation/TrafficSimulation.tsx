/**
 * Traffic Simulation Component
 * Simulates cars moving through a crossroad controlled by traffic lights
 * Single car per direction with looping behavior
 */

import { useEffect, useState, useRef } from 'react';
import { usePLCState } from '../../context/PLCStateContext';
import { ExecutionMode } from '../../types/plc';
import './TrafficSimulation.css';

interface TrafficSimulationProps {
  onCollision?: () => void;
}

export function TrafficSimulation({ onCollision }: TrafficSimulationProps) {
  const { state } = usePLCState();

  // Debug mode toggle
  const [debugMode, setDebugMode] = useState(false);

  // Single car per direction - position state
  const [nsCarPosition, setNsCarPosition] = useState(0);
  const [ewCarPosition, setEwCarPosition] = useState(0);

  // Traffic control - simple boolean states
  const [nsTrafficEnabled, setNsTrafficEnabled] = useState(true);
  const [ewTrafficEnabled, setEwTrafficEnabled] = useState(true);

  // Collision state
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const [collisionOccurred, setCollisionOccurred] = useState(false);
  const collisionTimeoutRef = useRef<number>();

  // Refs to track latest state values without causing re-renders
  const nsTrafficRef = useRef(nsTrafficEnabled);
  const ewTrafficRef = useRef(ewTrafficEnabled);

  // Refs for traffic light states to avoid useEffect recreation
  const stateRef = useRef(state);

  // Update refs when state changes
  useEffect(() => {
    nsTrafficRef.current = nsTrafficEnabled;
  }, [nsTrafficEnabled]);

  useEffect(() => {
    ewTrafficRef.current = ewTrafficEnabled;
  }, [ewTrafficEnabled]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Get traffic light states from PLC outputs (for rendering only)
  const nsRed = state.outputs['Q0.0'] || false;
  const nsYellow = state.outputs['Q0.1'] || false;
  const nsGreen = state.outputs['Q0.2'] || false;
  const ewRed = state.outputs['Q1.0'] || false;
  const ewYellow = state.outputs['Q1.1'] || false;
  const ewGreen = state.outputs['Q1.2'] || false;

  // Car speed (percentage per frame)
  const CAR_SPEED = 0.5;

  // Critical positions
  const SPAWN_POINT = 0;
  const STOP_POINT_BEFORE_INTERSECTION = 30; // Stop before intersection (intersection starts at 32.5%)
  const INTERSECTION_START = 32.5;
  const INTERSECTION_END = 67.5;
  const DESPAWN_POINT = 100;

  // Reset function to restart simulation after collision
  const resetSimulation = () => {
    setCollisionOccurred(false);
    setShowCollisionWarning(false);
    setNsCarPosition(0);
    setEwCarPosition(0);
  };

  // Animation loop - runs once and uses refs to avoid re-creation
  useEffect(() => {
    let nsPos = 0;
    let ewPos = 0;
    let animationFrameId: number;
    let hasCollision = false;

    const animate = () => {
      // Only animate if PLC is running and no collision occurred
      const isRunning = stateRef.current.mode === ExecutionMode.RUNNING;

      if (!isRunning || hasCollision) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Get current traffic light states from ref
      const currentNsRed = stateRef.current.outputs['Q0.0'] || false;
      const currentNsYellow = stateRef.current.outputs['Q0.1'] || false;
      const currentNsGreen = stateRef.current.outputs['Q0.2'] || false;
      const currentEwRed = stateRef.current.outputs['Q1.0'] || false;
      const currentEwYellow = stateRef.current.outputs['Q1.1'] || false;
      const currentEwGreen = stateRef.current.outputs['Q1.2'] || false;

      // Update NS car position
      if (nsTrafficRef.current) {
        // Check if should stop BEFORE intersection (not inside)
        const approachingIntersection = nsPos >= STOP_POINT_BEFORE_INTERSECTION && nsPos < INTERSECTION_START;

        // Stop if red light OR if lights are all off (invalid state)
        const shouldStop = approachingIntersection && (currentNsRed || (!currentNsGreen && !currentNsYellow && !currentNsRed));

        if (!shouldStop) {
          nsPos += CAR_SPEED;
          // Loop back to spawn when reaching despawn point
          if (nsPos >= DESPAWN_POINT) {
            nsPos = SPAWN_POINT;
          }
        }
        // If shouldStop is true, car stays at current position (doesn't reset)

        setNsCarPosition(nsPos);
      }

      // Update EW car position
      if (ewTrafficRef.current) {
        // Check if should stop BEFORE intersection (not inside)
        const approachingIntersection = ewPos >= STOP_POINT_BEFORE_INTERSECTION && ewPos < INTERSECTION_START;

        // Stop if red light OR if lights are all off (invalid state)
        const shouldStop = approachingIntersection && (currentEwRed || (!currentEwGreen && !currentEwYellow && !currentEwRed));

        if (!shouldStop) {
          ewPos += CAR_SPEED;
          // Loop back to spawn when reaching despawn point
          if (ewPos >= DESPAWN_POINT) {
            ewPos = SPAWN_POINT;
          }
        }
        // If shouldStop is true, car stays at current position (doesn't reset)

        setEwCarPosition(ewPos);
      }

      // Check for collision (both cars inside intersection at same time)
      const nsInIntersection = nsPos >= INTERSECTION_START && nsPos <= INTERSECTION_END;
      const ewInIntersection = ewPos >= INTERSECTION_START && ewPos <= INTERSECTION_END;
      const nsCanGo = currentNsGreen || currentNsYellow;
      const ewCanGo = currentEwGreen || currentEwYellow;

      if (nsInIntersection && ewInIntersection && nsCanGo && ewCanGo &&
          nsTrafficRef.current && ewTrafficRef.current) {
        // COLLISION DETECTED! Stop everything
        hasCollision = true;
        setCollisionOccurred(true);
        setShowCollisionWarning(true);
        onCollision?.();
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
    // Empty dependency array - effect runs once and uses refs for all state
  }, []);

  return (
    <div className="traffic-simulation">
      {/* Collision Warning */}
      {showCollisionWarning && (
        <div className="collision-warning">
          💥 COLISÃO DETECTADA! Ambos os semáforos estavam permitindo tráfego ao mesmo tempo!
          <button
            className="collision-reset-button"
            onClick={resetSimulation}
            type="button"
          >
            🔄 Resetar Simulação
          </button>
        </div>
      )}

      {/* PLC Status Indicator */}
      {state.mode !== ExecutionMode.RUNNING && !collisionOccurred && (
        <div className="plc-status-warning">
          ⏸️ Simulação pausada - Clique em Play no código para iniciar os carros
        </div>
      )}

      {/* Traffic Control Buttons */}
      <div className="traffic-controls">
        <button
          className={`traffic-toggle ${nsTrafficEnabled ? 'traffic-enabled' : 'traffic-disabled'}`}
          onClick={() => {
            console.log('NS Toggle clicked, current:', nsTrafficEnabled);
            setNsTrafficEnabled(prev => !prev);
          }}
          type="button"
        >
          {nsTrafficEnabled ? '🚗 Enabled' : '🚫 Disabled'} North-South Traffic
        </button>
        <button
          className={`traffic-toggle ${ewTrafficEnabled ? 'traffic-enabled' : 'traffic-disabled'}`}
          onClick={() => {
            console.log('EW Toggle clicked, current:', ewTrafficEnabled);
            setEwTrafficEnabled(prev => !prev);
          }}
          type="button"
        >
          {ewTrafficEnabled ? '🚗 Enabled' : '🚫 Disabled'} East-West Traffic
        </button>
        <button
          className={`traffic-toggle ${debugMode ? 'traffic-enabled' : 'traffic-disabled'}`}
          onClick={() => setDebugMode(prev => !prev)}
          type="button"
        >
          {debugMode ? '🔍 Debug ON' : '🔍 Debug OFF'}
        </button>
      </div>

      {/* Crossroad Visualization */}
      <div className="crossroad">
        {/* Debug Markers */}
        {debugMode && (
          <>
            {/* NS Spawn Point */}
            <div className="debug-marker debug-spawn" style={{ top: '0%', left: '45%', width: '10%', height: '2px' }}>
              <span className="debug-label">SPAWN (0%)</span>
            </div>

            {/* NS Stop Point */}
            <div className="debug-marker debug-stop" style={{ top: `${STOP_POINT_BEFORE_INTERSECTION}%`, left: '45%', width: '10%', height: '3px' }}>
              <span className="debug-label">STOP ({STOP_POINT_BEFORE_INTERSECTION}%)</span>
            </div>

            {/* NS Despawn Point */}
            <div className="debug-marker debug-despawn" style={{ top: '98%', left: '45%', width: '10%', height: '2px' }}>
              <span className="debug-label">DESPAWN (100%)</span>
            </div>

            {/* EW Spawn Point */}
            <div className="debug-marker debug-spawn" style={{ left: '0%', top: '45%', width: '2px', height: '10%' }}>
              <span className="debug-label" style={{ left: '5px' }}>SPAWN (0%)</span>
            </div>

            {/* EW Stop Point */}
            <div className="debug-marker debug-stop" style={{ left: `${STOP_POINT_BEFORE_INTERSECTION}%`, top: '45%', width: '3px', height: '10%' }}>
              <span className="debug-label" style={{ left: '5px' }}>STOP ({STOP_POINT_BEFORE_INTERSECTION}%)</span>
            </div>

            {/* EW Despawn Point */}
            <div className="debug-marker debug-despawn" style={{ left: '98%', top: '45%', width: '2px', height: '10%' }}>
              <span className="debug-label" style={{ left: '5px' }}>DESPAWN (100%)</span>
            </div>

            {/* Intersection boundaries */}
            <div className="debug-intersection-marker" style={{ top: `${INTERSECTION_START}%`, left: '32.5%', width: '35%', height: '35%' }}>
              <span className="debug-label">INTERSECTION ZONE</span>
            </div>
          </>
        )}

        {/* Roads */}
        <div className="road road-vertical" />
        <div className="road road-horizontal" />

        {/* Intersection */}
        <div className="intersection">
          {/* Collision Marker in the center of intersection */}
          {collisionOccurred && (
            <div className="collision-marker">
              💥
            </div>
          )}
        </div>

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
            className={`car car-ns ${debugMode ? 'debug-active' : ''}`}
            style={{
              top: `${nsCarPosition}%`
            }}
          >
            🚗
            {debugMode && <span className="car-position">{nsCarPosition.toFixed(1)}%</span>}
          </div>
        )}

        {ewTrafficEnabled && (
          <div
            className={`car car-ew ${debugMode ? 'debug-active' : ''}`}
            style={{
              left: `${ewCarPosition}%`
            }}
          >
            🚕
            {debugMode && <span className="car-position">{ewCarPosition.toFixed(1)}%</span>}
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
        {debugMode && (
          <>
            <div className="status-item">
              <strong>NS Car Position:</strong> {nsCarPosition.toFixed(1)}%
            </div>
            <div className="status-item">
              <strong>EW Car Position:</strong> {ewCarPosition.toFixed(1)}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}
