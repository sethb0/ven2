import { NoCasteAbilitiesGenerator } from './base';

export default class LunarGenerator extends NoCasteAbilitiesGenerator {
  get formattedVirtueFlaw () {
    return [{
      text: [
        { text: 'Virtue Flaw:', bold: true },
        ` ${this.character.virtueFlaw?.name || 'none'}`,
      ],
    }];
  }
}
