import { NoFavoredCharmsGenerator, rephraseYozi } from './base';

export default class MortalGenerator extends NoFavoredCharmsGenerator {
  get subtitle () {
    if (this.character.variant?.toLowerCase() === 'heroic') {
      return 'Heroic Mortal';
    }
    return 'Mortal';
  }

  get akumaSubtitle () {
    return this.isAkuma ? ` Akuma of ${rephraseYozi(this.character.patronYozi)}` : '';
  }
}
