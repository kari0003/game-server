import { IContextable, IContext, ContextableConstructor } from '@matchmaker/typings/context';

import { getInstance } from '@matchmaker/context/getInstance';

export abstract class BaseContextable implements IContextable {
  private _context: IContext;

  constructor(contextable: IContextable) {
    this._context = contextable.getContext();
  }

  getContext(): IContext {
    return this._context;
  }

  getInstance<T extends IContextable>(this: IContextable, source: ContextableConstructor<T>): T {
    return getInstance(this.getContext(), source);
  }
}
