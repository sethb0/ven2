import { BaseAuditor } from './base';
import { SiderealCoster, SiderealParser } from '../audit/sidereal';

export default class SiderealAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new SiderealParser(character);
    super(character, new SiderealCoster(parser), parser, options);
  }
}
