import type { GameState } from '../model/GameState';

const SCORE_DIGITS = 6;
const NUKE_DIGITS = 2;

export class HudRenderer {
  private readonly scoreValue: HTMLSpanElement;
  private readonly nukeValue: HTMLSpanElement;

  constructor(root: HTMLDivElement) {
    root.replaceChildren();

    const scoreBlock = document.createElement('div');
    scoreBlock.className = 'hud-block';

    const scoreLabel = document.createElement('span');
    scoreLabel.className = 'hud-label';
    scoreLabel.textContent = 'Score';

    this.scoreValue = document.createElement('span');
    this.scoreValue.className = 'hud-value';

    scoreBlock.append(scoreLabel, this.scoreValue);

    const nukeBlock = document.createElement('div');
    nukeBlock.className = 'hud-block';

    const nukeLabel = document.createElement('span');
    nukeLabel.className = 'hud-icon';
    nukeLabel.textContent = '☢';
    nukeLabel.setAttribute('aria-label', 'Nukes');

    this.nukeValue = document.createElement('span');
    this.nukeValue.className = 'hud-value';

    nukeBlock.append(nukeLabel, this.nukeValue);
    root.append(scoreBlock, nukeBlock);
  }

  render(state: GameState): void {
    this.scoreValue.textContent = state.score.toString().padStart(SCORE_DIGITS, '0');
    this.nukeValue.textContent = `x${state.nukeCount.toString().padStart(NUKE_DIGITS, '0')}`;
  }
}
