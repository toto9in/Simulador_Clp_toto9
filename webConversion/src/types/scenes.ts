/**
 * Scene Type Definitions
 * Corresponds to src/screens/scenes/ Java classes
 */

/**
 * Base scene interface
 * Corresponds to IScenePanel.java
 */
export interface IScene {
  type: 'DEFAULT' | 'BATCH_SIMULATION' | 'COMPRESSOR';
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
  maxFillHeight: number; // Maximum fill height (300 pixels)
  fillRate: number; // Fill rate (pixels per cycle)
  drainRate: number; // Drain rate (pixels per cycle)

  // Sensor thresholds
  sensorLow: number; // Low level sensor (75px)
  sensorMid: number; // Mid level sensor (150px)
  sensorHigh: number; // High level sensor (225px)
  sensorCritical: number; // Critical level sensor (300px)
}

/**
 * Compressor System Scene
 * Dual compressor system with pressure sensors and selector switch
 * Based on LogixPro compressor simulation
 */
export interface CompressorScene extends IScene {
  type: 'COMPRESSOR';
  name: 'Compressor System';
  pressure: number; // Current pressure (0-150 PSI)
  maxPressure: number; // Maximum pressure (150 PSI)
  flowRate: number; // Flow rate adjustment (consumption rate)
  fillRate: number; // Fill rate when motor is on (PSI per cycle)
  drainRate: number; // Drain rate (PSI per cycle, based on flowRate)

  // Pressure switch thresholds
  pe1High: number; // PE1 activation threshold (100 PSI)
  pe1Low: number; // PE1 deactivation threshold (50 PSI)
  pe2High: number; // PE2 activation threshold (100 PSI)
  pe2Low: number; // PE2 deactivation threshold (50 PSI)
}

/**
 * Union type for all scene types
 */
export type Scene = DefaultScene | BatchSimulationScene | CompressorScene;

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
      START_FILL: 'I0.0', // Start filling button
      START_DRAIN: 'I0.1', // Start draining button
      EMERGENCY_STOP: 'I0.2', // Emergency stop button
    },
    outputs: {
      FILL_VALVE: 'Q0.0', // Fill valve (open when true)
      DRAIN_VALVE: 'Q0.1', // Drain valve (open when true)
      ALARM: 'Q0.2', // Critical level alarm
    },
    sensors: {
      LOW: 'I1.0', // Low level sensor (virtual input)
      MID: 'I1.1', // Mid level sensor (virtual input)
      HIGH: 'I1.2', // High level sensor (virtual input)
      CRITICAL: 'I1.3', // Critical level sensor (virtual input)
    },
    thresholds: {
      LOW: 75, // 75px
      MID: 150, // 150px
      HIGH: 225, // 225px
      CRITICAL: 300, // 300px (overflow)
    },
    rates: {
      FILL: 2, // 2 pixels per 100ms cycle
      DRAIN: 1, // 1 pixel per 100ms cycle
    },
  },
  COMPRESSOR: {
    // Compressor system I/O mappings
    inputs: {
      START: 'I1.0', // START button (NA)
      STOP: 'I1.1', // STOP button (NF)
      PE1: 'I1.2', // Pressure switch PE1 (Motor 1)
      PE2: 'I1.3', // Pressure switch PE2 (Motor 2)
      SELECTOR_A: 'I1.4', // Selector switch position A
      SELECTOR_B: 'I1.5', // Selector switch position B
      SELECTOR_C: 'I1.6', // Selector switch position C
    },
    outputs: {
      MOTOR_1: 'Q0.0', // Motor 1 (MOTOR)
      MOTOR_2: 'Q0.1', // Motor 2 (MOTOR #2)
      RUN_LAMP: 'Q0.2', // RUN indicator lamp
      C1_LAMP: 'Q0.3', // C1 indicator lamp (Motor 1)
      C2_LAMP: 'Q0.4', // C2 indicator lamp (Motor 2)
    },
    pressure: {
      MAX: 150, // Maximum pressure (PSI)
      PE1_HIGH: 100, // PE1 activation threshold
      PE1_LOW: 50, // PE1 deactivation threshold (hysteresis)
      PE2_HIGH: 100, // PE2 activation threshold
      PE2_LOW: 50, // PE2 deactivation threshold (hysteresis)
      FILL_RATE: 2, // Fill rate when motor is on (PSI per 100ms)
      DRAIN_BASE: 0.5, // Base drain rate (PSI per 100ms)
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

/**
 * Create initial compressor scene
 */
export function createCompressorScene(): CompressorScene {
  return {
    type: 'COMPRESSOR',
    name: 'Compressor System',
    pressure: 0,
    maxPressure: SceneConfig.COMPRESSOR.pressure.MAX,
    flowRate: 1, // Default flow rate multiplier
    fillRate: SceneConfig.COMPRESSOR.pressure.FILL_RATE,
    drainRate: SceneConfig.COMPRESSOR.pressure.DRAIN_BASE,
    pe1High: SceneConfig.COMPRESSOR.pressure.PE1_HIGH,
    pe1Low: SceneConfig.COMPRESSOR.pressure.PE1_LOW,
    pe2High: SceneConfig.COMPRESSOR.pressure.PE2_HIGH,
    pe2Low: SceneConfig.COMPRESSOR.pressure.PE2_LOW,
  };
}
