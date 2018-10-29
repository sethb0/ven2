import { BaseAuditor } from './base';
import { DragonBloodedCoster, DragonBloodedParser } from '../audit/dragon-blooded';

export default class DragonBloodedAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new DragonBloodedParser(character);
    super(character, new DragonBloodedCoster(parser), parser, options);
  }
}
