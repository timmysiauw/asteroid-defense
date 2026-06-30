import type { FrameInput } from '../input/InputController';
import type { GameState } from '../model/GameState';

export function updateAudioSystem(state: GameState, input: FrameInput): void {
  if (!input.toggleAudioJustPressed) {
    return;
  }

  state.audioEnabled = !state.audioEnabled;
}

