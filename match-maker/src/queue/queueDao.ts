import * as _ from 'lodash';

import { RedisDao } from '@matchmaker/dal/redisDao';
import { DefaultQueue } from '@matchmaker/queue/queue';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { PlayerEntry, GroupEntry } from '@matchmaker/player/player';
import { IQueueConfig, defaultConfig } from '@matchmaker/queue/queueConfig';
import { IQueue } from '@matchmaker/queue/baseQueue';

export class QueueDao extends RedisDao<IQueue> {
  dataToObject(queueData: IQueue) {
    // TODO differentiate queueTypes
    const queue = new DefaultQueue();
    Object.assign(queue, queueData);
    queue.entries = _.map(queue.entries, entryData => {
      if (_.get(entryData, 'player', false)) {
        const entry = new PlayerEntry(entryData['player']);
        Object.assign(entry, entryData);
        return entry;
      }
      // if (_.get(entryData, 'players', false)) {
      const entry = new GroupEntry(entryData['players']);
      Object.assign(entry, entryData);
      return entry;
      // }
    });
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
    if (!queueConfig) {
      queueConfig = defaultConfig;
    }
    const queue = new DefaultQueue();
    const created = await this.create(queue);
    return this.dataToObject(created);
  }

  async removeQueueByKey(queueKey: string) {
    return this.deleteById(queueKey);
  }
}
