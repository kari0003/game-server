import * as _ from 'lodash';

import { IPlayer } from '@matchmaker/player/player';
import { BaseService } from '@matchmaker/service/baseService';

export class PlayerService extends BaseService {

  getTrait(player: IPlayer, key: string) {
    const defaultValue = 0;
    return _.get(player.traits, key, defaultValue);
  }
}
