import { BaseAuditor } from './base';

export default class AlchemicalAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Alchemical';
  }

  get knowsLotusRoot () {
    // Perfected Lotus Matrix can't be installed in an array.
    if (!this.character.installedCharms) {
      return false;
    }
    for (const x of this.character.installedCharms) {
      if (x.name === 'Perfected Lotus Matrix' && x.submodules) {
        for (const y of x.submodules) {
          if (y.name === 'Lotus Filament Conduction') {
            return true;
          }
        }
      }
    }
    return false;
  }

  get essenceCostMultiplier () {
    return 9;
  }

  get alchemicalCharmCost () {
    return 6;
  }

  get dedicatedSlotCost () {
    return 4;
  }

  get generalSlotCost () {
    return 6;
  }

  get favoredCelestialMACharmCost () {
    return 11;
  }

  get unfavoredCelestialMACharmCost () {
    return 11;
  }

  get favoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for Alchemical');
  }

  get unfavoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for Alchemical');
  }
}
