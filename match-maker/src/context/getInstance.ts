import { IContext, IContextable, ContextableConstructor } from '@matchmaker/typings/context';

interface IContextInstanceMap<T> extends IContext {
  _instanceMap: { [constructor: string]: T };
}

export function getInstance<T extends IContextable>(context: IContext, source: ContextableConstructor<T>): T {
  const instanceMapContext: IContextInstanceMap<T> = context as IContextInstanceMap<T>;
  instanceMapContext._instanceMap = instanceMapContext._instanceMap || {};

  if (!instanceMapContext._instanceMap[source as any]) {
    instanceMapContext._instanceMap[source as any] = new source(context);
  }
  return instanceMapContext._instanceMap[source as any] as T;
}
