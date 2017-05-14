import * as _ from 'lodash';

import { RedisDao } from '@matchmaker/dal/redisDao';
import { DefaultQueue } from '@matchmaker/queue/queue';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { IQueue } from '@matchmaker/queue/baseQueue';

export class QueueDao extends RedisDao<IQueue> {
  dataToObject(queueData: IQueue) {
    // TODO differentiate queueTypes
    const queue = new DefaultQueue();
    Object.assign(queue, queueData);
    return queue;
  }

  async getQueueByKey(queueKey: string) {
    const queueData = await this.findById(queueKey);
    if (!queueData) {
      return null;
    }
    return this.dataToObject(queueData);
  }

  async createQueue(queueConfig: IQueueConfig) {
    const queue = new DefaultQueue();
    const created = await this.create(queue);
    return this.dataToObject(created);
  }

  async removeQueueByKey(queueKey: string) {
    return this.deleteById(queueKey);
  }
}
