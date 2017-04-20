// Type definitions for route-decorators v0.2.2
// Project: https://github.com/buunguyen/route-decorators
// Definitions by: Gábor Zoltán Tóth <https://github.com/latotty>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
/* tslint:disable */

declare module 'route-decorators' {
  import { RequestHandler } from 'express';

  export interface $route {
    method: string;
    url: string,
    middleware: RequestHandler[],
    fnName: string;
  }

  export function controller(path?: string, ...middlewares: RequestHandler[]): ClassDecorator;

  export function route(method: string, path?: string, ...middlewares: RequestHandler[]): MethodDecorator;

  interface specificRoute {
    (path?: string, ...middlewares: RequestHandler[]): MethodDecorator;
  }

  const specificRouteFn: specificRoute;

  export {
    specificRouteFn as head,
    specificRouteFn as options,
    specificRouteFn as get,
    specificRouteFn as post,
    specificRouteFn as put,
    specificRouteFn as patch,
    specificRouteFn as del,
    specificRouteFn as delete,
    specificRouteFn as all,
  };
}
