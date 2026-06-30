import { CONFIG } from '../game/config';

export function getAsteroidRadius(value: number): number {
  return CONFIG.asteroidRadiusBase + CONFIG.asteroidRadiusScale * Math.sqrt(value);
}

export function randomAsteroidValue(): number {
  return randomInt(CONFIG.asteroidMinValue, CONFIG.asteroidMaxValue);
}

export function randomAsteroidSides(): number {
  return randomInt(6, 10);
}

export function randomRotationDeg(): number {
  return randomFloat(0, 360);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
