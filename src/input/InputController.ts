export type FrameInput = {
  rotateLeftHeld: boolean;
  rotateRightHeld: boolean;
};

export class InputController {
  private rotateLeftHeld = false;
  private rotateRightHeld = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      this.rotateLeftHeld = true;
      event.preventDefault();
    }

    if (event.key === 'ArrowRight') {
      this.rotateRightHeld = true;
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

  getFrameInput(): FrameInput {
    return {
      rotateLeftHeld: this.rotateLeftHeld,
      rotateRightHeld: this.rotateRightHeld
    };
  }
}

