export const CONFIG = {
  width: 1000,
  height: 600,
  groundY: 500,

  cannonX: 500,
  cannonBaseRadius: 44,
  cannonBarrelLength: 88,
  cannonBarrelThickness: 16,
  cannonTurnSpeedDegPerSecond: 140,
  cannonMinAngleDeg: 10,
  cannonMaxAngleDeg: 170,
  cannonInitialAngleDeg: 90,

  fixedDeltaTimeMs: 1000 / 60
} as const;

