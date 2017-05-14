import * as moment from 'moment';

import { TQueueStatus, queueStatuses } from '@matchmaker/enum/queueStatuses';
import { BaseService } from '@matchmaker/service/baseService';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { IGame, Game } from '@matchmaker/game/game';
import { redisClient } from '@matchmaker/database';

export interface IQueue {
  id: string;
  config: IQueueConfig;
  updatedAt: number;
  entries: QueueEntry[];
  pendingMatches: IGame[];
  status: TQueueStatus;
}

export abstract class BaseQueue implements IQueue {
  public id: string;
  config: IQueueConfig;
  entries: QueueEntry[];
  pendingMatches: IGame[];
  status: TQueueStatus = queueStatuses.IDLE;

  updatedAt: number;
  protected getTimeElapsed(currentTime: number) {
    return currentTime - this.updatedAt;
  }

  async assignKey() {
    const id = await redisClient.getUniqueKey() as string;
    if (!id) {
      throw new Error('id could not be generated');
    }
    this.id = id;
    return id;
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
