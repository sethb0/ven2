import { NoCasteAbilitiesGenerator } from './base';

export default class LunarGenerator extends NoCasteAbilitiesGenerator {
  get additionalFormattedHeaderInfo () {
    return [...this.formattedTotem, ...this.formattedTell];
  }

  get formattedTell () {
    return LunarGenerator.formatHeaderLine('Tell', this.character.tell);
  }

  get formattedTotem () {
    return LunarGenerator.formatHeaderLine('Totem', this.character.totem);
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
