import * as _ from 'lodash';

import { BaseService } from '@matchmaker/service/baseService';
import { IMatcherConfig } from '@matchmaker/queue/queueConfig';
import { QueueEntry } from '@matchmaker/queue/queueEntry';
import { Game, Team } from '@matchmaker/game/game';

export class BaseMatcherService extends BaseService {
  compareEntries(matcher: IMatcherConfig, entry1: QueueEntry, entry2: QueueEntry) {
    let compatible = true;
    let distance = 0;
    if (matcher.isCompabilityMatcher) {
      compatible = this.checkCompability(matcher, entry1, entry2);
    }
    if (matcher.isDistanceMatcher) {
      const distance = this.calculateDistance(matcher, entry1, entry2);
    }
    return compatible ? 0 : -1;
  }

  checkCompability(matcher: IMatcherConfig, entry1: QueueEntry, entry2: QueueEntry) {
    if (!matcher.compabilityTraits) {
      return true;
    }
    let compatible = true;
    // TODO compability levels - game - team
    _.forEach(matcher.compabilityTraits.synergy, (trait) => {
      if (entry1.getTrait(trait) !== entry2.getTrait(trait)) {
        compatible = false;
      }
    });
    _.forEach(matcher.compabilityTraits.discord, (trait) => {
      if (entry1.getTrait(trait) === entry2.getTrait(trait)) {
        compatible = false;
      }
    });
    _.forEach(matcher.compabilityTraits.distance, (traitConf) => {
      const dist = Math.abs(entry1.getTrait(traitConf.trait) - entry2.getTrait(traitConf.trait))
      if (dist > traitConf.maxDistance) {
        compatible = false;
      }
    });
    return compatible;
  }

  calculateDistance(matcher: IMatcherConfig, entry1: QueueEntry, entry2: QueueEntry) {
    if (!matcher.distanceTraits) {
      return 0;
    }
    const distanceArray = _.map(matcher.distanceTraits!, (distanceTrait) => {
      const dist = Math.abs(entry1.getTrait(distanceTrait.trait) - entry2.getTrait(distanceTrait.trait));
      const weighted = dist * distanceTrait.weight;
      return weighted;
    });
    const normalized = _.sum(distanceArray) / (matcher.maxDistancePlayers || 1);
    return normalized;
  }

  checkTeamCompability(matcher: IMatcherConfig , entry: QueueEntry, team: Team) {
    // Find at least one incompatible entry:
    const incompatibleId = _.findIndex(team.entries, (member) => !this.checkCompability(matcher, entry, member));
    // If index not found (-1) its compatible
    return incompatibleId < 0;
  }

  calculateTeamMaxDistance(matcher: IMatcherConfig , entry: QueueEntry, team: Team) {
    // Get the max from calculated distances:
    const distances = _.map(team.entries, (member) => this.calculateDistance(matcher, entry, member));
    return _.max(distances);
  }

  calculateTeamAvgDistance(matcher: IMatcherConfig , entry: QueueEntry, team: Team) {
    // Calculate distance from each member individually
    const distances = _.map(team.entries, (member) => this.calculateDistance(matcher, entry, member));
    // Return average
    return _.sum(distances)/distances.length;
  }

  checkGameCompability(matcher: IMatcherConfig , game: Game, entry: QueueEntry, teamId: number) {
    const compatible = _.map(game.teams, (team) => {
      _.findIndex(team.entries, (member) => this.checkCompability(matcher, entry, member));
    });
  }
}
