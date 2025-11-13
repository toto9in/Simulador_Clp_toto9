/**
 * Traffic Simulation Component
 * Simulates cars moving through a crossroad controlled by traffic lights
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePLCState } from '../../context/PLCStateContext';
import './TrafficSimulation.css';

interface Car {
  id: number;
  direction: 'ns' | 'ew'; // North-South or East-West
  position: number; // 0-100 (percentage along the road)
  speed: number;
}

interface TrafficSimulationProps {
  onCollision?: () => void;
}

export function TrafficSimulation({ onCollision }: TrafficSimulationProps) {
  const { state } = usePLCState();
  const [cars, setCars] = useState<Car[]>([]);
  const [nsTrafficEnabled, setNsTrafficEnabled] = useState(true);
  const [ewTrafficEnabled, setEwTrafficEnabled] = useState(true);
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const nextCarIdRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Get traffic light states from PLC outputs
  const nsRed = state.outputs.Q0?.[0] || false;
  const nsYellow = state.outputs.Q0?.[1] || false;
  const nsGreen = state.outputs.Q0?.[2] || false;
  const ewRed = state.outputs.Q1?.[0] || false;
  const ewYellow = state.outputs.Q1?.[1] || false;
  const ewGreen = state.outputs.Q1?.[2] || false;

  // Check for collision conditions
  const checkCollisionCondition = useCallback(() => {
    // Collision if both directions have green or yellow
    const nsCanGo = nsGreen || nsYellow;
    const ewCanGo = ewGreen || ewYellow;

    // Also check if both lights are off (bad configuration)
    const nsAllOff = !nsRed && !nsYellow && !nsGreen;
    const ewAllOff = !ewRed && !ewYellow && !ewGreen;

    return (nsCanGo && ewCanGo) || (nsAllOff && ewAllOff);
  }, [nsRed, nsYellow, nsGreen, ewRed, ewYellow, ewGreen]);

  // Spawn new cars periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setCars(prev => {
        const newCars = [...prev];

        // Spawn NS car if traffic is enabled
        if (nsTrafficEnabled && Math.random() > 0.5) {
          newCars.push({
            id: nextCarIdRef.current++,
            direction: 'ns',
            position: 0,
            speed: 1.5 + Math.random() * 0.5
          });
        }

        // Spawn EW car if traffic is enabled
        if (ewTrafficEnabled && Math.random() > 0.5) {
          newCars.push({
            id: nextCarIdRef.current++,
            direction: 'ew',
            position: 0,
            speed: 1.5 + Math.random() * 0.5
          });
        }

        return newCars;
      });
    }, 2000); // Spawn every 2 seconds

    return () => clearInterval(spawnInterval);
  }, [nsTrafficEnabled, ewTrafficEnabled]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setCars(prev => {
        const updated = prev.map(car => {
          let newPosition = car.position;
          let shouldStop = false;

          // Check if car should stop at intersection (position 40-60)
          const isAtIntersection = car.position >= 40 && car.position <= 60;

          if (isAtIntersection) {
            if (car.direction === 'ns') {
              shouldStop = nsRed || (!nsGreen && !nsYellow);
            } else {
              shouldStop = ewRed || (!ewGreen && !ewYellow);
            }
          }

          // Move car if not stopped
          if (!shouldStop) {
            newPosition = car.position + car.speed;
          }

          return { ...car, position: newPosition };
        });

        // Remove cars that passed through
        return updated.filter(car => car.position < 100);
      });

      // Check for collisions
      const hasCollision = checkCollisionCondition();
      if (hasCollision) {
        const nsCarsAtIntersection = cars.some(c => c.direction === 'ns' && c.position >= 45 && c.position <= 55);
        const ewCarsAtIntersection = cars.some(c => c.direction === 'ew' && c.position >= 45 && c.position <= 55);

        if (nsCarsAtIntersection && ewCarsAtIntersection) {
          setCollisionDetected(true);
          setShowCollisionWarning(true);
          onCollision?.();

          // Hide warning after 3 seconds
          setTimeout(() => setShowCollisionWarning(false), 3000);
        }
      } else {
        setCollisionDetected(false);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cars, nsRed, nsGreen, nsYellow, ewRed, ewGreen, ewYellow, checkCollisionCondition, onCollision]);

  return (
    <div className="traffic-simulation">
      {/* Collision Warning */}
      {showCollisionWarning && (
        <div className="collision-warning">
          ⚠️ Collision Detected! Check your traffic light logic.
        </div>
      )}

      {/* Traffic Control Buttons */}
      <div className="traffic-controls">
        <button
          className={`traffic-toggle ${nsTrafficEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => setNsTrafficEnabled(!nsTrafficEnabled)}
        >
          {nsTrafficEnabled ? '🚗' : '🚫'} North-South Traffic
        </button>
        <button
          className={`traffic-toggle ${ewTrafficEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => setEwTrafficEnabled(!ewTrafficEnabled)}
        >
          {ewTrafficEnabled ? '🚗' : '🚫'} East-West Traffic
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

        {/* Cars */}
        {cars.map(car => (
          <div
            key={car.id}
            className={`car car-${car.direction} ${collisionDetected ? 'collision' : ''}`}
            style={{
              [car.direction === 'ns' ? 'top' : 'left']: `${car.position}%`
            }}
          >
            {car.direction === 'ns' ? '🚗' : '🚕'}
          </div>
        ))}
      </div>

      {/* Status Info */}
      <div className="traffic-status">
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
        <div className="status-item">
          <strong>Cars:</strong> {cars.length} active
        </div>
      </div>
    </div>
  );
}
