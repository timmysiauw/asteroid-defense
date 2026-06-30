# Asteroid Defense

Browser game spec for a modular, missile-defense-style arcade game built with Paper.js.

## Overview

Build a simple browser game on a fixed `1000 x 1000` canvas.

The game blends ideas from *Missile Command* and *Asteroids*: the player controls a ground-mounted laser cannon and shoots falling asteroids before they destroy buildings or hit the cannon.

The world wraps horizontally. Objects that leave the left edge re-enter on the right, and vice versa. Laser beams also wrap horizontally.

## Core World Setup

```js
const WIDTH = 1000
const HEIGHT = 1000
const GROUND_Y = 700
```

- Everything above `GROUND_Y` is sky.
- Buildings and the cannon sit on the ground line.
- Horizontal wrapping applies to world objects:

```js
if (x < 0) x += WIDTH
if (x > WIDTH) x -= WIDTH
```

- There is no vertical wrapping.

## Tunable Parameters

All important gameplay values should live in a central config object.

```js
const CONFIG = {
  width: 1000,
  height: 1000,
  groundY: 700,

  cannonX: 500,
  cannonTurnSpeed: 2.5,
  cannonMinAngle: 10,
  cannonMaxAngle: 170,
  cannonInitialAngle: 90,

  laserCooldownMs: 250,
  laserDisplayMs: 80,
  laserMaxWraps: 3,

  asteroidSpawnIntervalMs: 1200,
  asteroidBaseSpeed: 1.2,
  asteroidSpeedVariance: 0.6,
  asteroidMinValue: 1,
  asteroidMaxValue: 4,
  asteroidRadiusBase: 8,
  asteroidRadiusScale: 5,

  splitSpeedMultiplier: 1.05,
  splitRandomAngleDegrees: 50,

  startingNukes: 3,
  nukeRechargeMs: 60000,

  buildingCountPerSide: 5,
  buildingWidth: 45,
  buildingMinHeight: 45,
  buildingMaxHeight: 120
}
```

## Player Cannon

The cannon sits at the center of the ground.

### Visual

- Half-circle base resting on the ground
- Small rectangular barrel protruding from the base
- Barrel rotates with the cannon angle

### Controls

- Left arrow: rotate counterclockwise
- Right arrow: rotate clockwise
- Space: fire laser if cooldown is ready
- Enter: deploy nuke if at least one is available

### Rules

- Clamp the cannon angle between `cannonMinAngle` and `cannonMaxAngle`.
- If an asteroid collides with the cannon, the game ends immediately.

## Laser

When the player presses Space and cooldown is ready, fire an instantaneous laser beam from the cannon barrel in the current direction.

The beam continues until it hits:

1. An asteroid
2. The top of the canvas
3. The ground
4. The maximum number of allowed wraps

### Wrapping Behavior

- If the beam exits the left edge, it continues from the right edge at the same `y` coordinate and same angle.
- If the beam exits the right edge, it continues from the left edge.
- The rendered laser may consist of multiple line segments.

### On Asteroid Hit

- Increase score by the asteroid's current value
- Apply the asteroid split / destroy mechanic
- Stop the beam at the collision point

## Asteroids

Asteroids spawn randomly near the top of the screen.

Each asteroid has:

```js
{
  position,
  velocity,
  value,
  radius,
  paperPath
}
```

### Properties

- `value` is an integer `>= 1`
- Movement is constant-velocity
- Asteroids wrap horizontally
- Asteroids do not wrap vertically

Suggested radius formula:

```js
radius = asteroidRadiusBase + asteroidRadiusScale * Math.sqrt(value)
```

### Ground Resolution

If an asteroid reaches the ground:

- If it lands on a building footprint, destroy that building and remove the asteroid
- If it lands on the cannon footprint, game over
- Otherwise, remove the asteroid with no penalty

## Asteroid Splitting

When an asteroid is hit by either a laser or a nuke:

- If `value === 1`, destroy it
- If `value > 1`, remove the original asteroid and split it into exactly two new asteroids

Rules for splitting:

- The two new asteroid values must sum to the original value
- The split should be random
- Spawn the two new asteroids at or near the original position
- Their new directions should remain generally downward-threatening rather than flying permanently upward

