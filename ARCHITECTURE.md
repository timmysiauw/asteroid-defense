# Architecture

This document describes how the codebase should be structured as we build the game.

The `README.md` defines the game and gameplay rules. This file defines the implementation shape we want to preserve while building.

## Goals

The architecture should optimize for:

- Clear separation between simulation and rendering
- Easy iteration on gameplay without rewriting rendering code
- Testable game logic
- Input support across keyboard, mouse, touch, and UI buttons
- A path to learning ECS ideas without overbuilding a generic engine

## Core Direction

We are using a **hybrid architecture**:

- A plain-data simulation model
- Small systems that update that model
- A dedicated Paper.js rendering layer
- Input adapters that translate raw inputs into gameplay intents

This is intentionally **ECS-influenced**, but not a full generic ECS engine.

## Guiding Rules

These are the constraints we should treat as architectural boundaries:

1. The simulation model is the source of truth.
2. The renderer only reflects model state.
3. Paper.js objects must not live in the model.
4. DOM and input event handlers must not directly mutate gameplay state.
5. Systems should be small and focused.
6. We should introduce abstraction only after repeated need appears.

## High-Level Flow

```text
Raw input
  -> input adapters
  -> frame input / intents
  -> simulation step
  -> events
  -> renderer + audio + UI response
```

Or more concretely:

```text
Keyboard / touch / HUD buttons
  -> InputController
  -> Game.step(dt, input)
  -> systems update GameState
  -> renderer syncs Paper.js scene
```

## Layers

### Model

The model contains the authoritative game state.

Examples:

- score
- timers
- game over status
- cannon angle and cooldowns
- asteroid positions, velocities, values
- building state
- transient laser or effect state

The model should contain plain TypeScript data only.

It should not contain:

- `paper.Path`
- `paper.Group`
- DOM nodes
- event listeners
- rendering-only state that can be derived

### Systems

Systems update the model each simulation step.

Each system should own one narrow area of behavior.

Examples:

- cannon rotation
- laser firing
- asteroid spawning
- asteroid movement
- horizontal wrapping
- laser hit resolution
- ground impact resolution
- nuke handling
- scoring
- game over checks

Systems should be written so they can be tested without Paper.js.

### View

The view layer owns all Paper.js objects and rendering concerns.

Responsibilities:

- create scene objects
- update scene objects from model state
- destroy scene objects when model entities disappear
- render UI overlays or visual effects

The view should not decide gameplay outcomes.

For example:

- collision should not depend on Paper.js paths
- score should not be computed in the renderer
- object lifetime should not be driven by render state

### Input

Input should go through adapters so multiple physical sources can trigger the same gameplay action.

Example:

- Enter key -> use nuke
- on-screen button tap -> use nuke

Both should produce the same intent:

```ts
{
  nukeJustPressed: true
}
```

The game logic should only care about intents, not about where they came from.

## Why Not Full ECS

A full generic ECS is probably too much infrastructure for this game at the start.

This project is small enough that a complete ECS framework would likely add more complexity than value early on. We would spend time on storage, queries, and engine abstractions before the gameplay justifies them.

What we do want from ECS:

- entities identified independently from rendering objects
- behavior implemented in systems
- data separated from behavior
- composition where it is useful

So the plan is to use **ECS-lite** rather than a fully generic ECS from day one.

## Recommended State Shape

The exact types may evolve, but the shape should be close to this:

```ts
type GameState = {
  timeMs: number
  status: 'playing' | 'gameOver'
  score: number

  cannon: CannonState
  asteroids: Map<EntityId, AsteroidState>
  buildings: Map<EntityId, BuildingState>
  lasers: LaserState[]
  effects: EffectState[]

  spawn: SpawnState
  nukes: NukeState
}
```

This is not a commitment to these exact names. It is a commitment to the idea that state is plain data and centrally understandable.

## ECS-Lite Boundary

If we introduce component-style storage, it should be for entities that naturally share behavior:

- asteroids
- buildings
- transient effects
- possibly projectiles if the laser ever becomes non-instantaneous

Potential component examples:

- `Position`
- `Velocity`
- `Radius`
- `AsteroidValue`
- `GroundFootprint`
- `Lifetime`
- `WrapHorizontal`

Some state should likely remain singleton-style rather than becoming entities:

- score
- game phase
- spawn timers
- nuke recharge timer
- global config
- cannon control state

This balance keeps the architecture practical.

## Input Model

We should distinguish held inputs from one-frame actions.

Example shape:

```ts
type FrameInput = {
  rotateLeftHeld: boolean
  rotateRightHeld: boolean
  fireJustPressed: boolean
  nukeJustPressed: boolean
}
```

This avoids bugs where holding a key or touch input accidentally repeats one-shot actions like firing a nuke.

## Events

We should use lightweight frame events to communicate outcomes from simulation to the renderer, audio, and UI.

Examples:

- laser fired
- asteroid hit
- asteroid destroyed
- building destroyed
- nuke activated
- game over

This helps us avoid leaking sound and effect logic into core systems.

Current implementation direction:

- systems emit step-local events into an event array passed down by the game loop
- the game loop accumulates those events across fixed simulation steps for the current render frame
- renderer, audio, and UI integrations can consume that render-frame event buffer
- the buffer is cleared after render

## Game Loop

Use a fixed-step simulation loop.

Suggested shape:

```ts
accumulator += frameDelta

while (accumulator >= FIXED_DT) {
  stepSimulation(FIXED_DT, input)
  accumulator -= FIXED_DT
}

renderer.sync(state)
```

Why:

- stable movement and timing
- predictable cooldown behavior
- easier debugging
- cleaner reasoning about systems

## Suggested Module Shape

This is a direction, not a rigid commitment:

```text
src/
  main.ts
  game/
    Game.ts
    GameLoop.ts
    config.ts
  model/
    GameState.ts
    entities.ts
    events.ts
  systems/
    cannonSystem.ts
    laserSystem.ts
    asteroidSpawnSystem.ts
    asteroidMovementSystem.ts
    wrapSystem.ts
    groundImpactSystem.ts
    nukeSystem.ts
    scoringSystem.ts
    gameOverSystem.ts
  input/
    InputController.ts
    KeyboardInputAdapter.ts
    HudInputAdapter.ts
  view/
    PaperRenderer.ts
    scene/
      cannonView.ts
      asteroidView.ts
      buildingView.ts
      effectsView.ts
      uiView.ts
  utils/
    math.ts
    collision.ts
    geometry.ts
```

## Build Strategy

We should build the game in thin vertical slices instead of building all abstractions up front.

Recommended first slice:

1. App bootstraps
2. Canvas appears
3. Game loop runs
4. Model state exists separately from view
5. Cannon renders from model state
6. Input changes cannon angle through intents
7. Renderer reflects updated state

After that, add gameplay in slices:

1. Laser firing
2. Asteroid spawn and movement
3. Laser hit and scoring
4. Splitting
5. Wrapping
6. Buildings and ground impact
7. Nukes
8. Restart and polish

## Anti-Goals

We should avoid these early mistakes:

- putting Paper.js objects into gameplay state
- computing collisions from render objects
- writing a generic ECS framework before the gameplay needs it
- mixing raw DOM events directly into systems
- over-modeling every concept as a component

## How To Use This Document

This file is a decision record and a guardrail.

We should use it to:

- check whether a new change preserves the model/view boundary
- decide where new logic belongs
- prevent accidental architectural drift
- justify when we introduce or reject abstraction

If the code teaches us a better structure later, we should update this file rather than silently drifting away from it.
