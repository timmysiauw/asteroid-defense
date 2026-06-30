import { CONFIG } from '../game/config';
import type { FrameInput } from '../input/InputController';
import type { GameEvent } from '../model/events';
import type { AsteroidState, GameState, LaserState } from '../model/GameState';
import { getCannonBarrelTip, getCannonDirection } from '../utils/cannonGeometry';

export function updateLaserSystem(
  state: GameState,
  input: FrameInput,
  deltaTimeMs: number,
  events: GameEvent[]
): void {
  state.cannon.laserCooldownMsRemaining = Math.max(
    0,
    state.cannon.laserCooldownMsRemaining - deltaTimeMs
  );

  if (!input.fireJustPressed || state.cannon.laserCooldownMsRemaining > 0) {
    return;
  }

  const laser = createLaser(state);
  state.laser = laser;
  events.push({
    type: 'laser_fired',
    start: laser.start,
    end: laser.end
  });

  if (laser.hitAsteroidId !== null) {
    const hitAsteroid = state.asteroids.find((asteroid) => asteroid.id === laser.hitAsteroidId);

    if (hitAsteroid !== undefined) {
      events.push({
        type: 'asteroid_hit',
        asteroidId: laser.hitAsteroidId,
        asteroidValue: hitAsteroid.value,
        hitPoint: laser.end,
        source: 'laser'
      });
    }
  }

  state.cannon.laserCooldownMsRemaining = CONFIG.laserCooldownMs;
}

function createLaser(state: GameState): LaserState & { hitAsteroidId: number | null } {
  const start = getCannonBarrelTip(state.cannon);
  const direction = getCannonDirection(state.cannon.angleDeg);
  const boundaryEnd = findLaserEndPoint(start, direction);
  const hit = findNearestAsteroidHit(start, direction, boundaryEnd, state.asteroids);
  const end = hit?.point ?? boundaryEnd;

  return {
    start,
    end,
    visibleFramesRemaining: CONFIG.laserVisibleFrames,
    hitAsteroidId: hit?.asteroidId ?? null
  };
}

function findLaserEndPoint(
  start: { x: number; y: number },
  direction: { x: number; y: number }
): { x: number; y: number } {
  const candidateTimes: number[] = [];

  if (direction.x > 0) {
    candidateTimes.push((CONFIG.width - start.x) / direction.x);
  } else if (direction.x < 0) {
    candidateTimes.push((0 - start.x) / direction.x);
  }

  if (direction.y > 0) {
    candidateTimes.push((CONFIG.height - start.y) / direction.y);
  } else if (direction.y < 0) {
    candidateTimes.push((0 - start.y) / direction.y);
  }

  const travelTime = Math.min(...candidateTimes.filter((value) => value >= 0));

  return {
    x: start.x + direction.x * travelTime,
    y: start.y + direction.y * travelTime
  };
}

function findNearestAsteroidHit(
  start: { x: number; y: number },
  direction: { x: number; y: number },
  boundaryEnd: { x: number; y: number },
  asteroids: AsteroidState[]
): { asteroidId: number; point: { x: number; y: number }; distance: number } | null {
  let nearestHit: { asteroidId: number; point: { x: number; y: number }; distance: number } | null =
    null;

  for (const asteroid of asteroids) {
    const hit = findAsteroidHit(start, direction, boundaryEnd, asteroid);

    if (hit === null) {
      continue;
    }

    if (nearestHit === null || hit.distance < nearestHit.distance) {
      nearestHit = {
        asteroidId: asteroid.id,
        point: hit.point,
        distance: hit.distance
      };
    }
  }

  return nearestHit;
}

function findAsteroidHit(
  start: { x: number; y: number },
  direction: { x: number; y: number },
  boundaryEnd: { x: number; y: number },
  asteroid: AsteroidState
): { point: { x: number; y: number }; distance: number } | null {
  const toCenterX = asteroid.x - start.x;
  const toCenterY = asteroid.y - start.y;
  const projection = toCenterX * direction.x + toCenterY * direction.y;

  if (projection < 0) {
    return null;
  }

  const distanceToCenterSquared = toCenterX * toCenterX + toCenterY * toCenterY;
  const perpendicularSquared = distanceToCenterSquared - projection * projection;
  const radiusSquared = asteroid.radius * asteroid.radius;

  if (perpendicularSquared > radiusSquared) {
    return null;
  }

  const offset = Math.sqrt(radiusSquared - perpendicularSquared);
  const hitDistance = projection - offset >= 0 ? projection - offset : projection + offset;
  const maxDistance = Math.hypot(boundaryEnd.x - start.x, boundaryEnd.y - start.y);

  if (hitDistance < 0 || hitDistance > maxDistance) {
    return null;
  }

  return {
    point: {
      x: start.x + direction.x * hitDistance,
      y: start.y + direction.y * hitDistance
    },
    distance: hitDistance
  };
}
