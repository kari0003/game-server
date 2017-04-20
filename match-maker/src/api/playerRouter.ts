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

  @get('/:playerId')
  async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('shiat happens');
    const queueId = _.get<string>(req.params, 'queueId');
    const queueService = req.getInstance(QueueService);
    const queue = await queueService.getQueueByKey(queueId);
    console.log(queue)
    return res.finalize(queue);
  }

  @put('/:playerId')
  async putById(req: express.Request, res: express.Response, next: express.NextFunction) {

  }

  @del('/:playerId')
  async deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const queueId = _.get<string>(req.params, 'queueId');
    const queueService = req.getInstance(QueueService);
    await queueService.removeQueueByKey(queueId);
    return res.noContent();
  }
}

export const router = new QueueRouterController().router;
