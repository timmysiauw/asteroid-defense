import { CONFIG } from '../game/config';
import type { GameEvent } from '../model/events';
import type { GameState } from '../model/GameState';

export function updateAsteroidSystem(
  state: GameState,
  deltaTimeMs: number,
  events: GameEvent[]
): void {
  if (state.asteroids.length === 0) {
    return;
  }

  const deltaTimeSeconds = deltaTimeMs / 1000;
  const remainingAsteroids = [];

  for (const asteroid of state.asteroids) {
    const nextAsteroid = {
      ...asteroid,
      x: asteroid.x + asteroid.velocityX * deltaTimeSeconds,
      y: asteroid.y + asteroid.velocityY * deltaTimeSeconds
    };

    if (nextAsteroid.y + nextAsteroid.radius >= CONFIG.groundY) {
      if (asteroidHitsCannonFootprint(nextAsteroid.x)) {
        events.push({
          type: 'asteroid_destroyed',
          asteroidId: nextAsteroid.id,
          asteroidValue: nextAsteroid.value,
          reason: 'cannon'
        });
        events.push({
          type: 'game_over',
          reason: 'cannon_hit'
        });
        continue;
      }

      const impactedBuilding = state.buildings.find((building) =>
        asteroidHitsBuildingFootprint(nextAsteroid.x, building)
      );

      if (impactedBuilding !== undefined) {
        state.buildings = state.buildings.filter((building) => building.id !== impactedBuilding.id);
        events.push({
          type: 'building_destroyed',
          buildingId: impactedBuilding.id,
          asteroidId: nextAsteroid.id
        });
        events.push({
          type: 'asteroid_destroyed',
          asteroidId: nextAsteroid.id,
          asteroidValue: nextAsteroid.value,
          reason: 'building'
        });
        if (state.buildings.length === 0) {
          events.push({
            type: 'game_over',
            reason: 'buildings_destroyed'
          });
        }
        continue;
      }

      events.push({
        type: 'asteroid_destroyed',
        asteroidId: nextAsteroid.id,
        asteroidValue: nextAsteroid.value,
        reason: 'ground'
      });
      continue;
    }

    remainingAsteroids.push(nextAsteroid);
  }

  state.asteroids = remainingAsteroids;
}

function asteroidHitsBuildingFootprint(asteroidX: number, building: GameState['buildings'][number]): boolean {
  return asteroidX >= building.x && asteroidX <= building.x + building.width;
}

function asteroidHitsCannonFootprint(asteroidX: number): boolean {
  return (
    asteroidX >= CONFIG.cannonX - CONFIG.cannonFootprintHalfWidth &&
    asteroidX <= CONFIG.cannonX + CONFIG.cannonFootprintHalfWidth
  );
}
