import { Trait } from '@matchmaker/traits/trait';

export interface IQueueConfig {
  queueSize: number; // maximum amount of entries allowed in queue (-1 unlimited)

  // Updating
  isUpdateEnabled: boolean;
  updateInterval: number;
  matchOnInsert: boolean;
  matchOnQuery: boolean;

  // Groups
  isPlayerEnabled: boolean; // Player can join alone
  isGroupEnabled: boolean; // Players can join in group
  minGroupSize?: number;
  maxGroupSize?: number;

  matcherConfig: IMatcherConfig;
}

export interface IMatcherConfig {
  matchConfig: IMatchConfig | IAssymetricMatchConfig;

  isDistanceMatcher: boolean; // matcher uses distance in its algorithm
  distanceTraits?: [{
    trait: Trait; // Traits used for distance matching
    weight: number; // Weight for distance based matching
  }];
  maxDistancePlayers?: number; // Players with bigger distance wont be matched into teams
  maxDistanceTeams?: number; // Teams with bigger distance wont be matched

  isCompabilityMatcher: boolean; // matcher uses compability in its algorithm
  compabilityTraits?: {
    synergy: Trait[]; // compability traits that should be the same by game
    discord: Trait[]; // compability traits that should be different by teams
  };

  isWaitDurationMatcher: boolean; // matcher can match long waiting players to an unfair game
  waitDurationWeight?: number, // modifies distance calculation for every second spent in queue
  waitDurationMaxAmount?: number, // bigger wait modifier than this wont be allowed

  maxPotentials: number; // defines the pool size of potential entries for the algorithm (-1 unlimited)
  maxTargets: number; // TODO (-1 unlimited)
}

export interface IMatchConfig {

  // Either teamSize and teamCount, or teamConfigs must be set
  teamSize: number;
  teamCount: number;
}

export interface IAssymetricMatchConfig {
  // In case of different team sizes (and other aspects) define teams in teamConfigs
  teamConfigs?: ITeamConfig[];
}

export interface ITeamConfig {
  teamSize: number;
  normalizeTraits: boolean; // Wether to normalize trait value regardless of team size
}

export const defaultConfig: IQueueConfig = {
  queueSize: -1,
  isUpdateEnabled: true,
  updateInterval: 1000,
  isGroupEnabled: false,
  isPlayerEnabled: true,
  matchOnInsert: true,
  matchOnQuery: false,
  matcherConfig: {
    matchConfig: {
      teamCount: 2,
      teamSize: 5,
    },

    isDistanceMatcher: true,
    distanceTraits: [{
      trait: {
        key: 'elo',
        type: 'number',
      },
      weight: 1.0,
    }],
    maxDistancePlayers: 50,
    maxDistanceTeams: 50,

    isCompabilityMatcher:false,
    isWaitDurationMatcher: false,

    maxPotentials: -1,
    maxTargets: -1,
  }
}
