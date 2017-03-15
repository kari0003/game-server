import { TQueueStatus } from '@matchmaker/enum/queueStatuses';
import { BaseService } from '@matchmaker/service/baseService';

export abstract class BaseQueueService extends BaseService {
  protected lastUpdateTime: number;

  abstract Queue(config)
  abstract createMatcher(config)
  abstract onUpdate(): TQueueStatus
  abstract draftRolsters()
  protected getTimeElapsed(currentTime: number) {
    return currentTime - this.lastUpdateTime;
  }
  abstract addEntry()
  abstract removeEntry()
  abstract updateConfig()
}
