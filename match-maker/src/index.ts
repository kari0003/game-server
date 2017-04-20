import { DefaultQueue } from '@matchmaker/queue/queue';
import { firstEverRedisInit } from '@matchmaker/database';

// firstEverRedisInit();
import { startExpress } from './api/api';

let initPromise;
export function startServer() {
  if (!initPromise) {
    initPromise = startExpress();
  }
  return initPromise;
}

startServer();