Example:

```js
let a = randomInt(1, value - 1)
let b = value - a
```

Possible outcomes:

```text
8 -> 6 + 2
2 -> 1 + 1
6 -> 3 + 3
```

## Buildings

Buildings sit on the ground to the left and right of the cannon.

Suggested layout:

- `buildingCountPerSide` buildings on the left
- `buildingCountPerSide` buildings on the right
- No building should overlap the cannon
- Each building is drawn as a rectangle with varied height

### Collision Simplification

Buildings are primarily visual. Their collision volume is only their footprint on the ground, not the visible rectangle.

When an asteroid reaches `y >= GROUND_Y`:

- Check the asteroid's `x` coordinate
- If that `x` lies within the footprint of a living building, destroy the building and remove the asteroid
- If that `x` lies within the cannon footprint, end the game immediately
- Otherwise, remove the asteroid

Asteroids do not collide with the sides or tops of buildings while falling.

This keeps collision detection simple and avoids tall buildings being unintentionally easier to hit than short ones.

### Building Loss Condition

- If all buildings are destroyed, the game ends

## Nukes

The player starts with `startingNukes`.

Default:

```js
startingNukes = 3
```

When the player presses Enter and has at least one nuke:

- Decrease nuke count by 1
- Every asteroid currently on screen takes one hit
- Value `1` asteroids are destroyed
- Value `> 1` asteroids split using the normal split mechanic
- Score increases by the value of each asteroid directly hit

The player gains one additional nuke every minute.

Default:

```js
nukeRechargeMs = 60000
```

## Score

Score starts at `0`.

Whenever the player hits an asteroid with either the laser or a nuke:

```js
score += asteroid.value
```

Score is awarded based on the value of the asteroid that was directly hit before splitting.

## Game Over Conditions

The game ends immediately if:

1. An asteroid hits the cannon
2. All buildings are destroyed

On game over:

- Stop spawning asteroids
- Stop updating active objects
- Display the final score
- Show a restart option

## Suggested Implementation Structure

Suggested modules / classes:

```js
Game
Cannon
LaserSystem
Asteroid
AsteroidSystem
Building
BuildingSystem
InputSystem
UI
```

Suggested frame loop:

```js
function onFrame(event) {
  if (gameOver) return

  handleInput(event)
  updateCannon(event)
  updateAsteroids(event)
  checkCollisions()
  updateLaserVisuals(event)
  updateNukeRecharge(event)
  maybeSpawnAsteroid(event)
  updateUI()
}
```

## Collision Notes

- Laser collision can be implemented as ray / segment intersection against asteroid circles.
- Because the laser wraps horizontally, construct beam segments one at a time:

1. Start at the cannon barrel tip
2. Extend a ray in the cannon direction
3. Find the nearest collision with an asteroid or a world boundary
4. If the left or right boundary is hit, render that segment, wrap to the opposite side, and continue
5. Stop after an asteroid hit, top hit, ground hit, or `laserMaxWraps`

- Asteroid-to-building and asteroid-to-cannon checks can use simple footprint logic at ground impact time.

## Visual Style

Keep the presentation simple and readable:

- Dark sky background
- Ground line
- Gray or white asteroid circles with centered value text
- Blocky building silhouettes
- Cannon as a half-circle base with a rectangular barrel
- Bright thin laser beam visible for `laserDisplayMs`
- Nuke effect as either a brief screen flash or expanding rings from the cannon

## Sound Effects

Plan for four sound effects:

- Cannon firing
- Asteroid hit
- Building hit
- Nuke activation

## First Playable Version Goals

The first playable version should include:

- Cannon rendering
- Cannon rotation
- Laser firing with cooldown
- Horizontal laser wrapping
- Asteroid spawning and movement
- Horizontal asteroid wrapping
- Asteroid splitting
- Buildings and destruction
- Cannon collision game over
- All-buildings-destroyed game over
- Score display
- Nuke count display
- Nuke deployment
- Nuke recharge every minute
- Restart button

## TODO

1. Difficulty ramping
2. Skyline and building appearance
3. Transient effects
4. Precision control with hold-shift
5. Portfolio readiness
6. Pause and play
7. Add building count to HUD
8. Post on website
