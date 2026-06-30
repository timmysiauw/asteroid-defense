import { CONFIG } from '../game/config';
import type { GameEvent } from '../model/events';
import type { AsteroidState, GameState } from '../model/GameState';
import {
  getAsteroidRadius,
  randomAsteroidSides,
  randomAsteroidValue,
  randomFloat,
  randomRotationDeg
} from '../utils/asteroid';

export function updateAsteroidSpawnSystem(
  state: GameState,
  deltaTimeMs: number,
  events: GameEvent[]
): void {
  state.asteroidSpawn.cooldownMsRemaining -= deltaTimeMs;

  while (state.asteroidSpawn.cooldownMsRemaining <= 0) {
    const asteroid = createAsteroid(state.asteroidSpawn.nextAsteroidId);
    state.asteroids.push(asteroid);
    events.push({
      type: 'asteroid_spawned',
      asteroidId: asteroid.id
    });
    state.asteroidSpawn.nextAsteroidId += 1;
    state.asteroidSpawn.cooldownMsRemaining += CONFIG.asteroidSpawnIntervalMs;
  }
}

function createAsteroid(id: number): AsteroidState {
  const value = randomAsteroidValue();

  return {
    id,
    x: randomInRange(CONFIG.asteroidSpawnMinX, CONFIG.asteroidSpawnMaxX),
    y: CONFIG.asteroidStartY,
    value,
    radius: getAsteroidRadius(value),
    sides: randomAsteroidSides(),
    rotationDeg: randomRotationDeg(),
    velocityX: randomInRange(CONFIG.asteroidVelocityXMin, CONFIG.asteroidVelocityXMax),
    velocityY: randomInRange(CONFIG.asteroidVelocityYMin, CONFIG.asteroidVelocityYMax)
  };
}

function randomInRange(min: number, max: number): number {
  return randomFloat(min, max);
}
