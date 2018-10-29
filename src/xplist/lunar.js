import { BaseAuditor } from './base';
import { LunarCoster, LunarParser } from '../audit/lunar';

export default class LunarAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new LunarParser(character);
    super(character, new LunarCoster(parser), parser, options);
  }
}
