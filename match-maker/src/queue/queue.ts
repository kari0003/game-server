import * as _ from 'lodash';
import * as Boom from 'boom';

import { TQueueStatus, queueStatuses } from '@matchmaker/enum/queueStatuses';
import { QueueEntry, queueEntryStatuses } from '@matchmaker/queue/queueEntry';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { defaultConfig } from '@matchmaker/queue/queueConfig';
import { Game } from '@matchmaker/game/game';
import { PlayerEntry, GroupEntry } from '@matchmaker/player/player';

export class DefaultQueue extends BaseQueue {
  status: TQueueStatus;
  pendingMatches: Game[] = [];
  entries: QueueEntry[] = [];
  constructor() {
    super(defaultConfig);
    this.status = queueStatuses.IDLE;
  }

  async onMatchFound(match: Game) {
    match.onDraft();
    this.pendingMatches.push(match);
    _.forEach(this.entries, (entry) => {
      if (_.includes(match.entryIds, entry.id)) {
        entry.status = queueEntryStatuses.DRAFTED;
      }
    });
  }
  async onMatchStarted(matchId: string) {
    const match = _.find(this.pendingMatches, match => match.id===matchId);

    if (!match) {
      throw Boom.notFound('match not found');
    }
    // Removing entries in which players participated in.
    _.remove(this.entries, (entry) => _.includes(match.entryIds, entry.id));
    _.remove(this.pendingMatches, match);
  }
  async onMatchFailed(matchId: string) {
    const match = _.find(this.pendingMatches, match => match.id===matchId);

    if (!match) {
      throw Boom.notFound('match not found');
    }

    // Re-enabling entries in which players participated in.
    _.forEach(this.entries, (entry) => {
      if (_.includes(match.entryIds, entry.id)) {
        entry.status = queueEntryStatuses.SEARCHING;
      }
    });
    _.remove(this.pendingMatches, match);
  }
  async onPeriodUpdate() {
    // TODO Matching stuff
  }
  async onAddEntry(queueEntry: QueueEntry) {
    if (queueEntry && !_.find(this.entries, queueEntry)) {
      this.entries.push(queueEntry);
    }
  }
  async onRemoveEntry(queueEntry: QueueEntry) {
    if (queueEntry) {
      return _.pull(this.entries, queueEntry);
    }
    return null;
  }
}
