import * as _ from 'lodash';
import * as express from 'express';

import { getInstance } from '@matchmaker/context/getInstance';
import { createContext } from '@matchmaker/context/create';

import { IContext, IContextable, ContextableConstructor } from '@matchmaker/typings';

export function contextableMiddleware() {
  return function middleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.getContext = function(this: express.Request & {__context?: IContext}) {
      if (!this.__context) {
        this.__context = createContext({
          userId: _.get<string | undefined>(this, 'userId'),
        });
      }
      return this.__context;
    }.bind(req);

    req.getInstance = <T extends IContextable>(contextable: ContextableConstructor<T>) =>
      getInstance<T>(req.getContext(), contextable);

    return next();
  };
}
