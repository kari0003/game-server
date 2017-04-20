import * as _ from 'lodash';
import { Router } from 'express';
import { $route } from 'route-decorators';

export abstract class BaseController {
  $routes: $route[];
  router: Router;

  constructor() {
    this.router = Router({ mergeParams: true });

    _.forEach(this.$routes, ({ method, url, middleware, fnName }: $route) => {
      const handler = this[fnName].bind(this);
      const handlerMiddleware = (req, res, next) => {
        return new Promise((resolve) => {
          return resolve(handler(req, res, next));
        }).catch(next);
      };
      this.router[method](
        url,
        ...middleware,
        handlerMiddleware,
      );
    });
  }
}
