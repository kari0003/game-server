import * as moment from 'moment';

import { TQueueStatus } from '@matchmaker/enum/queueStatuses';
import { BaseService } from '@matchmaker/service/baseService';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { Game } from '@matchmaker/game/game';
import { redisClient } from '@matchmaker/database';

export interface IQueue {
  key: string;
  config: IQueueConfig;
  updatedAt: number;
  entries: QueueEntry[];
  pendingMatches;
  status: TQueueStatus;
}

export abstract class BaseQueue {
  public key: string;
  config: IQueueConfig;

  protected updatedAt: number;
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
  abstract async onMatchStarted(g: Game)
  abstract async onMatchFailed(g: Game)
  abstract async onPeriodUpdate()

  updateConfig(newConf: IQueueConfig) {
    this.config = newConf;
  }
}
