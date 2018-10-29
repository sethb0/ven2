import { BaseAuditor } from './base';
import { AlchemicalCoster, AlchemicalParser } from '../audit/alchemical';

export default class AlchemicalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new AlchemicalParser(character);
    super(character, new AlchemicalCoster(parser), parser, options);
  }
}
