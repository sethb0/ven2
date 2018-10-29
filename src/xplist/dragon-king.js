import { BaseAuditor } from './base';
import { DragonKingCoster, DragonKingParser } from '../audit/dragon-king';

export default class DragonKingAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new DragonKingParser(character);
    super(character, new DragonKingCoster(parser), parser, options);
  }
}
