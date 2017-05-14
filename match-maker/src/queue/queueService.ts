import * as _ from 'lodash';
import * as Boom from 'boom';

import { logger } from '@matchmaker/util/logger';
import { IQueueConfig, IMatcherConfig, IMatchConfig } from '@matchmaker/queue/queueConfig';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { BaseService } from '@matchmaker/service/baseService';
import { redisClient } from '@matchmaker/database';
import { Game, Team } from '@matchmaker/game/game';
import { Trait } from '@matchmaker/traits/trait';
import { DefaultQueue } from '@matchmaker/queue/queue';
import { QueueDao } from '@matchmaker/queue/queueDao';

import { QueueEntry } from '@matchmaker/queue/queueEntry'
import { IPlayer, PlayerEntry } from '@matchmaker/player/player';

const queueStore = {};

export class QueueService extends BaseService {
  async getQueueByKey(queueKey: string) {
    //const queue = await redisClient.get(queueKey);

    //return queueStore[queueKey]
    //return queue;

    const queueDao = this.getInstance(QueueDao);
    return queueDao.getQueueByKey(queueKey);
  }

  async createQueue(queueConfig: IQueueConfig) {
    const queueDao = this.getInstance(QueueDao);
    return queueDao.createQueue(queueConfig);
  }

  async updateQueue(queue: BaseQueue) {
    const queueDao = this.getInstance(QueueDao);
    return queueDao.updateById(queue.id, queue);
  }

  async removeQueueByKey(queueKey: string) {
    const queueDao = this.getInstance(QueueDao);
    return queueDao.removeQueueByKey(queueKey);
  }

  async putPlayers(queueKey: string, players) {
    const queue = await this.getQueueByKey(queueKey);
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    const entries = await Promise.all(_.map(players, async (player: IPlayer) => {
      if (!player.id) {
        const unique = await redisClient.getUniqueKey();
        player.id = `player${unique}`;
      }
      const playerEntry = new PlayerEntry(player);
      queue.onAddEntry(playerEntry);
      return playerEntry;
      // TODO no duplicates
    }));
    await this.updateQueue(queue);
    return queue;
  }

  async removePlayers(queueKey: string, players) {
    const queue = await this.getQueueByKey(queueKey);
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    _.map(players, (player: IPlayer) => {
      _.remove(queue.entries, (entry) => {
        return (<PlayerEntry> entry).player.id === player.id;
        // TODO invalidate matches.
      });
    });
    await this.updateQueue(queue);
    return queue;
  }

  async getMatches(queueKey: string) {
    //const queue: DefaultQueue = queueStore[queueKey];
    const queue = await this.getQueueByKey(queueKey);
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    if (queue.config.matchOnQuery) {
      await this.findMatch(queue);
    }
    await this.updateQueue(queue);
    return queue.pendingMatches;
  }

  async startMatches(queueKey: string, matchIds: string[]) {
    const queue = await this.getQueueByKey(queueKey);
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    let started = 0;
    await Promise.all(_.forEach(matchIds, async (matchId) => {
      try {
        await queue.onMatchStarted(matchId);
        started ++;
      } catch (err) {
        logger.error(err);
      };
    }));
    await this.updateQueue(queue);
    return started;
  }

  async failMatches(queueKey: string, matchIds: string[]) {
    const queue = await this.getQueueByKey(queueKey);
    if (!queue) {
      throw new Boom.notFound('queue not found');
    }
    let failed = 0;
    await Promise.all(_.forEach(matchIds, async (matchId) => {
      try {
        await queue.onMatchFailed(matchId);
        failed ++;
      } catch (err) {
        logger.error(err);
      };
    }));
    await this.updateQueue(queue);
    return failed;
  }

  async findMatch(queue: DefaultQueue) {
    const matcher = queue.config.matcherConfig;
    const matches: Game[]= [];
    const newId = <string> await redisClient.getUniqueKey();
    const currentGame = new Game(newId);
    currentGame.teams = _.times((<IMatchConfig> matcher.matchConfig).teamCount, (index) => {
      const team = new Team();
      team.id = index.toString();
      return team;
    });
    let teamId = 0;
    _.forEach(queue.entries, (player1) => {
      if (player1.status !== 'drafted') {
        currentGame.teams[teamId].entries.push(player1);
        if (currentGame.teams[teamId].entries.length >= (<IMatchConfig> matcher.matchConfig).teamSize) {
          teamId ++;
          if (teamId >= (<IMatchConfig> matcher.matchConfig).teamCount) {
            matches.push(currentGame);
            return false;
          }
        }
      }
    });
    _.forEach(matches, (match) => queue.onMatchFound(match));
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
