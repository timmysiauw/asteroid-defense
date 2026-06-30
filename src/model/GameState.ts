import { CONFIG } from '../game/config';

export type CannonState = {
  x: number;
  y: number;
  angleDeg: number;
};

export type GameState = {
  status: 'playing';
  cannon: CannonState;
};

export function createInitialGameState(): GameState {
  return {
    status: 'playing',
    cannon: {
      x: CONFIG.cannonX,
      y: CONFIG.groundY,
      angleDeg: CONFIG.cannonInitialAngleDeg
    }
  };
}

