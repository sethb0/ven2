import { BaseAuditor } from './base';
import { JadebornCoster, JadebornParser } from '../audit/jadeborn';

export default class JadebornAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new JadebornParser(character);
    super(character, new JadebornCoster(parser), parser, options);
  }
}
