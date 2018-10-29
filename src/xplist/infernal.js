import { BaseAuditor } from './base';
import { InfernalCoster, InfernalParser } from '../audit/infernal';

export default class InfernalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new InfernalParser(character);
    super(character, new InfernalCoster(parser), parser, options);
  }
}
