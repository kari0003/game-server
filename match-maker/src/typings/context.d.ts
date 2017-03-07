export interface IContext extends IContextable {
  clientId?: string;
  queueId?: string;
  config?;

  // test context, bypass permissions, for testing only
  test: boolean;
}

export interface IContextable {
  getContext(): IContext;
  getInstance<T extends IContextable>(this: IContextable, source: ContextableConstructor<T>): T;
}

export interface IContextableConstructor<T> {
  new(contextable: IContextable): T;
}

export type ContextableConstructor<T> = { new(contextable: IContextable): T };
