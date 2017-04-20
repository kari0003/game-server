import * as _ from 'lodash';
import * as Boom from 'boom';
import * as express from 'express';

import { logger } from '@matchmaker/util/logger';

import { IResponse, IMultipleResponse, ISingleResponse } from '@matchmaker/typings';

export function responseHandlerMiddleware() {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    res.finalize = function resFinalize(
      data,
      { count, status}: { count?: number, status?: number } = {},
    ) {
      const response: IResponse = {
        error: null,
        data: null,
      };

      // Handle error and return it.
      if (data instanceof Error) {
        const err: any = data;
        if (_.get<boolean>(err, 'isBoom', false)) {
          const output = (err as Boom.BoomError).output;
          const statusCode = output.statusCode;
          response.error = output.payload;

          // Specific http status message for jwt errors:
          if (statusCode === 498) {
            res.statusMessage = 'JSON Web Token Error';
          }

          res.status(statusCode);
          return res.json(response);

        } else {
          // Try to get status code
          if (_.isNumber(status)) {
            res.status(status);
          } else {
            res.status((err as {status?: number}).status || 500);
          }

          // Log internal errors
          if (res.statusCode === 500) {
            logger.error(
              {
                url: req.originalUrl,
                userId: req.userId,
                status: res.statusCode,
                error: err,
              },
              'responseHandler',
            );
          }

          response.error = {
            name: _.snakeCase(err.constructor.name || 'Unknown Error'),
            message: err.message,
          };

          // TODO option to omit stacktrace
          response.error.stack = err.stack;

          return res.json(response);
        }
      }

      // Handle default response
      // Assigning status
      if (_.isNumber(status)) {
        res.status(status);
      } else {
        res.status(200);
      }
      // Adding count
      if (_.isNumber(count)) {
        response.data = _.assign(
          {},
          response.data,
          { count },
        );
      }

      // adding Single or mutliple response
      if (_.isArray(data)) {
        response.data = _.assign<IMultipleResponse>(
          {},
          response.data,
          { items: data },
        );
      } else {
        response.data = _.assign<ISingleResponse>(
          {},
          response.data,
          { item: data },
        );
      }

      return res.json(response);
    };

    res.created = function finalizeCreated(data) {
      const createdStatus = 201;
      return res.finalize(data, { status: createdStatus });
    };

    res.noContent = function finalizeNoContent() {
      const noContentStatus = 204;
      res.status(noContentStatus);
      return res.json({});
    };

    return next();
  };
}
