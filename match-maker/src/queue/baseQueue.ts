import * as moment from 'moment';

import { TQueueStatus, queueStatuses } from '@matchmaker/enum/queueStatuses';
import { BaseService } from '@matchmaker/service/baseService';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { IGame, Game } from '@matchmaker/game/game';
import { redisClient } from '@matchmaker/database';

export interface IQueue {
  key: string;
  config: IQueueConfig;
  updatedAt: number;
  entries: QueueEntry[];
  pendingMatches: IGame[];
  status: TQueueStatus;
}

export abstract class BaseQueue implements IQueue {
  public key: string;
  config: IQueueConfig;
  entries: QueueEntry[];
  pendingMatches: IGame[];
  status: TQueueStatus = queueStatuses.IDLE;

  updatedAt: number;
  protected getTimeElapsed(currentTime: number) {
    return currentTime - this.updatedAt;
  }

  async assignKey() {
    const key = await redisClient.getUniqueKey() as string;
    if (!key) {
      throw new Error('key could not be generated');
    }
    this.key = key;
    return key;
  }

  constructor(config) {
    this.config = config;
    this.updatedAt = moment().unix();
  }

  // events:
  abstract async onAddEntry(e: QueueEntry)
  abstract async onRemoveEntry(e: QueueEntry) // CONSIDER: by id?
  abstract async onMatchFound(g: Game)
  abstract async onMatchStarted(matchId: string)
  abstract async onMatchFailed(matchId: string)
  abstract async onPeriodUpdate()

  updateConfig(newConf: IQueueConfig) {
    this.config = newConf;
  }
}
