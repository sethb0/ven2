import { BaseAuditor } from './base';

export default class InfernalAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Infernal';
  }

  get lotusRootCharmName () {
    return 'Roots of the Brass Lotus';
  }

  get isAkuma () {
    return false;
  }

  get favoredSpellCost () {
    return 9;
  }

  get unfavoredSpellCost () {
    return 9;
  }
}
