const FIXED_DELTA_TIME_MS = 1000 / 60;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export const CONFIG = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  groundY: CANVAS_HEIGHT,

  cannonX: 400,
  cannonBaseRadius: 44,
  cannonBarrelLength: 88,
  cannonBarrelThickness: 16,
  cannonFootprintHalfWidth: 44,
  cannonTurnSpeedDegPerSecond: 140,
  cannonMinAngleDeg: 10,
  cannonMaxAngleDeg: 170,
  cannonInitialAngleDeg: 90,
  startingNukes: 3,
  laserCooldownMs: FIXED_DELTA_TIME_MS,
  laserVisibleFrames: 1,
  laserStrokeWidth: 4,
  asteroidSpawnIntervalMs: 1800,
  asteroidMinValue: 1,
  asteroidMaxValue: 4,
  asteroidRadiusBase: 10,
  asteroidRadiusScale: 8,
  asteroidVelocityXMin: -28,
  asteroidVelocityXMax: 28,
  asteroidVelocityYMin: 39,
  asteroidVelocityYMax: 56,
  asteroidSplitSpeedMultiplier: 1.08,
  asteroidSplitAngleJitterDeg: 28,
  asteroidStartX: 420,
  asteroidStartY: -110,
  asteroidSpawnMinX: 120,
  asteroidSpawnMaxX: 880,
  buildingCountPerSide: 8,
  buildingMinWidth: 42,
  buildingMaxWidth: 96,
  buildingMinHeight: 44,
  buildingMaxHeight: 180,
  buildingSidePadding: 54,
  cannonClearHalfWidth: 86,

  fixedDeltaTimeMs: FIXED_DELTA_TIME_MS
} as const;
