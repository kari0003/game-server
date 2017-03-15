import { BaseService } from '@matchmaker/service/baseService';
import { Trait } from '@matchmaker/traits/trait';

export abstract class QueueEntry {
  count: number;
  traits: any; // summarized traits of the entry
  individualTraits: any[];

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
