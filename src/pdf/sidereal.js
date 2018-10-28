import { Generator } from './base';

import { casteSobriquets } from '@ven2/data';
const CASTE_SOBRIQUETS = casteSobriquets();

export default class SiderealGenerator extends Generator {
  get subtitle () {
    return `Chosen of the Maiden of ${this.character.caste}`;
  }

  get formattedAbilities () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatAbilities([
            ['Resistance', 'Ride', 'Sail', 'Survival', 'Thrown'],
            ['Investigation', 'Larceny', 'Lore', 'Occult', 'Stealth'],
          ]),
          this.formatAbilities([
            ['Craft', 'Dodge', 'Linguistics', 'Performance', 'Socialize'],
          ]),
          this.formatAbilities([
            ['Archery', 'Athletics', 'Melee', 'Presence', 'War'],
            ['Awareness', 'Bureaucracy', 'Integrity', 'Martial Arts', 'Medicine'],
          ]),
        ],
      },
    ];
  }

  get formattedVirtueFlaw () {
    return [{
      text: [
        { text: 'Virtue Flaw:', bold: true },
        Object.values(this.character.virtues).some((x) => x.primary)
          ? ` ${CASTE_SOBRIQUETS[this.character.caste]}’ Flawed Fate`
          : ' none',
      ],
    }];
  }
}
