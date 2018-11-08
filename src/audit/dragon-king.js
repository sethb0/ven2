import { BaseAuditor } from './base';
import { DragonBloodedCoster, DragonBloodedParser } from './dragon-blooded';

export default class DragonKingAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new DragonKingParser(character);
    super(character, new DragonKingCoster(parser), parser, options);
  }
}

export class DragonKingParser extends DragonBloodedParser {
  get nativeSplat () {
    return 'Dragon King';
  }
}

export class DragonKingCoster extends DragonBloodedCoster {
  get favoredCharmCost () {
    return this.unfavoredCharmCost;
  }

  get favoredTerrestrialMACharmCost () {
    return this.unfavoredTerrestrialMACharmCost;
  }

  get favoredCelestialMACharmCost () {
    return this.unfavoredCelestialMACharmCost;
  }

  get favoredSiderealMACharmCost () {
    return this.unfavoredSiderealMACharmCost;
  }

  get favoredDegreeCost () {
    return this.unfavoredDegreeCost;
  }

  get essenceCostMultiplier () {
    return 8;
  }

  get favoredSpellCost () {
    return this.unfavoredSpellCost;
  }
}
