import { CONFIG } from './config';
import { InputController } from '../input/InputController';
import type { GameEvent } from '../model/events';
import { createInitialGameState, type GameState } from '../model/GameState';
import { updateAsteroidHitResolutionSystem } from '../systems/updateAsteroidHitResolutionSystem';
import { updateAsteroidSystem } from '../systems/updateAsteroidSystem';
import { updateAsteroidSpawnSystem } from '../systems/updateAsteroidSpawnSystem';
import { updateCannonSystem } from '../systems/updateCannonSystem';
import { updateLaserSystem } from '../systems/updateLaserSystem';
import { updateNukeSystem } from '../systems/updateNukeSystem';
import { updateScoreSystem } from '../systems/updateScoreSystem';
import { HudRenderer } from '../view/HudRenderer';
import { ModalRenderer } from '../view/ModalRenderer';
import { PaperRenderer } from '../view/PaperRenderer';
import { SoundRenderer } from '../view/SoundRenderer';

export class Game {
  private readonly renderer: PaperRenderer;
  private readonly hudRenderer: HudRenderer;
  private readonly modalRenderer: ModalRenderer;
  private readonly soundRenderer: SoundRenderer;
  private readonly inputController: InputController;
  private state: GameState;

  private animationFrameId: number | null = null;
  private lastFrameTimeMs: number | null = null;
  private accumulatorMs = 0;
  private frameEvents: GameEvent[] = [];

  constructor(canvas: HTMLCanvasElement, hudRoot: HTMLDivElement, modalRoot: HTMLDivElement) {
    this.renderer = new PaperRenderer(canvas);
    this.hudRenderer = new HudRenderer(hudRoot);
    this.modalRenderer = new ModalRenderer(modalRoot);
    this.soundRenderer = new SoundRenderer();
    this.inputController = new InputController();
    this.state = createInitialGameState();
  }

  start(): void {
    this.inputController.attach();
    this.modalRenderer.showStart(this.startRound);
    this.render();
    this.animationFrameId = window.requestAnimationFrame(this.onAnimationFrame);
  }

  private readonly onAnimationFrame = (frameTimeMs: number): void => {
    if (this.lastFrameTimeMs === null) {
      this.lastFrameTimeMs = frameTimeMs;
    }

    const frameDeltaMs = Math.min(frameTimeMs - this.lastFrameTimeMs, 100);
    this.lastFrameTimeMs = frameTimeMs;
    if (this.state.status === 'playing') {
      this.accumulatorMs += frameDeltaMs;
    } else {
      this.accumulatorMs = 0;
    }

    while (this.accumulatorMs >= CONFIG.fixedDeltaTimeMs) {
      this.step(CONFIG.fixedDeltaTimeMs);
      this.accumulatorMs -= CONFIG.fixedDeltaTimeMs;
    }

    this.render();
    this.consumeRenderedFrameEffects();
    this.animationFrameId = window.requestAnimationFrame(this.onAnimationFrame);
  };

  private step(deltaTimeMs: number): void {
    if (this.state.status !== 'playing') {
      return;
    }

    const input = this.inputController.getFrameInput();
    const stepEvents: GameEvent[] = [];

    updateCannonSystem(this.state, input, deltaTimeMs);
    updateLaserSystem(this.state, input, deltaTimeMs, stepEvents);
    updateNukeSystem(this.state, input, stepEvents);
    updateAsteroidHitResolutionSystem(this.state, stepEvents);
    updateAsteroidSystem(this.state, deltaTimeMs, stepEvents);
    updateScoreSystem(this.state, stepEvents);
    this.applyGameOver(stepEvents);

    if (this.state.status === 'playing') {
      updateAsteroidSpawnSystem(this.state, deltaTimeMs, stepEvents);
    }

    this.frameEvents.push(...stepEvents);
  }

  private consumeRenderedFrameEffects(): void {
    this.soundRenderer.play(this.frameEvents);

    if (this.state.laser === null) {
      this.frameEvents = [];
      return;
    }

    this.state.laser.visibleFramesRemaining -= 1;

    if (this.state.laser.visibleFramesRemaining <= 0) {
      this.state.laser = null;
    }

    this.frameEvents = [];
  }

  private readonly startRound = (): void => {
    this.state = createInitialGameState('playing');
    this.inputController.reset();
    this.soundRenderer.unlock();
    this.accumulatorMs = 0;
    this.lastFrameTimeMs = null;
    this.frameEvents = [];
    this.modalRenderer.hide();
    this.render();
  };

  private applyGameOver(events: GameEvent[]): void {
    const gameOverEvent = events.find((event) => event.type === 'game_over');

    if (gameOverEvent === undefined) {
      return;
    }

    this.state.status = 'gameOver';
    this.accumulatorMs = 0;
    this.frameEvents = [];
    this.modalRenderer.showGameOver(this.state.score, this.startRound);
  }

  private render(): void {
    this.renderer.render(this.state);
    this.hudRenderer.render(this.state);
  }
}
