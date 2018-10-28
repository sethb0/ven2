import { NoFavoredCharmsGenerator } from './base';

export default class DragonKingGenerator extends NoFavoredCharmsGenerator {
  get subtitle () {
    return `${this.character.caste} Dragon King`;
  }
}
