import { CONFIG } from './config';
import { InputController } from '../input/InputController';
import { createInitialGameState, type GameState } from '../model/GameState';
import { updateCannonSystem } from '../systems/updateCannonSystem';
import { PaperRenderer } from '../view/PaperRenderer';

export class Game {
  private readonly renderer: PaperRenderer;
  private readonly inputController: InputController;
  private readonly state: GameState;

  private animationFrameId: number | null = null;
  private lastFrameTimeMs: number | null = null;
  private accumulatorMs = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new PaperRenderer(canvas);
    this.inputController = new InputController();
    this.state = createInitialGameState();
  }

  start(): void {
    this.inputController.attach();
    this.renderer.render(this.state);
    this.animationFrameId = window.requestAnimationFrame(this.onAnimationFrame);
  }

  private readonly onAnimationFrame = (frameTimeMs: number): void => {
    if (this.lastFrameTimeMs === null) {
      this.lastFrameTimeMs = frameTimeMs;
    }

    const frameDeltaMs = Math.min(frameTimeMs - this.lastFrameTimeMs, 100);
    this.lastFrameTimeMs = frameTimeMs;
    this.accumulatorMs += frameDeltaMs;

    while (this.accumulatorMs >= CONFIG.fixedDeltaTimeMs) {
      this.step(CONFIG.fixedDeltaTimeMs);
      this.accumulatorMs -= CONFIG.fixedDeltaTimeMs;
    }

    this.renderer.render(this.state);
    this.animationFrameId = window.requestAnimationFrame(this.onAnimationFrame);
  };

  private step(deltaTimeMs: number): void {
    const input = this.inputController.getFrameInput();
    updateCannonSystem(this.state, input, deltaTimeMs);
  }
}

