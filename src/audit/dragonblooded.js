import { BaseAuditor } from './base';

export default class DragonBloodedAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Dragon-Blooded';
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

  get favoredTerrestrialMACharmCost () {
    return this.knowsLotusRoot ? 5 : 10;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.knowsLotusRoot ? 6 : 12;
  }

  get favoredCelestialMACharmCost () {
    return this.isAkuma ? 10 : 12;
  }

  get unfavoredCelestialMACharmCost () {
    return this.isAkuma ? 12 : 15;
  }

  get favoredSpellCost () {
    return 10;
  }

  get unfavoredSpellCost () {
    return 12;
  }
}
