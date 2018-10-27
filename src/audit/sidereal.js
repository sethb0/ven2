import { BaseAuditor } from './base';

export default class SiderealAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Sidereal';
  }

  get lotusRootCharmName () {
    return 'Perfected Lotus Mastery';
  }

  get essenceCostMultiplier () {
    return 9;
  }

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

  get favoredSpellCost () {
    return 9;
  }

  get unfavoredSpellCost () {
    return 11;
  }
}
