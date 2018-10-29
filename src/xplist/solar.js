import { BaseAuditor } from './base';
import { SolarCoster, SolarParser } from '../audit/solar';

export default class SolarAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new SolarParser(character);
    super(character, new SolarCoster(parser), parser, options);
  }
}
