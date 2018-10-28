import { NoFavoredCharmsGenerator } from './base';

export default class AlchemicalGenerator extends NoFavoredCharmsGenerator {
  get nameInlines () {
    return [{ text: this.character.name, italics: true }];
  }

  get formattedVirtueFlaw () {
    return [];
  }

  get alchemicalCharmsFirst () {
    return true;
  }
}
