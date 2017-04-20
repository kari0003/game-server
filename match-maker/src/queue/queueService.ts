import * as _ from 'lodash';

import { IQueueConfig } from '@matchmaker/queue/queueConfig';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { BaseService } from '@matchmaker/service/baseService';
import { redisClient } from '@matchmaker/database';
import { DefaultQueue } from '@matchmaker/queue/queue';


export class QueueService extends BaseService {
  async getQueueByKey(queueKey: string) {
    console.log(queueKey);
    const queue = await redisClient.get(queueKey);
    console.log('asdfaasdfa');
    return queue;
  }

  async createQueue(queueConfig: IQueueConfig) {
    const queue = new DefaultQueue();
    await queue.assignKey();
    // TODO differentiate queueTypes
    await redisClient.set(queue.key, queue);
    return queue;
  }

  async removeQueueByKey(queueKey: string) {
    return redisClient.del(queueKey);
  }
}
