import { readFileSync } from 'fs';
import path from 'path';
import { loadSync as loadYamlSync } from '@sethb0/yaml-utils';
import { expect, shim } from './setup';

import { Character } from '../src/character';
import AlchemicalAuditor from '../src/audit/alchemical';
import InfernalAuditor from '../src/audit/infernal';
import LunarAuditor from '../src/audit/lunar';
import RakshaAuditor from '../src/audit/raksha';
import SiderealAuditor from '../src/audit/sidereal';
import SolarAuditor from '../src/audit/solar';

const AUDIT_DIR = path.join(__dirname, 'fixtures', 'audit');
const CHARACTERS_DIR = path.join(__dirname, 'fixtures', 'character');

describe('audit', function () {
  before(shim);

  it('reports the same totals in normal and verbose modes', function () {
    const { input } = loadFixtures('ChoiJanak');
    const auditor1 = new SiderealAuditor(new Character(input), {});
    const auditor2 = new SiderealAuditor(new Character(input), { verbose: true });
    const [totalSpent, earned] = auditor1.audit().split('/');
    const audit2 = auditor2.audit();
    expect(audit2).to.match(new RegExp(`^TOTAL SPENT:\\s+${totalSpent}$`, 'mu'));
    expect(audit2).to.match(new RegExp(`^EARNED:\\s+${earned}$`, 'mu'));
  });

  describe('regression tests', function () {
    it('Choi Janak', function () {
      const { input, output } = loadFixtures('ChoiJanak');
      const auditor = new SiderealAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });

    it('Karal Lei-Xin', function () {
      const { input, output } = loadFixtures('KaralLeiXin');
      const auditor = new SolarAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });

    it('Lissome Avid Engineer', function () {
      const { input, output } = loadFixtures('LissomeAvidEngineer');
      const auditor = new AlchemicalAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });

    it('No-Wing Gull', function () {
      const { input, output } = loadFixtures('NoWingGull');
      const auditor = new InfernalAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });

    it('Rekka Tarinen', function () {
      const { input, output } = loadFixtures('RekkaTarinen');
      const auditor = new LunarAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });

    it('Vau-Chen', function () {
      const { input, output } = loadFixtures('VauChen');
      const auditor = new RakshaAuditor(new Character(input), { verbose: true });
      expect(auditor.audit()).to.equal(output);
    });
  });
});

function loadFixtures (basename) {
  const input = loadYamlSync(path.join(CHARACTERS_DIR, `${basename}.in.yml`));
  let output = readFileSync(path.join(AUDIT_DIR, `${basename}.txt`), 'utf8');
  if (output.endsWith('\n')) {
    output = output.slice(0, -1);
  }
  return { input, output };
}
