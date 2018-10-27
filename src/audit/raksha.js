import { BaseAuditor, discountedXP } from './base';

export default class RakshaAuditor extends BaseAuditor {
  categorizeCharms () {
    super.categorizeCharms();
    this._charms.Raksha = this._charms.FavoredNative.concat(this._charms.UnfavoredNative);
    this._charms.FavoredNative = [];
    this._charms.UnfavoredNative = [];
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

  get nativeSplat () {
    return 'Raksha';
  }

  get knowsLotusRoot () {
    return false;
  }

  get isNoble () {
    return !['Diplomat', 'Entertainer', 'Guide', 'Warrior', 'Worker']
      .includes(this.character.caste);
  }

  get essenceCostMultiplier () {
    return 10;
  }

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

  get specialtyCost () {
    return this.isNoble ? 5 : 2;
  }

  get favoredDegreeCost () {
    return 8;
  }

  get unfavoredDegreeCost () {
    return 10;
  }
}
