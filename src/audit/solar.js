import { BaseAuditor } from './base';

export default class SolarAuditor extends BaseAuditor {
  get nativeSplat () {
    return 'Solar';
  }

  get lotusRootCharmName () {
    return 'Swallowing the Lotus Root';
  }
}
