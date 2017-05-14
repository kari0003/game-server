import * as _ from 'lodash';

import { BaseDao } from '@matchmaker/dal/baseDao';
import { redisClient } from '@matchmaker/database';

export class RedisDao<T> extends BaseDao<T> {

  findById(id: string): Promise<T> {
    return redisClient.get(id);
  }

  async create(parameters: T): Promise<T> {
    let id = _.get<string | null>(parameters, 'id', null);
    if (!id) {
      id = await redisClient.getUniqueKey();
      if (!id) {
        throw new Error('id could not be generated');
      }
      _.set(parameters, 'id', id);
    }
    const created = await redisClient.set(id, parameters);
    if (created !== 'OK') {
      throw new Error('could not create');
    }
    return this.findById(id);
  }

  async updateById(id: string, parameters: T): Promise<T> {
    const existing = await redisClient.get(id);
    if (!existing) {
      const created = await redisClient.set(id, parameters);
      return created as T;
    }
    Object.assign(existing, parameters);
    const updated = await redisClient.set(id, parameters);
    return updated as T;
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await redisClient.del([id]);
    return deleted ? true : false;
  }
}
