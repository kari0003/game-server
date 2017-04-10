import { TQueueStatus } from '@matchmaker/enum/queueStatuses';
import { BaseService } from '@matchmaker/service/baseService';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';

export abstract class BaseQueue {
  config: IQueueConfig;
  protected updatedAt: number;

  abstract Queue(config)
  abstract createMatcher(config)
  abstract onUpdate(): TQueueStatus
  protected getTimeElapsed(currentTime: number) {
    return currentTime - this.updatedAt;
  }

  // events:
  abstract async onAddEntry()
  abstract async onRemoveEntry()
  abstract async onMatchFound()
  abstract async onMatchStarted()
  abstract async onMatchFailed()
  abstract async onPeriodUpdate()

  abstract updateConfig()
}
