import type { FrameInput } from '../input/InputController';
import type { GameEvent } from '../model/events';
import type { GameState } from '../model/GameState';

export function updateNukeSystem(state: GameState, input: FrameInput, events: GameEvent[]): void {
  if (!input.nukeJustPressed || state.nukeCount <= 0) {
    return;
  }

  state.nukeCount -= 1;
  events.push({
    type: 'nuke_activated'
  });

  for (const asteroid of state.asteroids) {
    events.push({
      type: 'asteroid_hit',
      asteroidId: asteroid.id,
      asteroidValue: asteroid.value,
      hitPoint: {
        x: asteroid.x,
        y: asteroid.y
      },
      source: 'nuke'
    });
  }
}
