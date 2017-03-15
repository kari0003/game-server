import * as _ from 'lodash';
import { QueueEntry } from '@matchmaker/queue/queueEntry';

export class Player extends QueueEntry {
  public id: string;
  public traits: any;
  individualTraits: any[];
}
