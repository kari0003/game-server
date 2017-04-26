import * as _ from 'lodash';
import * as Boom from 'boom';

import { IQueueConfig, IMatcherConfig, IMatchConfig } from '@matchmaker/queue/queueConfig';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { BaseService } from '@matchmaker/service/baseService';
import { redisClient } from '@matchmaker/database';
import { Game, Team } from '@matchmaker/game/game';
import { Trait } from '@matchmaker/traits/trait';
import { DefaultQueue } from '@matchmaker/queue/queue';
import { QueueEntry } from '@matchmaker/queue/queueEntry'
import { IPlayer, PlayerEntry } from '@matchmaker/player/player';

const queueStore = {};

export class QueueService extends BaseService {
  async getQueueByKey(queueKey: string) {
    const queue = await redisClient.get(queueKey);
    return queue;
  }

  async createQueue(queueConfig: IQueueConfig) {
    const queue = new DefaultQueue();
    await queue.assignKey();
    // TODO differentiate queueTypes
    await redisClient.set(queue.key, queue);
    queueStore[queue.key] = queue;
    return queue;
  }

  async removeQueueByKey(queueKey: string) {
    return redisClient.del(queueKey);
  }

  async putPlayers(queueKey: string, players) {
    const queue: BaseQueue = await queueStore[queueKey];
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    const entries = _.map(players, (player: IPlayer) => {
      const playerEntry = new PlayerEntry(player);
      queue.onAddEntry(playerEntry);
      return playerEntry;
      // TODO no duplicates
    });
    return queue;
  }

  async removePlayers(queueKey: string, players) {
    const queue: DefaultQueue = await queueStore[queueKey];
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    _.map(players, (player: IPlayer) => {
      _.remove(queue.entries, (entry) => {
        return (<PlayerEntry> entry).player.id === player.id;
        // TODO invalidate matches.
      });
    });
    return queue;
  }

  async getMatches(queueKey: string) {
    const queue: DefaultQueue = await queueStore[queueKey];
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    if (queue.config.matchOnQuery) {
      await this.findMatch(queue);
    }
    return queue.pendingMatches;
  }

  async findMatch(queue: DefaultQueue) {
    const matcher = queue.config.matcherConfig;
    const matches: Game[]= [];
    const currentGame = new Game();
    currentGame.teams = _.times((<IMatchConfig> matcher.matchConfig).teamCount, (index) => {
      const team = new Team();
      team.id = index.toString();
      return team;
    });
    let teamId = 0;
    _.forEach(queue.entries, (player1) => {
      if (currentGame.teams[teamId].players.length === 0 ) {
        currentGame.teams[teamId].players.push((<PlayerEntry> player1).player);
        if (currentGame.teams[teamId].players.length === (<IMatchConfig> matcher.matchConfig).teamSize) {
          teamId ++
        }
      }
      _.forEach(queue.entries, (player2) => {
        if (player1 != player2) {
          const value = this.comparePlayers(matcher, player1, player2);
          if (value < 1) {
            currentGame.teams[teamId].players.push((<PlayerEntry> player2).player);
            if (currentGame.teams[teamId].players.length === (<IMatchConfig> matcher.matchConfig).teamSize) {
              teamId ++
            }
          }
        }
      });
    });
    queue.pendingMatches.concat(matches);
    return matches;
  }

  comparePlayers(matcher: IMatcherConfig, player1: QueueEntry, player2: QueueEntry) {
    if (matcher.isCompabilityMatcher) {
      let compatible = true;
      // TODO discord and synergy for teams only
      _.forEach(matcher.compabilityTraits!.synergy, (trait: Trait) => {
        if (player1.getTrait(trait) !== player2.getTrait(trait)) {
          compatible = false;
        }
      });
      _.forEach(matcher.compabilityTraits!.discord, (trait: Trait) => {
        if (player1.getTrait(trait) === player2.getTrait(trait)) {
          compatible = false;
        }
      });
      if (!compatible) {
        return 1;
      }
    }
    if (matcher.isDistanceMatcher) {
      _.forEach(matcher.distanceTraits!, (trait: Trait) => {
        const dist = Math.abs(player1.getTrait(trait) - player2.getTrait(trait));
        const normalized = dist / (matcher.maxDistancePlayers || dist);
        return normalized;
      });
    }
    return 0;
  }
}
