export type GameEvent =
  | {
      type: 'laser_fired';
      start: { x: number; y: number };
      end: { x: number; y: number };
    }
  | {
      type: 'nuke_activated';
    }
  | {
      type: 'asteroid_spawned';
      asteroidId: number;
    }
  | {
      type: 'asteroid_hit';
      asteroidId: number;
      asteroidValue: number;
      hitPoint: { x: number; y: number };
      source: 'laser' | 'nuke';
    }
  | {
      type: 'asteroid_destroyed';
      asteroidId: number;
      asteroidValue: number;
      reason: 'laser' | 'nuke' | 'ground' | 'building' | 'cannon';
    }
  | {
      type: 'asteroid_split';
      asteroidId: number;
      asteroidValue: number;
    }
  | {
      type: 'building_destroyed';
      buildingId: number;
      asteroidId: number;
    }
  | {
      type: 'game_over';
      reason: 'buildings_destroyed' | 'cannon_hit';
    };
