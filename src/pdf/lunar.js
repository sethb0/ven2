import { NoCasteAbilitiesGenerator } from './base';

export default class LunarGenerator extends NoCasteAbilitiesGenerator {
  get additionalFormattedHeaderInfo () {
    return [...this.formattedSpiritAnimal, ...this.formattedTell];
  }

  get formattedSpiritAnimal () {
    return LunarGenerator.formatHeaderLine('Spirit Animal', this.character['spirit animal']);
  }

  get formattedTell () {
    return LunarGenerator.formatHeaderLine('Tell', this.character.tell);
  }

  get formattedVirtueFlaw () {
    return [{
      text: [
        { text: 'Virtue Flaw:', bold: true },
        ` ${this.character.virtueFlaw?.name || 'none'}`,
      ],
    }];
  }
}
