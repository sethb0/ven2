import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class MortalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new MortalParser(character);
    super(character, new MortalCoster(parser), parser, options);
  }
}

export class MortalParser extends BaseParser {
  get nativeSplat () {
    return 'Mortal';
  }
}

export class MortalCoster extends BaseCoster {
  get favoredCharmCost () {
    return 15;
  }

  get unfavoredCharmCost () {
    return 15;
  }

  get favoredTerrestrialMACharmCost () {
    return 12;
  }

  get unfavoredTerrestrialMACharmCost () {
    return 15;
  }

  get favoredCelestialMACharmCost () {
    throw new Error('unable to compute Celestial MA cost for mortal');
  }

  get unfavoredCelestialMACharmCost () {
    throw new Error('unable to compute Celestial MA cost for mortal');
  }

  get favoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for mortal');
  }

  get unfavoredSiderealMACharmCost () {
    throw new Error('unable to compute Sidereal MA cost for mortal');
  }

  get favoredDegreeCost () {
    return 8;
  }

  get unfavoredDegreeCost () {
    return 10;
  }

  get essenceCostMultiplier () {
    return 20;
  }

  get favoredSpellCost () {
    return 12;
  }

  get unfavoredSpellCost () {
    return 15;
  }
}
