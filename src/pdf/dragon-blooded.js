import { Generator } from './base';

export default class DragonBloodedGenerator extends Generator {
  get subtitle () {
    return `${this.character.caste} Aspect ${this.character.splat}`;
  }

  get formattedAbilities () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatAbilities([
            ['Linguistics', 'Lore', 'Occult', 'Stealth', 'Thrown'],
            ['Bureaucracy', 'Investigation', 'Larceny', 'Martial Arts', 'Sail'],
          ]),
          this.formatAbilities([
            ['Awareness', 'Craft', 'Integrity', 'Resistance', 'War'],
          ]),
          this.formatAbilities([
            ['Athletics', 'Dodge', 'Melee', 'Presence', 'Socialize'],
            ['Archery', 'Medicine', 'Performance', 'Ride', 'Survival'],
          ]),
        ],
      },
    ];
  }

  get formattedVirtueFlaw () {
    const primary = Object.entries(this.character.virtues)
      .filter(([, v]) => v.primary)
      .map(([k]) => k);
    return [{
      text: [
        { text: 'Virtue Flaw:', bold: true },
        primary.length
          ? ` ${primary[0]} of ${this.character.caste}`
          : ' none',
      ],
    }];
  }
}
