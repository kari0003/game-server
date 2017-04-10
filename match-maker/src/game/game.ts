import * as _ from 'lodash';
import { Player } from '@matchmaker/player/player';

export class Game {
  public id: string;
  teams: Team[];
  individualTraits: any[];
}

export class Team {
  public id: string;
  players: Player[];
}

