import * as redis from 'redis';

import { logger } from '@matchmaker/util/logger';

export const _redisClient = redis.createClient();

_redisClient.on('error', function (error) {
  logger.error('Redis encountered an error: ', error);
});

export async function firstEverRedisInit() {
  return new Promise((resolve, reject) => {
    return _redisClient.set('uniqueCounter', '0', (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

export class RedisWrapper {
  async get(key: string) {
    return new Promise((resolve, reject) => {
      _redisClient.get(key, (err, res) => {
        if (err) {
          return reject(err);
        }
        try {
          const parsed = JSON.parse(res);
          return resolve(parsed);
        } catch (err) {
          return resolve(res);
        }
      });
    })
  }

  async del(keys: string[]) {
    return new Promise((resolve, reject) => {
      _redisClient.del(keys, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res as number);
      });
    })
  }

  async incr(key: string) {
    return new Promise((resolve, reject) => {
      _redisClient.incr(key, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    })
  }

  async set(key: string, value: any, expireSeconds?: number, expireMilli?: number) {
    return new Promise((resolve, reject) => {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      _redisClient.set(key, payload, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    })
  }

  getUniqueKey(): Promise<string> {
    return new Promise( (resolve, reject) => {
      _redisClient.incr('uniqueCounter', (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    }).then((value) => {
      return value as string;
    }).catch((err) => {
      logger.error(err);
      throw new Error(err);
    })
  }
}

export const redisClient = new RedisWrapper();
