import { Generator } from './base';

export default class AbyssalGenerator extends Generator {
  get formattedVirtueFlaw () {
    return [{ text: [{ text: 'Virtue Flaw:', bold: true }, ' Abyssal Resonance'] }];
  }
}
