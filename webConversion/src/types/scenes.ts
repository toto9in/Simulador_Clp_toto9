/**
 * Scene Type Definitions
 * Corresponds to src/screens/scenes/ Java classes
 */

/**
 * Base scene interface
 * Corresponds to IScenePanel.java
 */
export interface IScene {
  type: 'DEFAULT' | 'BATCH_SIMULATION';
  name: string;
}

/**
 * Default I/O Scene
 * 8 inputs (I0.0-I0.7) + 8 outputs (Q0.0-Q0.7)
 * Corresponds to DefaultScenePanel.java
 */
export interface DefaultScene extends IScene {
  type: 'DEFAULT';
  name: 'Default I/O';
}

/**
 * Batch Simulation Scene
 * Tank filling/draining simulation with sensors
 * Corresponds to BatchSimulationScenePanel.java
 */
export interface BatchSimulationScene extends IScene {
  type: 'BATCH_SIMULATION';
  name: 'Batch Simulation';
  tankFillHeight: number; // Current fill height (0-300 pixels)
  maxFillHeight: number;  // Maximum fill height (300 pixels)
  fillRate: number;       // Fill rate (pixels per cycle)
  drainRate: number;      // Drain rate (pixels per cycle)

  // Sensor thresholds
  sensorLow: number;      // Low level sensor (75px)
  sensorMid: number;      // Mid level sensor (150px)
  sensorHigh: number;     // High level sensor (225px)
  sensorCritical: number; // Critical level sensor (300px)
}

/**
 * Union type for all scene types
 */
export type Scene = DefaultScene | BatchSimulationScene;

/**
 * Scene configuration
 */
export const SceneConfig = {
  DEFAULT: {
    inputs: ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'I0.4', 'I0.5', 'I0.6', 'I0.7'],
    outputs: ['Q0.0', 'Q0.1', 'Q0.2', 'Q0.3', 'Q0.4', 'Q0.5', 'Q0.6', 'Q0.7'],
  },
  BATCH_SIMULATION: {
    // Batch simulation uses specific I/O mappings
    inputs: {
      START_FILL: 'I0.0',      // Start filling button
      START_DRAIN: 'I0.1',     // Start draining button
      EMERGENCY_STOP: 'I0.2',  // Emergency stop button
    },
    outputs: {
      FILL_VALVE: 'Q0.0',      // Fill valve (open when true)
      DRAIN_VALVE: 'Q0.1',     // Drain valve (open when true)
      ALARM: 'Q0.2',           // Critical level alarm
    },
    sensors: {
      LOW: 'I1.0',      // Low level sensor (virtual input)
      MID: 'I1.1',      // Mid level sensor (virtual input)
      HIGH: 'I1.2',     // High level sensor (virtual input)
      CRITICAL: 'I1.3', // Critical level sensor (virtual input)
    },
    thresholds: {
      LOW: 75,      // 75px
      MID: 150,     // 150px
      HIGH: 225,    // 225px
      CRITICAL: 300, // 300px (overflow)
    },
    rates: {
      FILL: 2,   // 2 pixels per 100ms cycle
      DRAIN: 1,  // 1 pixel per 100ms cycle
    },
  },
} as const;

/**
 * Create initial default scene
 */
export function createDefaultScene(): DefaultScene {
  return {
    type: 'DEFAULT',
    name: 'Default I/O',
  };
}

/**
 * Create initial batch simulation scene
 */
export function createBatchSimulationScene(): BatchSimulationScene {
  return {
    type: 'BATCH_SIMULATION',
    name: 'Batch Simulation',
    tankFillHeight: 0,
    maxFillHeight: SceneConfig.BATCH_SIMULATION.thresholds.CRITICAL,
    fillRate: SceneConfig.BATCH_SIMULATION.rates.FILL,
    drainRate: SceneConfig.BATCH_SIMULATION.rates.DRAIN,
    sensorLow: SceneConfig.BATCH_SIMULATION.thresholds.LOW,
    sensorMid: SceneConfig.BATCH_SIMULATION.thresholds.MID,
    sensorHigh: SceneConfig.BATCH_SIMULATION.thresholds.HIGH,
    sensorCritical: SceneConfig.BATCH_SIMULATION.thresholds.CRITICAL,
  };
}
