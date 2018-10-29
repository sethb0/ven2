import { BaseAuditor } from './base';
import { RakshaCoster as BaseRakshaCoster, RakshaParser, rakshaCategorizeCharms }
  from '../audit/raksha';

export default class RakshaAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new RakshaParser(character);
    super(character, new RakshaCoster(parser), parser, options);
  }

  categorizeCharms () {
    super.categorizeCharms();
    rakshaCategorizeCharms();
  }
}

class RakshaCoster extends BaseRakshaCoster {
  getAbilityDotCost (name, i, favored) {
    return i ? (favored ? 2 : 3) * i : 3;
  }
}
