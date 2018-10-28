import { Generator } from './base';

export default class InfernalGenerator extends Generator {
  get isAkuma () {
    return false;
  }

  get formattedVirtueFlaw () {
    return [{ text: [{ text: 'Virtue Flaw:', bold: true }, ' Infernal Torment'] }];
  }
}
