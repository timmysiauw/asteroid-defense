import type { GameEvent } from '../model/events';
import type { GameState } from '../model/GameState';

export function updateScoreSystem(state: GameState, events: GameEvent[]): void {
  for (const event of events) {
    if (event.type === 'asteroid_hit') {
      state.score += event.asteroidValue;
    }
  }
}
