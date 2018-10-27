import { BaseAuditor } from './base';

export default class LunarAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Lunar';
  }

  get lotusRootCharmName () {
    return 'Terrestrial Bloodline Integration';
  }

  get favorsSpells () {
    return this.favors('Intelligence');
  }

  get essenceCostMultiplier () {
    return 9;
  }

  get favoredCharmCost () {
    return 10;
  }

  get unfavoredCharmCost () {
    return 12;
  }

  get favoredCelestialMACharmCost () {
    return this.isAkuma ? 10 : 12;
  }

  get unfavoredCelestialMACharmCost () {
    return 12;
  }

  get knackCost () {
    return 11;
  }

  get favoredSpellCost () {
    return 10;
  }

  get unfavoredSpellCost () {
    return 12;
  }

  get rakshaCharmCost () {
    if (this.character.charms) {
      for (const x of Object.values(this.character.charms)) {
        for (const y of Object.values(x)) {
          for (const z of Object.values(y)) {
            if (z.name === 'Shifting Wyld Tides') {
              return this.favoredCharmCost;
            }
          }
        }
      }
    }
    return super.rakshaCharmCost;
  }
}
