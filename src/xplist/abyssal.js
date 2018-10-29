import { BaseAuditor } from './base';
import { AbyssalCoster, AbyssalParser } from '../audit/abyssal';

export default class AbyssalAuditor extends BaseAuditor {
  constructor (character, options) {
    const parser = new AbyssalParser(character);
    super(character, new AbyssalCoster(parser), parser, options);
  }
}
