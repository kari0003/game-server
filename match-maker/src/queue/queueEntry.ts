import * as moment from 'moment';

import { BaseService } from '@matchmaker/service/baseService';
import { Trait } from '@matchmaker/traits/trait';

export type TQueueEntryStatus = 'search' | 'frozen' | 'drafted';
export const queueEntryStatuses = {
  SEARCHING: 'search' as TQueueEntryStatus,
  FROZEN: 'frozen' as TQueueEntryStatus,
  DRAFTED: 'drafted' as TQueueEntryStatus,
}

export abstract class QueueEntry {
  id: string;
  enteredAt: number; // Timestamp
  count: number;
  traits: any; // summarized traits of the entry
  individualTraits: any[];
  status: TQueueEntryStatus;

  constructor(id?: string) {
    if (id) {
      this.id = id;
    }
    this.enteredAt = moment().unix();
    this.status = queueEntryStatuses.SEARCHING;
  }

  getTrait(trait: Trait) {
    return this.traits[trait.key];
    // TODO default value?
  }

}


export class QueueEntryService extends BaseService {
  getTraitDifference(queueEntry1: QueueEntry, queueEntry2: QueueEntry, trait: Trait) {
    const trait1 = queueEntry1.traits[trait.key];
    const trait2 = queueEntry2.traits[trait.key];
    switch (trait.type) {
      case 'number':
        return Math.abs(trait1 - trait2);
      case 'boolean':
        // Logical XOR
        return trait1 ? !trait2 : trait2;
      case 'enum':
        return trait1 !== trait2;
      default:
        throw new Error('Trait type could not be matched');
    }
  }
}
