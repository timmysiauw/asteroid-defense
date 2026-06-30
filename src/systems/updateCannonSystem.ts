import { CONFIG } from '../game/config';
import type { FrameInput } from '../input/InputController';
import type { GameState } from '../model/GameState';

export function updateCannonSystem(
  state: GameState,
  input: FrameInput,
  deltaTimeMs: number
): void {
  const turnDirection = Number(input.rotateLeftHeld) - Number(input.rotateRightHeld);
  const deltaTimeSeconds = deltaTimeMs / 1000;
  const angleDelta = turnDirection * CONFIG.cannonTurnSpeedDegPerSecond * deltaTimeSeconds;

  state.cannon.angleDeg = clamp(
    state.cannon.angleDeg + angleDelta,
    CONFIG.cannonMinAngleDeg,
    CONFIG.cannonMaxAngleDeg
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

