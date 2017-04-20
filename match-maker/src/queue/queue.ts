import * as _ from 'lodash';
import { TQueueStatus, queueStatuses } from '@matchmaker/enum/queueStatuses';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { BaseQueue } from '@matchmaker/queue/baseQueue';
import { defaultConfig } from '@matchmaker/queue/queueConfig';
import { Game } from '@matchmaker/game/game';
import { PlayerEntry, GroupEntry } from '@matchmaker/player/player';

export class DefaultQueue extends BaseQueue {
  status: TQueueStatus;
  pendingMatches: Game[];
  entries: QueueEntry[] = [];
  constructor() {
    super(defaultConfig);
    this.status = queueStatuses.IDLE;
  }

  async onMatchFound(match: Game) {
    this.pendingMatches.push(match);
  }
  async onMatchStarted(match: Game) {
    _.pull(this.pendingMatches, match);

    // Removing entries in which players participated in.
    // CONSIDER a better way would be storing the queueEntries in matches.
    _.forEach(match.teams, (team) => {
      _.forEach(team.players, (player) => {
        _.remove(this.entries, (entry) => {
          // We need to cast the entries to either PlayerEntry or GroupEntry.
          if (typeof entry === typeof PlayerEntry) {
            if (_.isEqual((<PlayerEntry>entry).player, player)) {
              return true;
            }
            return false;
          }
          if (typeof entry === typeof GroupEntry) {
            if (_.indexOf((<GroupEntry>entry).players, player)> 0) {
              return true;
            }
            return false;
          }
          return false;
        });
      });
    });
  }
  async onMatchFailed(match: Game) {

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
