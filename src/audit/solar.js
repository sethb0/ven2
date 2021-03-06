import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class SolarAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new SolarParser(character);
    super(character, new SolarCoster(parser), parser, options);
  }
}

export class SolarParser extends BaseParser {
  get nativeSplat () {
    return 'Solar';
  }
}

export class SolarCoster extends BaseCoster {}
