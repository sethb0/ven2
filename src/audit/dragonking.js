import DragonBloodedAuditor from './dragonblooded';

export default class DragonKingAuditor extends DragonBloodedAuditor {
  get nativeSplat () {
    return 'Dragon King';
  }

  get essenceCostMultiplier () {
    return 8;
  }

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

  get favoredSpellCost () {
    return this.unfavoredSpellCost;
  }

  get favoredDegreeCost () {
    return this.unfavoredDegreeCost;
  }
}
