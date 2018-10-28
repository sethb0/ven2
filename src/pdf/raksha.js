import { Generator } from './base';

export default class RakshaGenerator extends Generator {
  get subtitle () {
    const caste = this.character.caste;
    const variant = this.character.variant ? `${this.character.variant} ` : '';
    if (caste.includes('Raksha')) {
      return `${variant}${caste}${this.akumaSubtitle}`;
    }
    return `${variant}Raksha ${caste}${this.akumaSubtitle}`;
  }

  get formattedAbilities () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatAbilities([
            ['Athletics', 'Awareness', 'Dodge', 'Sail', 'Survival'],
            ['Investigation', 'Larceny', 'Medicine', 'Performance', 'Stealth'],
          ]),
          this.formatAbilities([
            ['Linguistics', 'Occult', 'Ride', 'Socialize', 'Thrown'],
            ['Archery', 'Martial Arts', 'Melee', 'Presence', 'War'],
          ]),
          this.formatAbilities([
            ['Bureaucracy', 'Craft', 'Integrity', 'Lore', 'Resistance'],
          ]),
        ],
      },
    ];
  }

  get formattedVirtueFlaw () {
    return [{ text: [{ text: 'Lure:', bold: true }, ` ${this.character.lure || 'none'}`] }];
  }

  formatTraitName (name, data) {
    const out = {
      text: name,
      italics: this.character.favors(name)
        || data?.caste || data?.favored || data?.major || data?.primary,
    };
    if (data?.favored) {
      out.decoration = 'underline';
    }
    return out;
  }

  // can't just inherit from NoFavoredCharmsGenerator because that inherits from
  // NoFavoredAbilitiesGenerator; this is one case where mixins or multiple inheritance would
  // be handy
  formatCharmSplat (groups) {
    const out = super.formatCharmSplat(groups);
    for (const para of out) {
      if (typeof para[0] === 'object') {
        para[0].italics = false;
      }
    }
    return out;
  }
}
