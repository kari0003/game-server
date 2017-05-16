import * as _ from 'lodash';
import * as Boom from 'boom';

import { logger } from '@matchmaker/util/logger';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry,  queueEntryStatuses } from '@matchmaker/queue/queueEntry';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { BaseMatcherService } from '@matchmaker/queue/baseMatcherService';
import { Trait } from '@matchmaker/traits/trait';
import { Game, IGame, createGame } from '@matchmaker/game/game'

export class RolsterMatcherService extends BaseMatcherService {
  config: IQueueConfig;

  async findMatch(queue: BaseQueue) {
    const results: Game[] = [];
    this.config = queue.config;
    const entries = _.cloneDeep(queue.entries);
    const targets = this.gatherTargets(entries);
    while (targets.length > 0) {
      const selected: Game | null = await this.populateMatch(targets.pop()!, entries);
      if (selected) {

        results.push(selected);

        const entryIds: string[] = [];
        _.forEach(selected.teams, (team) => {
          _.forEach(team.entries, (entry) => {
            entryIds.push(entry.id);
          });
        });
        _.remove(entries, (entry) => _.includes(entryIds, entry.id));
        _.remove(targets, (entry) => _.includes(entryIds, entry.id));
      }
    }
    return results;
  }

  gatherTargets(entries: QueueEntry[]) {
    const targets: QueueEntry[] = [];
    let count = entries.length;
    if (this.config.matcherConfig.maxTargets >= 0) {
      count = Math.min(this.config.matcherConfig.maxTargets, entries.length);
    }
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
      game.teams[nextTeam].entries.push(nextEntry);

      if (this.validateGame(game)) {
        finished = true;
        success = true;
      } else if (potentials.length <= 0) {
        finished = true;
        success = false;
      }
    }
    if (success) {
      return game;
    }
    return null;
  }

  getPotentials(target: QueueEntry, entries: QueueEntry[]) {
    const potentials: QueueEntry[] = [];
    _.forEach(entries, (e) => {
      if (target.id !== e.id && e.status !== queueEntryStatuses.DRAFTED) {
        if (this.checkCompability(this.config.matcherConfig, target, e)) {
          potentials.push(e);
        }
      }
    });
    return potentials;
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
    const teamLengths = _.map(game.teams, team => {
      if (team.entries.length != this.config.matcherConfig.matchConfig.teamSize) {
        return false;
      }
      return true;
    });
    if (_.findIndex(teamLengths, b  => b === false) >= 0) {
      return false;
    }
    return true;
  }
}
