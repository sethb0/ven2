import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class JadebornAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new JadebornParser(character);
    super(character, new JadebornCoster(parser), parser, options);
  }
}

export class JadebornParser extends BaseParser {
  favors (thing) {
    if (thing === this.character.caste || (thing === 'Enlightened' && this.isEnlightened)) {
      return true;
    }
    return super.favors(thing);
  }

  get isEnlightened () {
    return this.character.caste === 'Artisan' || this.character.variant === 'Enlightened';
  }

  get nativeSplat () {
    return 'Jadeborn';
  }
}

export class JadebornCoster extends BaseCoster {
  getAbilityDotCost (name, i, favored) {
    if (name.startsWith('Craft')) {
      return i ? i : 2;
    }
    return super.getAbilityDotCost(name, i, favored);
  }

  getSpecialtyDotCost (name) {
    return name.startsWith('Craft') ? 2 : super.getSpecialtyDotCost(name);
  }

  get favoredCharmCost () {
    return 10;
  }

  get unfavoredCharmCost () {
    return 12;
  }

  get favoredTerrestrialMACharmCost () {
    return this.unfavoredTerrestrialMACharmCost;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.getKnowsLotusRoot() ? 6 : 12;
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

  get favoredDegreeCost () {
    return this.unfavoredDegreeCost;
  }

  get unfavoredDegreeCost () {
    return this.parser.isEnlightened ? 6 : 12;
  }

  get essenceCostMultiplier () {
    return 10;
  }

  get favoredSpellCost () {
    return this.unfavoredSpellCost;
  }

  get unfavoredSpellCost () {
    return 12;
  }
}
