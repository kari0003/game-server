import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';
import * as path from 'path';

import { logger } from '@matchmaker/util/logger';
import { contextableMiddleware } from '@matchmaker/api/middlewares/contextableMiddleware';
import { responseHandlerMiddleware } from '@matchmaker/api/middlewares/responseHandlerMiddleware';
import { errorHandlerMiddleware } from '@matchmaker/api/middlewares/errorHandlerMiddleware';
import { router as queueRouter } from '@matchmaker/api/queueRouter';

const app = express();

export async function initExpress() {
  app.get('api/v1/status', (req, res) => {res.sendStatus(200)});

  app.use(responseHandlerMiddleware());

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(contextableMiddleware());

  app.use('/api/v1/queue', queueRouter);

  app.use(errorHandlerMiddleware());
}

export async function startExpress() {
  initExpress()
  .then(() => {
    return new Promise((resolve) => {
        app.listen(3000, 'localhost', () => {
          logger.info('Server started');
          return resolve();
        });
    });
  })
  .catch(err => {
    logger.error(err);
  });
}
