import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class AlchemicalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new AlchemicalParser(character);
    super(character, new AlchemicalCoster(parser), parser, options);
  }
}

export class AlchemicalParser extends BaseParser {
  get knowsLotusRoot () {
    // Perfected Lotus Matrix can't be installed in an array.
    if (this.character.installed?.charms) {
      for (const x of this.character.installed?.charms) {
        if (x.submodules?.includes('Lotus Filament Conduction')) {
          return true;
        }
      }
    }
    return false;
  }

  get nativeSplat () {
    return 'Alchemical';
  }
}

export class AlchemicalCoster extends BaseCoster {
  get alchemicalCharmCost () {
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

  get essenceCostMultiplier () {
    return 9;
  }

  get dedicatedSlotCost () {
    return 4;
  }

  get generalSlotCost () {
    return 6;
  }
}
