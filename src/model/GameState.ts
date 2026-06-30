import { CONFIG } from '../game/config';

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
};

export type GameState = {
  status: 'ready' | 'playing' | 'gameOver';
  score: number;
  nukeCount: number;
  cannon: CannonState;
  laser: LaserState | null;
  asteroids: AsteroidState[];
  asteroidSpawn: AsteroidSpawnState;
  buildings: BuildingState[];
};

export function createInitialGameState(status: GameState['status'] = 'ready'): GameState {
  return {
    status,
    score: 0,
    nukeCount: CONFIG.startingNukes,
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
        radius: CONFIG.asteroidRadiusBase + CONFIG.asteroidRadiusScale * Math.sqrt(4),
        velocityX: 35,
        velocityY: 65
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
  const leftStartX = CONFIG.buildingSidePadding;
  const rightStartX = CONFIG.cannonX + CONFIG.cannonClearHalfWidth + CONFIG.buildingGap;
  const step = CONFIG.buildingWidth + CONFIG.buildingGap;

  for (let index = 0; index < CONFIG.buildingCountPerSide; index += 1) {
    buildings.push({
      id: nextBuildingId,
      x: leftStartX + index * step,
      width: CONFIG.buildingWidth,
      height: getBuildingHeight(index)
    });
    nextBuildingId += 1;
  }

  for (let index = 0; index < CONFIG.buildingCountPerSide; index += 1) {
    buildings.push({
      id: nextBuildingId,
      x: rightStartX + index * step,
      width: CONFIG.buildingWidth,
      height: getBuildingHeight(index + CONFIG.buildingCountPerSide)
    });
    nextBuildingId += 1;
  }

  return buildings;
}

function getBuildingHeight(index: number): number {
  const range = CONFIG.buildingMaxHeight - CONFIG.buildingMinHeight;
  const wave = (Math.sin(index * 1.35) + 1) / 2;
  return Math.round(CONFIG.buildingMinHeight + range * wave);
}
