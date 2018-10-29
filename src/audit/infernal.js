import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class InfernalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new InfernalParser(character);
    super(character, new InfernalCoster(parser), parser, options);
  }
}

export class InfernalParser extends BaseParser {
  get isAkuma () {
    return false;
  }

  get nativeSplat () {
    return 'Infernal';
  }
}

export class InfernalCoster extends BaseCoster {
  get favoredSpellCost () {
    return 9;
  }

  get unfavoredSpellCost () {
    return 9;
  }
}
