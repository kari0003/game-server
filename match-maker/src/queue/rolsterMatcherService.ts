import * as _ from 'lodash';
import * as Boom from 'boom';

import { logger } from '@matchmaker/util/logger';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry,  queueEntryStatuses } from '@matchmaker/queue/queueEntry';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { BaseService } from '@matchmaker/service/baseService';
import { Trait } from '@matchmaker/traits/trait';
import { Game, IGame, createGame } from '@matchmaker/game/game'

export class RolsterMatcherService extends BaseService {
  config: IQueueConfig;

  findMatch(queue: BaseQueue) {
    this.config = queue.config;
    const results: IGame[] = [];
    const targets = this.gatherTargets(queue.entries);
  }

  gatherTargets(entries: QueueEntry[]) {
    const targets: QueueEntry[] = [];
    const count = Math.min(this.config.matcherConfig.maxTargets, entries.length);
    _.times(count, (i) => {
      if (entries[i].status === queueEntryStatuses.SEARCHING) {
        targets.push(entries[i]);
      }
    });
    return targets;
  }

  async populateMatch(target: QueueEntry, entries: QueueEntry[]) {
    const game: Game = await createGame(this.config.matcherConfig.matchConfig.teamCount);
    let success = false;
    let finished = false;
    const potentials = this.getPotentials(target, entries);
    while(!finished) {
      const nextTeam = this.getNextTeam(game);

      const nextEntry = this.pickEntry(game, nextTeam, potentials);
      if(!nextEntry) {
        finished = true;
      }
      _.remove(potentials, (e) => e.id === nextEntry!.id);
      game.teams[nextTeam].push(nextEntry);

      if (this.validateGame(game)) {
        finished = true;
        success = true;
      } else if (potentials.length <= 0) {
        finished = true;
        success = false;
      }

    }
  }

  getPotentials(target: QueueEntry, entries: QueueEntry[]) {
    const potentials: QueueEntry[] = [];
    _.forEach(entries, (e) => {
      if (target.id !== e.id && e.status !== queueEntryStatuses.DRAFTED) {
        if (this.compareEntries(target, e) < (this.config.matcherConfig.maxDistancePlayers || 1)) {
          potentials.push(e);
        }
      }
    });
    return potentials;
  }

  compareEntries(entry1: QueueEntry, entry2: QueueEntry) {
    /*if (this.config.matcherConfig.isCompabilityMatcher) {
      let compatible = true;
      // TODO discord and synergy for teams only
      _.forEach(this.config.matcherConfig.compabilityTraits!.synergy, (trait: Trait) => {
        if (entry1.getTrait(trait) !== entry2.getTrait(trait)) {
          compatible = false;
        }
      });
      _.forEach(this.config.matcherConfig.compabilityTraits!.discord, (trait: Trait) => {
        if (entry1.getTrait(trait) === entry2.getTrait(trait)) {
          compatible = false;
        }
      });
      if (!compatible) {
        return 1;
      }
    }*/
    if (this.config.matcherConfig.isDistanceMatcher) {
      const distances = _.map(this.config.matcherConfig.distanceTraits!, (trait: Trait) => {
        const dist = Math.abs(entry1.getTrait(trait) - entry2.getTrait(trait));
        const normalized = dist / (this.config.matcherConfig.maxDistancePlayers || 1);
        return normalized;
      });
      return _.sum(distances);
    }
    return 0;
  }

  getNextTeam(game: Game) {
    const team = _.minBy(game.teams, t => t.entries.length);
    return team.id;
  }

  pickEntry(game: Game, nextTeam: string, potentials: QueueEntry[]) {
    let best: QueueEntry | null = null;
    let bestDist = 0;
    _.forEach(potentials, (entry, index) => {
      const newTeamSize = entry.count + game.teams[nextTeam].entries.length;
      if (newTeamSize > this.config.matcherConfig.matchConfig.teamSize) {
        return;
      }
      const playerDist = 0;// TODO this.compareEntryToTeam(potentials, team);
      const teamDist = 0;// TODO this.compareTeamWithEntryToTeam(potentials, team);
      const dist = playerDist + teamDist;
      if (dist < bestDist || index == 0) {
        bestDist = playerDist;
        best = entry;
      }
    });
    return best as QueueEntry | null;
  }

  validateGame(game: Game) {
    if(game.teams.length != this.config.matcherConfig.matchConfig.teamCount) {
      return false;
    }
    _.forEach(game.teams, team => {
      if (team.entries.length != this.config.matcherConfig.matchConfig.teamSize) {
        return false;
      }
    });
    return true;
  }
}
