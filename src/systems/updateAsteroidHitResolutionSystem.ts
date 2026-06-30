import { CONFIG } from '../game/config';
import type { GameEvent } from '../model/events';
import type { AsteroidState, GameState } from '../model/GameState';
import { getAsteroidRadius, randomAsteroidSides, randomInt, randomRotationDeg } from '../utils/asteroid';

export function updateAsteroidHitResolutionSystem(
  state: GameState,
  events: GameEvent[]
): void {
  for (const event of events) {
    if (event.type !== 'asteroid_hit') {
      continue;
    }

    const asteroid = state.asteroids.find((candidate) => candidate.id === event.asteroidId);

    if (asteroid === undefined) {
      continue;
    }

    state.asteroids = state.asteroids.filter((candidate) => candidate.id !== asteroid.id);

    if (asteroid.value <= 1) {
      events.push({
        type: 'asteroid_destroyed',
        asteroidId: asteroid.id,
        asteroidValue: asteroid.value,
        reason: event.source
      });
      continue;
    }

    events.push({
      type: 'asteroid_split',
      asteroidId: asteroid.id,
      asteroidValue: asteroid.value
    });
    events.push({
      type: 'asteroid_destroyed',
      asteroidId: asteroid.id,
      asteroidValue: asteroid.value,
      reason: event.source
    });

    const [leftValue, rightValue] = splitAsteroidValue(asteroid.value);
    state.asteroids.push(
      createSplitAsteroid(state, asteroid, leftValue, -1),
      createSplitAsteroid(state, asteroid, rightValue, 1)
    );
  }
}

function splitAsteroidValue(value: number): [number, number] {
  const leftValue = randomInt(1, value - 1);
  return [leftValue, value - leftValue];
}

function createSplitAsteroid(
  state: GameState,
  asteroid: AsteroidState,
  value: number,
  directionBias: -1 | 1
): AsteroidState {
  const deltaTimeSeconds = CONFIG.fixedDeltaTimeMs / 1000;
  const baseVelocityX = asteroid.velocityX * CONFIG.asteroidSplitSpeedMultiplier;
  const baseVelocityY = asteroid.velocityY * CONFIG.asteroidSplitSpeedMultiplier;
  const angleOffsetRad =
    ((CONFIG.asteroidSplitAngleJitterDeg * (0.5 + Math.random() * 0.5) * directionBias) *
      Math.PI) /
    180;
  const rotatedVelocity = rotateVector(baseVelocityX, baseVelocityY, angleOffsetRad);
  const velocityY = Math.max(40, rotatedVelocity.y);
  const spawnX = asteroid.x + directionBias * 8;
  const spawnY = asteroid.y;

  return {
    id: state.asteroidSpawn.nextAsteroidId++,
    x: spawnX + rotatedVelocity.x * deltaTimeSeconds,
    y: spawnY + velocityY * deltaTimeSeconds,
    value,
    radius: getAsteroidRadius(value),
    sides: randomAsteroidSides(),
    rotationDeg: randomRotationDeg(),
    velocityX: rotatedVelocity.x,
    velocityY
  };
}

function rotateVector(x: number, y: number, angleRad: number): { x: number; y: number } {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}
