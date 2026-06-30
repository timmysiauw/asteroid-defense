import { CONFIG } from '../game/config';
import { hsvToCss } from '../utils/color';
import {
  getAsteroidRadius,
  randomAsteroidSides,
  randomAsteroidValue,
  randomFloat,
  randomRotationDeg
} from '../utils/asteroid';

export type CannonState = {
  x: number;
  y: number;
  angleDeg: number;
  laserCooldownMsRemaining: number;
};

export type LaserState = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  visibleFramesRemaining: number;
};

export type AsteroidState = {
  id: number;
  x: number;
  y: number;
  value: number;
  radius: number;
  sides: number;
  rotationDeg: number;
  velocityX: number;
  velocityY: number;
};

export type AsteroidSpawnState = {
  cooldownMsRemaining: number;
  nextAsteroidId: number;
};

export type BuildingState = {
  id: number;
  x: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
};

export type GameState = {
  status: 'ready' | 'playing' | 'gameOver';
  score: number;
  nukeCount: number;
  audioEnabled: boolean;
  cannon: CannonState;
  laser: LaserState | null;
  asteroids: AsteroidState[];
  asteroidSpawn: AsteroidSpawnState;
  buildings: BuildingState[];
};

export function createInitialGameState(
  status: GameState['status'] = 'ready',
  audioEnabled = true
): GameState {
  return {
    status,
    score: 0,
    nukeCount: CONFIG.startingNukes,
    audioEnabled,
    cannon: {
      x: CONFIG.cannonX,
      y: CONFIG.groundY,
      angleDeg: CONFIG.cannonInitialAngleDeg,
      laserCooldownMsRemaining: 0
    },
    laser: null,
    asteroids: [
      {
        id: 1,
        x: CONFIG.asteroidStartX,
        y: CONFIG.asteroidStartY,
        value: 4,
        radius: getAsteroidRadius(4),
        sides: randomAsteroidSides(),
        rotationDeg: randomRotationDeg(),
        velocityX: 24,
        velocityY: 46
      }
    ],
    asteroidSpawn: {
      cooldownMsRemaining: CONFIG.asteroidSpawnIntervalMs,
      nextAsteroidId: 2
    },
    buildings: createInitialBuildings()
  };
}

function createInitialBuildings(): BuildingState[] {
  const buildings: BuildingState[] = [];
  let nextBuildingId = 1;
  const leftMinX = CONFIG.buildingSidePadding;
  const leftMaxX = CONFIG.cannonX - CONFIG.cannonClearHalfWidth - CONFIG.buildingMinWidth;
  const rightMinX = CONFIG.cannonX + CONFIG.cannonClearHalfWidth;
  const rightMaxX = CONFIG.width - CONFIG.buildingSidePadding - CONFIG.buildingMinWidth;

  for (let index = 0; index < CONFIG.buildingCountPerSide; index += 1) {
    buildings.push({
      id: nextBuildingId,
      ...createBuilding(randomFloat(leftMinX, leftMaxX), index)
    });
    nextBuildingId += 1;
  }

  for (let index = 0; index < CONFIG.buildingCountPerSide; index += 1) {
    buildings.push({
      id: nextBuildingId,
      ...createBuilding(randomFloat(rightMinX, rightMaxX), index + CONFIG.buildingCountPerSide)
    });
    nextBuildingId += 1;
  }

  return buildings;
}

function createBuilding(xSeed: number, index: number): Omit<BuildingState, 'id'> {
  const width = Math.round(randomFloat(CONFIG.buildingMinWidth, CONFIG.buildingMaxWidth));
  const maxX = index < CONFIG.buildingCountPerSide
    ? CONFIG.cannonX - CONFIG.cannonClearHalfWidth - width
    : CONFIG.width - CONFIG.buildingSidePadding - width;
  const x = Math.min(xSeed, maxX);
  const height = Math.round(randomFloat(CONFIG.buildingMinHeight, CONFIG.buildingMaxHeight));
  const hue = randomFloat(200, 280);
  const saturation = randomFloat(0.14, 0.32);
  const value = randomFloat(0.34, 0.58);

  return {
    x,
    width,
    height,
    fillColor: hsvToCss(hue, saturation, value),
    strokeColor: hsvToCss(hue, saturation * 0.7, Math.min(0.78, value + 0.16))
  };
}
