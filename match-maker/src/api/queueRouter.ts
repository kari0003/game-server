import * as _ from 'lodash';
import * as express from 'express';
import { controller, get, post, put, del } from 'route-decorators';

import { BaseController } from '@matchmaker/api/baseController';

import { QueueService } from '@matchmaker/queue/queueService';
import { IQueueConfig } from '@matchmaker/queue/queueConfig';
//import { router as washRouter } from './wash/wash';

@controller()
class QueueRouterController extends BaseController {
  constructor() {
    super();

//    this.router.use('/wash', washRouter);
  }

  @get()
  async get(req: express.Request, res: express.Response, next: express.NextFunction) {

  }

  @post()
  async post(req: express.Request, res: express.Response, next: express.NextFunction) {
    const config = _.get<IQueueConfig>(req, 'body.config');
    const queueService = req.getInstance(QueueService);
    const createdQueue = await queueService.createQueue(config);
    return res.finalize(createdQueue);
  }

  @get('/:queueId')
  async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const queueService = req.getInstance(QueueService);
    const queue = await queueService.getQueueByKey(queueId);
    return res.finalize(queue);
  }

  @put('/:queueId')
  async putById(req: express.Request, res: express.Response, next: express.NextFunction) {

  }

  @del('/:queueId')
  async deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const queueService = req.getInstance(QueueService);
    await queueService.removeQueueByKey(queueId);
    return res.noContent();
  }

  @put('/:queueId/players')
  async putPlayersById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const players = _.get(req, 'body.players');
    const queueService = req.getInstance(QueueService);
    await queueService.putPlayers(queueId, players);
    return res.noContent();
  }

  @del('/:queueId/players')
  async removePlayersById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const players = _.get(req, 'body.players');
    const queueService = req.getInstance(QueueService);
    await queueService.removePlayers(queueId, players);
    return res.noContent();
  }

  @get('/:queueId/matches')
  async getMatchesById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const queueService = req.getInstance(QueueService);
    await queueService.getMatches(queueId);
    return res.noContent();
  }

  @put('/:queueId/matches/start')
  async putStartMatchesById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const matchIds = _.get<string[]>(req, 'body.matches');
    const queueService = req.getInstance(QueueService);
    const matches = await queueService.startMatches(queueId, matchIds);
    return res.finalize(matches);
  }

  @put('/:queueId/matches/cancel')
  async putCancelMatchesById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const matchIds = _.get<string[]>(req, 'body.matches');
    const queueService = req.getInstance(QueueService);
    const matches = await queueService.failMatches(queueId, matchIds);
    return res.finalize(matches);
  }
}

export const router = new QueueRouterController().router;
