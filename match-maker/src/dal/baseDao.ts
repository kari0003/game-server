import { BaseContextable } from '@matchmaker/context/baseContextable';

export abstract class BaseDao<T> extends BaseContextable {

  abstract findById(id: any, options?: any): Promise<T>

  abstract create(parameters: T): Promise<T>

  abstract updateById(id: any, parameters: T): Promise<T>

  abstract deleteById(id: any): Promise<boolean>
}
