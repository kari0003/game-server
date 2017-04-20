
import { getInstance } from '@matchmaker/context/getInstance';
// import { config } from '@matchMaker/config';

import { IContext, IContextable } from '@matchmaker/typings/context';

class Context implements IContext {
  readonly userId?: string;

  constructor(data: {
    userId?: string;
  }) {
    this.userId = data.userId;
  }

  // test context, bypass permissions, for testing only
  private _test: boolean = false;
  // get test(): boolean {
  //   return config.test.testContextEnabled ? this._test : false;
  // }

  set test(val: boolean) {
    this._test = val;
  }

  getContext() {
    return this;
  }

  getInstance<T extends IContextable>(this: IContextable, source: { new(IContextable): T }): T {
    return getInstance(this.getContext(), source);
  }
}

export function createContext(data: {
  userId?: string;
} = {}): IContext {
  const context = new Context(data);

  return context;
}
