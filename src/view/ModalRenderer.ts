type ModalAction = () => void;

export class ModalRenderer {
  private readonly root: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly body: HTMLParagraphElement;
  private readonly button: HTMLButtonElement;

  constructor(root: HTMLDivElement) {
    this.root = root;
    this.root.replaceChildren();
    this.root.className = 'game-modal';

    const card = document.createElement('div');
    card.className = 'game-modal-card';

    this.title = document.createElement('h2');
    this.title.className = 'game-modal-title';

    this.body = document.createElement('p');
    this.body.className = 'game-modal-body';

    this.button = document.createElement('button');
    this.button.className = 'game-modal-button';
    this.button.type = 'button';

    card.append(this.title, this.body, this.button);
    this.root.append(card);
  }

  showStart(onStart: ModalAction): void {
    this.title.textContent = 'Asteroid Defense';
    this.body.textContent = 'Defend the ground. Destroy asteroids before they wipe out every building or hit the cannon.';
    this.button.textContent = 'Start';
    this.button.onclick = onStart;
    this.root.hidden = false;
  }

  showGameOver(score: number, onRestart: ModalAction): void {
    this.title.textContent = 'Game Over';
    this.body.textContent = `Final score: ${score}`;
    this.button.textContent = 'Restart';
    this.button.onclick = onRestart;
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }
}

