import { BaseAuditor, BaseParser, BaseCoster } from './base';

export default class SiderealAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new SiderealParser(character);
    super(character, new SiderealCoster(parser), parser, options);
  }
}

export class SiderealParser extends BaseParser {
  get nativeSplat () {
    return 'Sidereal';
  }
}

export class SiderealCoster extends BaseCoster {
  get favoredCharmCost () {
    return 9;
  }

  get unfavoredCharmCost () {
    return 11;
  }

  get favoredCelestialMACharmCost () {
    return 8;
  }

  get unfavoredCelestialMACharmCost () {
    return 10;
  }

  get favoredSiderealMACharmCost () {
    return 10;
  }

  get unfavoredSiderealMACharmCost () {
    return 12;
  }

  get essenceCostMultiplier () {
    return 9;
  }

  get favoredSpellCost () {
    return 9;
  }

  get unfavoredSpellCost () {
    return 11;
  }
}
