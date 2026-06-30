import paper from 'paper';
import { CONFIG } from '../game/config';
import type { GameState } from '../model/GameState';

const SKY_COLOR = '#06111f';
const GROUND_COLOR = '#9bb0c8';
const BASE_FILL_COLOR = '#1f2f41';
const BASE_STROKE_COLOR = '#f2f6fb';
const BARREL_FILL_COLOR = '#dce7f5';
const BARREL_STROKE_COLOR = '#f8fbff';

export class PaperRenderer {
  private readonly background: paper.Path.Rectangle;
  private readonly groundLine: paper.Path.Line;
  private readonly cannonBase: paper.Path;
  private readonly cannonBarrel: paper.Path;

  constructor(canvas: HTMLCanvasElement) {
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(CONFIG.width, CONFIG.height);

    this.background = new paper.Path.Rectangle({
      point: new paper.Point(0, 0),
      size: new paper.Size(CONFIG.width, CONFIG.height),
      fillColor: SKY_COLOR
    });

    this.groundLine = new paper.Path.Line({
      from: new paper.Point(0, CONFIG.groundY),
      to: new paper.Point(CONFIG.width, CONFIG.groundY),
      strokeColor: GROUND_COLOR,
      strokeWidth: 2
    });

    this.cannonBase = new paper.Path({
      strokeColor: BASE_STROKE_COLOR,
      strokeWidth: 2,
      fillColor: BASE_FILL_COLOR
    });

    this.cannonBarrel = new paper.Path({
      strokeColor: BARREL_STROKE_COLOR,
      strokeWidth: 2,
      fillColor: BARREL_FILL_COLOR,
      closed: true
    });
  }

  render(state: GameState): void {
    this.syncCannonBase(state);
    this.syncCannonBarrel(state);
    paper.view.update();
  }

  private syncCannonBase(state: GameState): void {
    const radius = CONFIG.cannonBaseRadius;
    const center = new paper.Point(state.cannon.x, state.cannon.y);

    this.cannonBase.removeSegments();
    this.cannonBase.add(new paper.Point(center.x - radius, center.y));
    this.cannonBase.arcTo(
      new paper.Point(center.x, center.y - radius),
      new paper.Point(center.x + radius, center.y)
    );
    this.cannonBase.closePath();
  }

  private syncCannonBarrel(state: GameState): void {
    const angleRad = degreesToRadians(state.cannon.angleDeg);
    const direction = new paper.Point(Math.cos(angleRad), -Math.sin(angleRad));
    const normal = new paper.Point(-direction.y, direction.x);
    const barrelHalfThickness = CONFIG.cannonBarrelThickness / 2;
    const origin = new paper.Point(state.cannon.x, state.cannon.y);
    const baseEdgeDistance = CONFIG.cannonBaseRadius;
    const currentStartDistance = CONFIG.cannonBaseRadius * 0.35;
    const currentEndDistance = currentStartDistance + CONFIG.cannonBarrelLength;
    const shortenedStartDistance =
      baseEdgeDistance - (baseEdgeDistance - currentStartDistance) * 0.5;
    const shortenedEndDistance =
      baseEdgeDistance + (currentEndDistance - baseEdgeDistance) * 0.5;
    const barrelBaseCenter = origin.add(direction.multiply(shortenedStartDistance));

    const leftBase = barrelBaseCenter.add(normal.multiply(barrelHalfThickness));
    const rightBase = barrelBaseCenter.subtract(normal.multiply(barrelHalfThickness));
    const tip = origin.add(direction.multiply(shortenedEndDistance));
    const leftTip = tip.add(normal.multiply(barrelHalfThickness));
    const rightTip = tip.subtract(normal.multiply(barrelHalfThickness));

    this.cannonBarrel.segments = [
      new paper.Segment(leftBase),
      new paper.Segment(leftTip),
      new paper.Segment(rightTip),
      new paper.Segment(rightBase)
    ];
  }
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}
