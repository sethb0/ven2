/* eslint no-invalid-this: off, babel/no-invalid-this: off */
import { BaseAuditor, BaseCoster, BaseParser, discountedXP } from './base';

export default class RakshaAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new RakshaParser(character);
    super(character, new RakshaCoster(parser), parser, options);
  }

  abilities () {
    let total = 0;
    if (this.character.abilities) {
      for (const v of Object.values(this.character.abilities)) {
        total += discountedXP(v, 3, 3);
        // caste/favored should always have at least creation: 1
        // so the fact that base should not be discounted does not matter
      }
    }
    return total;
  }

  categorizeCharms () {
    super.categorizeCharms();
    this::rakshaCategorizeCharms();
  }
}

export function rakshaCategorizeCharms () {
  this._charms.Raksha = this._charms.FavoredNative.concat(this._charms.UnfavoredNative);
  this._charms.FavoredNative = [];
  this._charms.UnfavoredNative = [];
}

export class RakshaParser extends BaseParser {
  get knowsLotusRoot () {
    return false;
  }

  get nativeSplat () {
    return 'Raksha';
  }

  get noble () {
    return !['Diplomat', 'Entertainer', 'Guide', 'Warrior', 'Worker']
      .includes(this.character.caste);
  }
}

export class RakshaCoster extends BaseCoster {
  get rakshaCharmCost () {
    return 6;
  }

  get favoredTerrestrialMACharmCost () {
    return 10;
  }

  get unfavoredTerrestrialMACharmCost () {
    return 12;
  }

  get favoredCelestialMACharmCost () {
    return 12;
  }

  get unfavoredCelestialMACharmCost () {
    return 15;
  }

  get favoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for raksha');
  }

  get unfavoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for raksha');
  }

  get favoredDegreeCost () {
    return 8;
  }

  get unfavoredDegreeCost () {
    return 10;
  }

  get essenceCostMultiplier () {
    return 10;
  }

  get specialtyCost () {
    return this.parser.noble ? 5 : 2;
  }
}
