import { Generator } from './base';

export default class SolarGenerator extends Generator {
  get formattedVirtueFlaw () {
    return [{
      text: [
        { text: 'Virtue Flaw:', bold: true },
        ` ${this.character['virtue flaw']?.name || 'none'}`,
      ],
    }];
  }
}
