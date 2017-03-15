import * as _ from 'lodash';
import { TQueueStatus, queueStatuses } from '@matchmaker/enum/queueStatuses';
import { QueueEntry } from '@matchmaker/queue/queueEntry';

export abstract class BaseQueue {
  abstract onUpdate(): TQueueStatus
  abstract addEntry(queueEntry: QueueEntry)
  abstract removeEntry(queueEntry: QueueEntry)
}


export class EloQueue extends BaseQueue {
  status: TQueueStatus;
  entries: QueueEntry[] = [];
  constructor() {
    super();
    status = queueStatuses.IDLE;
  }
  onUpdate(): TQueueStatus{
    return this.status;
  }
  addEntry(queueEntry: QueueEntry) {
    if (queueEntry && !_.find(this.entries, queueEntry)) {
      this.entries.push(queueEntry);
    }
  }
  removeEntry(queueEntry: QueueEntry) {
    if (queueEntry) {
      return _.pull(this.entries, queueEntry);
    }
    return null;
  }
}
