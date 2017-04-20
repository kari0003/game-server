import * as express from 'express';

import { logger } from '@matchmaker/util/logger';

export function errorHandlerMiddleware() {
  return function errorHandler(
    err, // tslint:disable-line:handle-callback-err
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    if (err.errors) {
      err.extra = err.errors;
    } else if (err.getErrorObject) {
      err.extra = err.getErrorObject();
    }
    logger.info({ info: 'Error during request:', err });
    return res.finalize(err);
  };
}
