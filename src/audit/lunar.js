import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class LunarAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new LunarParser(character);
    super(character, new LunarCoster(parser), parser, options);
  }
}

export class LunarParser extends BaseParser {
  get favorsSpells () {
    return this.favors('Intelligence');
  }

  get knowsShiftingWyldTides () {
    if (this.character.charms) {
      for (const x of Object.values(this.character.charms)) {
        for (const y of Object.values(x)) {
          for (const z of Object.values(y)) {
            if (z.id === 'Lunar.ShiftingWyldTides' || z.name === 'Shifting Wyld Tides') {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  get nativeSplat () {
    return 'Lunar';
  }
}

export class LunarCoster extends BaseCoster {
  get favoredCharmCost () {
    return 10;
  }

  get unfavoredCharmCost () {
    return 12;
  }

  get favoredCelestialMACharmCost () {
    return this.parser.isAkuma ? 10 : 12;
  }

  get unfavoredCelestialMACharmCost () {
    return 12;
  }

  get rakshaCharmCost () {
    return this.parser.knowsShiftingWyldTides ? this.favoredCharmCost : super.rakshaCharmCost;
  }

  get essenceCostMultiplier () {
    return 9;
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
}
