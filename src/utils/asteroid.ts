import { CONFIG } from '../game/config';

export function getAsteroidRadius(value: number): number {
  return CONFIG.asteroidRadiusBase + CONFIG.asteroidRadiusScale * Math.sqrt(value);
}

export function randomAsteroidValue(): number {
  return randomInt(CONFIG.asteroidMinValue, CONFIG.asteroidMaxValue);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

