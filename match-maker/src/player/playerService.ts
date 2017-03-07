import { Player } from '@matchmaker/player/player';
import { BaseService } from '@matchmaker/service/baseService';

export class PlayerService extends BaseService {

  getQuality(player: Player, key: string) {
    const defaultValue = 0;
    return _.get(player.qualities, key, defaultValue);
  }
}
