export type FrameInput = {
  rotateLeftHeld: boolean;
  rotateRightHeld: boolean;
  fireJustPressed: boolean;
  nukeJustPressed: boolean;
};

export class InputController {
  private rotateLeftHeld = false;
  private rotateRightHeld = false;
  private fireQueued = false;
  private nukeQueued = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      this.rotateLeftHeld = true;
      event.preventDefault();
    }

    if (event.key === 'ArrowRight') {
      this.rotateRightHeld = true;
      event.preventDefault();
    }

    if (event.code === 'Space') {
      if (!event.repeat) {
        this.fireQueued = true;
      }

      event.preventDefault();
    }

    if (event.key === 'Enter') {
      if (!event.repeat) {
        this.nukeQueued = true;
      }

      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      this.rotateLeftHeld = false;
      event.preventDefault();
    }

    if (event.key === 'ArrowRight') {
      this.rotateRightHeld = false;
      event.preventDefault();
    }
  };

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  reset(): void {
    this.rotateLeftHeld = false;
    this.rotateRightHeld = false;
    this.fireQueued = false;
    this.nukeQueued = false;
  }

  getFrameInput(): FrameInput {
    const fireJustPressed = this.fireQueued;
    const nukeJustPressed = this.nukeQueued;
    this.fireQueued = false;
    this.nukeQueued = false;

    return {
      rotateLeftHeld: this.rotateLeftHeld,
      rotateRightHeld: this.rotateRightHeld,
      fireJustPressed,
      nukeJustPressed
    };
  }
}
