import * as _ from 'lodash';

import { Player } from '@matchmaker/player/player';
import { BaseService } from '@matchmaker/service/baseService';

export class PlayerService extends BaseService {

  getTrait(player: Player, key: string) {
    const defaultValue = 0;
    return _.get(player.traits, key, defaultValue);
  }
}
