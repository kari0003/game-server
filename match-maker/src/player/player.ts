import * as _ from 'lodash';
import { QueueEntry } from '@matchmaker/queue/queueEntry';

export class Player {
  public id: string;
  public traits: any;
}

export class Group {
  public players: Player[];
  public count: number;
}

export class PlayerEntry extends QueueEntry {
  public player: Player;
  count = 1;

  constructor(player: Player) {
    super();
    this.player = player;
    this.traits = player.traits;
    this.individualTraits = [this.traits];
  }
}

export class GroupEntry extends QueueEntry {
  public players: Player[];

  constructor(members: Player[]) {
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
