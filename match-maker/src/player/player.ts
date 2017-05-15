import * as _ from 'lodash';
import { QueueEntry } from '@matchmaker/queue/queueEntry';

export interface IPlayer {
  id: string;
  name?: string;
  traits: object;
}

export interface IGroup {
  id: string;
  players: IPlayer[];
  count: number;
}

export class Group implements IGroup {
  public id: string;
  public players: IPlayer[];
  public count: number;
}

export class PlayerEntry extends QueueEntry {
  public player: IPlayer;
  count = 1;

  constructor(player: IPlayer) {
    super(player.id);
    this.player = player;
    this.traits = player.traits;
    this.individualTraits = [this.traits];
  }
}

export class GroupEntry extends QueueEntry {
  public players: IPlayer[];

  constructor(members: IPlayer[]) {
    super();
    this.players = members;
    this.count = members.length;
    this.traits = this.getTraitsResultant(); // TODO get trait resultant
    this.individualTraits = [this.traits];
  }

  getTraitsResultant() {
    const traits: any = {};
    _.forEach(_.keys(this.players[0].traits), (traitKey) => {
      //TODO Traits.getType(traitKey);
      let resultant = 0;
      _.forEach(this.players, (player) => {
        resultant += player.traits[traitKey];
      });
      traits[traitKey] = resultant;
    });
  }
}
