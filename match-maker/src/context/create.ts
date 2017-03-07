
import { getInstance } from '@matchmaker/context/getInstance';
// import { config } from '@matchMaker/config';

import { IContext, IContextable } from '@matchmaker/typings/context';

class Context implements IContext {
  readonly origin?: TUserType;
  readonly userId?: string;
  readonly userType?: TUserType;

  constructor(data: {
    origin?: TUserType;
    userId?: string;
    userType?: TUserType;
  }) {
    this.origin = data.origin;
    this.userId = data.userId;
    this.userType = data.userType;
  }

  // test context, bypass permissions, for testing only
  private _test: boolean = false;
  get test(): boolean {
    return config.test.testContextEnabled ? this._test : false;
  }

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
  origin?: TUserType;
  userId?: string;
  userType?: TUserType;
} = {}): IContext {
  const context = new Context(data);

  return context;
}
