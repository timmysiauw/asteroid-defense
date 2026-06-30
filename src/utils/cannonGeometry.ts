import { CONFIG } from '../game/config';

export type Point2 = {
  x: number;
  y: number;
};

export function getCannonDirection(angleDeg: number): Point2 {
  const angleRad = degreesToRadians(angleDeg);

  return {
    x: Math.cos(angleRad),
    y: -Math.sin(angleRad)
  };
}

export function getCannonBarrelDistances(): {
  startDistance: number;
  tipDistance: number;
} {
  const baseEdgeDistance = CONFIG.cannonBaseRadius;
  const currentStartDistance = CONFIG.cannonBaseRadius * 0.35;
  const currentEndDistance = currentStartDistance + CONFIG.cannonBarrelLength;

  return {
    startDistance: baseEdgeDistance - (baseEdgeDistance - currentStartDistance) * 0.5,
    tipDistance: baseEdgeDistance + (currentEndDistance - baseEdgeDistance) * 0.5
  };
}

export function getCannonBarrelTip(cannon: {
  x: number;
  y: number;
  angleDeg: number;
}): Point2 {
  const direction = getCannonDirection(cannon.angleDeg);
  const { tipDistance } = getCannonBarrelDistances();

  return {
    x: cannon.x + direction.x * tipDistance,
    y: cannon.y + direction.y * tipDistance
  };
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

