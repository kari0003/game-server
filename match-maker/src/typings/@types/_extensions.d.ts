import { IContextable } from '@matchmaker/typings';

declare global {
// Express module extension for moshy
  namespace Express {
    interface Request extends IContextable {
      userId?: string;
    }

    interface Response {
      finalize(data: any, options?: { count?: number, status?: number}): void;
      created(data: any): void;
      noContent(): void;
    }
  }
}
