import * as _ from 'lodash';
import * as moment from 'moment';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { redisClient } from '@matchmaker/database';

export interface ITeam {
  id: string;
  entries: QueueEntry[];
}

export interface IGame {
  id: string;
  createdAt: number;
  entryIds: string[];
  teams: ITeam[];
  individualTraits: any[];
}

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

export async function createGame (teamCount: number) {
    const newId = <string> await redisClient.getUniqueKey();
    const game = new Game(newId);
    game.teams = _.times(teamCount, (index) => {
      const team = new Team();
      team.id = index.toString();
      return team;
    });
    return game;
}

