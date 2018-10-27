/* eslint no-console: off */
import path from 'path';

import { Character } from '../character';

const AUDITORS = {
  Abyssal: 'abyssal',
  Alchemical: 'alchemical',
  'Dragon-Blooded': 'dragonblooded',
  'Dragon King': 'dragonking',
  // Ghost: 'ghost',
  // 'God-Blooded': 'godblooded',
  Infernal: 'infernal',
  Jadeborn: 'jadeborn',
  Lunar: 'lunar',
  Mortal: 'mortal',
  Raksha: 'raksha',
  Sidereal: 'sidereal',
  Solar: 'solar',
};

export default async function audit (argv) {
  const { debug, verbose } = argv;
  const { filename, data } = await argv.file;
  const ch = new Character(data);
  const modeParts = argv.mode?.split('.');
  if (modeParts) {
    ch.splat = modeParts[0];
    ch.caste = modeParts[1];
    ch.variant = modeParts[2];
  }
  if (debug) {
    console.log(
      // eslint-disable-next-line max-len
      `Audit mode = ${ch.splat || '<no splat>'}.${ch.caste || '<no caste>'}.${ch.variant || '<no variant>'}`
    );
  }
  if (!ch.splat) {
    throw new Error('No splat in input, use --mode');
  }
  const auditorName = AUDITORS[ch.splat];
  if (!auditorName) {
    throw new Error(`No auditor found for ${ch.splat}`);
  }
  if (debug) {
    console.log(`Selected auditor: ${auditorName}`);
  }
  const Auditor = (await import(path.resolve(__dirname, '..', 'audit', auditorName))).default;
  const auditor = new Auditor(ch, { debug, verbose, filename });
  console.log(auditor.audit());
}