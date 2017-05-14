import * as _ from 'lodash';
import * as assert from 'assert';

import { createContext } from '@matchmaker/context/create';
import { QueueService } from '@matchmaker/queue/queueService';
import { IQueueConfig, defaultConfig } from '@matchmaker/queue/queueConfig';
import { IPlayer } from '@matchmaker/player/player';


export async function testPlayerAdd() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const { id: queueId } = await queueService.createQueue(defaultConfig);
  const players = generatePlayers(10);
  await queueService.putPlayers(queueId, players);
  const queue = await queueService.getQueueByKey(queueId);
  assert(queue!.entries.length === 10, 'not all players entered the queue');
}

export async function testPlayerRemove() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const { id: queueId } = await queueService.createQueue(defaultConfig);
  const players = generatePlayers(10);
  await queueService.putPlayers(queueId, players);
  await queueService.removePlayers(queueId, players);
  const queue = await queueService.getQueueByKey(queueId);

  assert(queue!.entries.length === 0, 'not all players left the queue');
}

export async function testFindMatch() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const { id: queueId } = await queueService.createQueue(defaultConfig);
  const players = generatePlayers(12);
  await queueService.putPlayers(queueId, players);
  const matches = await queueService.getMatches(queueId);
  assert(matches.length > 0, 'no matches returned');
}

export async function testStartMatch() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const { id: queueId } = await queueService.createQueue(defaultConfig);
  const players = generatePlayers(12);
  await queueService.putPlayers(queueId, players);
  const matches = await queueService.getMatches(queueId);
  const matchIds = _.map(matches, (match) => match.id);
  await queueService.startMatches(queueId, matchIds);
  const queue = await queueService.getQueueByKey(queueId);
  assert(queue!.entries.length === 2, 'not all players left the queue: ' + queue!.entries.length);
  assert(queue!.pendingMatches.length === 0, 'started match not removed ' + queue!.pendingMatches.length);
}

export async function testFailMatch() {
  const context = createContext();
  const queueService = context.getInstance(QueueService);
  const { id: queueId } = await queueService.createQueue(defaultConfig);
  const players = generatePlayers(12);
  await queueService.putPlayers(queueId, players);
  const matches = await queueService.getMatches(queueId);
  const matchIds = _.map(matches, (match) => match.id);
  await queueService.failMatches(queueId, matchIds);
  const queue = await queueService.getQueueByKey(queueId);
  assert(queue!.entries.length === 12, 'not all players returned to the queue');
  assert(queue!.pendingMatches.length === 0, 'started match not removed');
}

function generatePlayers(count: number): IPlayer[] {
  return _.times(count, (i) => {
    return {
      traits: {
        elo: 1000,
        black: false,
      }
    } as IPlayer;
  });
}
