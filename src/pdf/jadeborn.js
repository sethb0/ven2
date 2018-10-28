import { NoCasteAbilitiesGenerator } from './base';

export default class JadebornGenerator extends NoCasteAbilitiesGenerator {
  get subtitle () {
    let subtitle = `${this.character.splat} ${this.character.caste}`;
    if (this.character.variant) {
      subtitle = `${this.character.variant} ${subtitle}`;
    }
    return subtitle;
  }
}
