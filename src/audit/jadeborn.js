import { BaseAuditor } from './base';

export default class JadebornAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Jadeborn';
  }

  get isEnlightened () {
    return this.character.caste === 'Artisan' || this.character.variant === 'Enlightened';
  }

  get lotusRootCharmName () {
    return 'Roots of the Brass Lotus';
  }

  get essenceCostMultiplier () {
    return 10;
  }

  get favoredCharmCost () {
    return 10;
  }

  get unfavoredCharmCost () {
    return 12;
  }

  get favoredSpellCost () {
    return this.unfavoredSpellCost;
  }

  get unfavoredSpellCost () {
    return 12;
  }

  get favoredDegreeCost () {
    return this.unfavoredDegreeCost;
  }

  get unfavoredDegreeCost () {
    return this.isEnlightened ? 6 : 12;
  }

  get favoredTerrestrialMACharmCost () {
    return this.unfavoredTerrestrialMACharmCost;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.knowsLotusRoot ? 6 : 12;
  }

  get favoredCelestialMACharmCost () {
    throw new Error('unable to compute Celestial MA cost for Jadeborn');
  }

  get unfavoredCelestialMACharmCost () {
    throw new Error('unable to compute Celestial MA cost for Jadeborn');
  }

  get favoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for Jadeborn');
  }

  get unfavoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for Jadeborn');
  }

  favors (thing) {
    if (thing === this.character.caste || (thing === 'Enlightened' && this.isEnlightened)) {
      return true;
    }
    return super.favors(thing);
  }

  getAbilityDotCost (name, i, favored) {
    if (name.startsWith('Craft')) {
      return i ? i : 2;
    }
    return super.getAbilityDotCost(name, i, favored);
  }

  getSpecialtyDotCost (name) {
    return name.startsWith('Craft') ? 2 : super.getSpecialtyDotCost(name);
  }
}
