import * as _ from 'lodash';
import * as moment from 'moment';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { redisClient } from '@matchmaker/database';

export class Game {
  public id: string;
  createdAt: number;
  entryIds: string[] = [];
  teams: Team[] = [];
  individualTraits: any[];
  constructor(id?: string) {
    this.createdAt = moment().unix();
    if (id) {
      this.id = id;
    }
  }

  onDraft() {
    _.forEach(this.teams, (team) => {
      _.forEach(team.entries, (entry) => {
        this.entryIds.push(entry.id);
      });
    });
  }
}

export class Team {
  public id: string;
  entries: QueueEntry[] = [];
}

