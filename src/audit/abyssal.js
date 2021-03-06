import { BaseAuditor, BaseCoster, BaseParser } from './base';

export default class AbyssalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new AbyssalParser(character);
    super(character, new AbyssalCoster(parser), parser, options);
  }
}

export class AbyssalParser extends BaseParser {
  get nativeSplat () {
    return 'Abyssal';
  }
}

export class AbyssalCoster extends BaseCoster {}
