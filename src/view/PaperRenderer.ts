import paper from 'paper';
import { CONFIG } from '../game/config';
import type { GameState } from '../model/GameState';
import { getCannonBarrelDistances, getCannonDirection } from '../utils/cannonGeometry';

const SKY_COLOR = '#06111f';
const GROUND_COLOR = '#9bb0c8';
const BASE_FILL_COLOR = '#1f2f41';
const BASE_STROKE_COLOR = '#f2f6fb';
const BARREL_FILL_COLOR = '#dce7f5';
const BARREL_STROKE_COLOR = '#f8fbff';
const LASER_COLOR = '#7ee7ff';
const ASTEROID_FILL_COLOR = '#b9c6d6';
const ASTEROID_STROKE_COLOR = '#edf4fb';
const ASTEROID_TEXT_COLOR = '#04101e';
const BUILDING_FILL_COLOR = '#5d7187';
const BUILDING_STROKE_COLOR = '#d6e0ed';

export class PaperRenderer {
  private readonly background: paper.Path.Rectangle;
  private readonly groundLine: paper.Path.Line;
  private readonly cannonBase: paper.Path;
  private readonly cannonBarrel: paper.Path;
  private readonly laserBeam: paper.Path.Line;
  private readonly asteroidShapes = new Map<number, { body: paper.Path.Circle; label: paper.PointText }>();
  private readonly buildingShapes = new Map<number, paper.Path.Rectangle>();

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

    this.laserBeam = new paper.Path.Line({
      from: new paper.Point(0, 0),
      to: new paper.Point(0, 0),
      strokeColor: LASER_COLOR,
      strokeWidth: CONFIG.laserStrokeWidth,
      strokeCap: 'round',
      visible: false
    });
  }

  render(state: GameState): void {
    this.syncCannonBase(state);
    this.syncCannonBarrel(state);
    this.syncLaser(state);
    this.syncBuildings(state);
    this.syncAsteroids(state);
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
    const directionVector = getCannonDirection(state.cannon.angleDeg);
    const direction = new paper.Point(directionVector.x, directionVector.y);
    const normal = new paper.Point(-direction.y, direction.x);
    const barrelHalfThickness = CONFIG.cannonBarrelThickness / 2;
    const origin = new paper.Point(state.cannon.x, state.cannon.y);
    const { startDistance: shortenedStartDistance, tipDistance: shortenedEndDistance } =
      getCannonBarrelDistances();
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

  private syncLaser(state: GameState): void {
    if (state.laser === null) {
      this.laserBeam.visible = false;
      return;
    }

    this.laserBeam.firstSegment.point = new paper.Point(state.laser.start.x, state.laser.start.y);
    this.laserBeam.lastSegment.point = new paper.Point(state.laser.end.x, state.laser.end.y);
    this.laserBeam.visible = true;
  }

  private syncBuildings(state: GameState): void {
    const activeIds = new Set(state.buildings.map((building) => building.id));

    for (const [buildingId, shape] of this.buildingShapes.entries()) {
      if (!activeIds.has(buildingId)) {
        shape.remove();
        this.buildingShapes.delete(buildingId);
      }
    }

    for (const building of state.buildings) {
      const topLeft = new paper.Point(building.x, CONFIG.groundY - building.height);
      const existingShape = this.buildingShapes.get(building.id);

      if (existingShape === undefined) {
        const shape = new paper.Path.Rectangle({
          point: topLeft,
          size: new paper.Size(building.width, building.height),
          fillColor: BUILDING_FILL_COLOR,
          strokeColor: BUILDING_STROKE_COLOR,
          strokeWidth: 2
        });
        this.buildingShapes.set(building.id, shape);
        continue;
      }

      existingShape.position = new paper.Point(
        building.x + building.width / 2,
        CONFIG.groundY - building.height / 2
      );
    }
  }

  private syncAsteroids(state: GameState): void {
    const activeIds = new Set(state.asteroids.map((asteroid) => asteroid.id));

    for (const [asteroidId, shape] of this.asteroidShapes.entries()) {
      if (!activeIds.has(asteroidId)) {
        shape.body.remove();
        shape.label.remove();
        this.asteroidShapes.delete(asteroidId);
      }
    }

    for (const asteroid of state.asteroids) {
      const existingShape = this.asteroidShapes.get(asteroid.id);

      if (existingShape === undefined) {
        const body = new paper.Path.Circle({
          center: new paper.Point(asteroid.x, asteroid.y),
          radius: asteroid.radius,
          fillColor: ASTEROID_FILL_COLOR,
          strokeColor: ASTEROID_STROKE_COLOR,
          strokeWidth: 2
        });
        const label = new paper.PointText({
          point: new paper.Point(asteroid.x, asteroid.y + 5),
          content: String(asteroid.value),
          justification: 'center',
          fillColor: ASTEROID_TEXT_COLOR,
          fontSize: Math.max(14, asteroid.radius * 0.8),
          fontWeight: 'bold'
        });
        this.asteroidShapes.set(asteroid.id, { body, label });
        continue;
      }

      existingShape.body.position = new paper.Point(asteroid.x, asteroid.y);
      existingShape.label.point = new paper.Point(asteroid.x, asteroid.y + 5);
      existingShape.label.content = String(asteroid.value);
    }
  }
}
