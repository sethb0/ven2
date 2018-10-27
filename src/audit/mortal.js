import { BaseAuditor } from './base';

export default class MortalAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Mortal';
  }

  get essenceCostMultiplier () {
    return 20;
  }

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

  get favoredSpellCost () {
    return 12;
  }

  get unfavoredSpellCost () {
    return 15;
  }

  get favoredDegreeCost () {
    return 8;
  }

  get unfavoredDegreeCost () {
    return 10;
  }
}
