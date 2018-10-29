import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class DragonBloodedAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new DragonBloodedParser(character);
    super(character, new DragonBloodedCoster(parser), parser, options);
  }
}

export class DragonBloodedParser extends BaseParser {
  get nativeSplat () {
    return 'Dragon-Blooded';
  }
}

export class DragonBloodedCoster extends BaseCoster {
  get favoredCharmCost () {
    return 10;
  }

  get unfavoredCharmCost () {
    return 12;
  }

  get favoredTerrestrialMACharmCost () {
    return this.parser.knowsLotusRoot ? 5 : 10;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.parser.knowsLotusRoot ? 6 : 12;
  }

  get favoredCelestialMACharmCost () {
    return this.parser.isAkuma ? 10 : 12;
  }

  get unfavoredCelestialMACharmCost () {
    return this.parser.isAkuma ? 12 : 15;
  }

  get essenceCostMultiplier () {
    return 10;
  }

  get favoredSpellCost () {
    return 10;
  }

  get unfavoredSpellCost () {
    return 12;
  }
}
