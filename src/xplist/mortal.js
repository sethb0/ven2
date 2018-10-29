import { BaseAuditor } from './base';
import { MortalCoster, MortalParser } from '../audit/mortal';

export default class MortalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new MortalParser(character);
    super(character, new MortalCoster(parser), parser, options);
  }
}
