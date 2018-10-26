import path from 'path';
import { loadSync as loadYamlSync } from '@sethb0/yaml-utils';
import { expect, shim } from './setup';

import { Character } from '../src/character';

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'character');

describe.only('character', function () {
  before(shim);

  describe('load and dump', function () {
    it('elder Sidereal', function () {
      const { inData, outData } = readFixtures('ChoiJanak');
      const ch = new Character(inData);
      expect(ch).to.deep.equal(outData);
      expect(ch.dump()).to.deep.equal(inData);
    });

    it('Alchemical', function () {
      const { inData, outData } = readFixtures('LissomeAvidEngineer');
      const ch = new Character(inData);
      expect(ch).to.deep.equal(outData);
      const dump = ch.dump();
      recursiveSortByJson(inData.installed);
      recursiveSortByJson(inData.uninstalled);
      recursiveSortByJson(dump.installed);
      recursiveSortByJson(dump.uninstalled);
      expect(dump).to.deep.equal(inData);
    });

    it('moderately experienced Solar', function () {
      const { inData, outData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch).to.deep.equal(outData);
      expect(ch.dump()).to.deep.equal(inData);
    });

    it('Infernal', function () {
      const { inData, outData } = readFixtures('NoWingGull');
      const ch = new Character(inData);
      expect(ch).to.deep.equal(outData);
      expect(ch.dump()).to.deep.equal(inData);
    });

    it('Raksha', function () {
      const { inData, outData } = readFixtures('VauChen');
      const ch = new Character(inData);
      expect(ch).to.deep.equal(outData);
      expect(ch.dump()).to.deep.equal(inData);
    });
  });

  describe('discounts', function () {
    it("doesn't discount nothingness", function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.discounts()).not.to.exist;
      expect(ch.discounts(null)).not.to.exist;
    });

    describe('Sidereal colleges', function () {
      it('for a Sidereal', function () {
        const { inData } = readFixtures('ChoiJanak');
        const ch = new Character(inData);
        expect(ch.discounts('Banner')).to.exist;
        expect(ch.discounts('Lovers')).not.to.exist;
      });

      it('for a non-Sidereal', function () {
        const { inData } = readFixtures('LissomeAvidEngineer');
        const ch = new Character(inData);
        expect(ch.discounts('Banner')).not.to.exist;
        expect(ch.discounts('Lovers')).not.to.exist;
      });
    });

    it('both Craft and its subabilities', function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.discounts('Craft')).to.exist;
      expect(ch.discounts('Craft (Magitech)')).to.exist;
    });

    it('favored Abilities', function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.discounts('Performance')).to.exist;
    });

    it('caste and favored Attributes', function () {
      const { inData } = readFixtures('LissomeAvidEngineer');
      const ch = new Character(inData);
      expect(ch.discounts('Dexterity')).to.exist;
      expect(ch.discounts('Appearance')).to.exist;
      expect(ch.discounts('Stamina')).not.to.exist;
    });

    it('patron and favored Yozis', function () {
      const { inData } = readFixtures('NoWingGull');
      const ch = new Character(inData);
      expect(ch.discounts('Malfeas')).to.exist;
      expect(ch.discounts('Ebon Dragon')).to.exist;
      expect(ch.discounts('Cecelyne')).not.to.exist;
    });
  });

  describe('favors', function () {
    it("doesn't favor nothingness", function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.favors()).not.to.exist;
      expect(ch.favors(null)).not.to.exist;
    });

    describe('Sidereal colleges', function () {
      it('for a Sidereal', function () {
        const { inData } = readFixtures('ChoiJanak');
        const ch = new Character(inData);
        expect(ch.favors('Banner')).to.exist;
        expect(ch.favors('Lovers')).not.to.exist;
      });

      it('for a non-Sidereal', function () {
        const { inData } = readFixtures('LissomeAvidEngineer');
        const ch = new Character(inData);
        expect(ch.favors('Banner')).not.to.exist;
        expect(ch.favors('Lovers')).not.to.exist;
      });
    });

    it('both Craft and its subabilities', function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.favors('Craft')).to.exist;
      expect(ch.favors('Craft (Magitech)')).to.exist;
    });

    it('favored Abilities', function () {
      const { inData } = readFixtures('KaralLeiXin');
      const ch = new Character(inData);
      expect(ch.favors('Performance')).to.exist;
    });

    it('caste and favored Attributes', function () {
      const { inData } = readFixtures('LissomeAvidEngineer');
      const ch = new Character(inData);
      expect(ch.favors('Dexterity')).to.exist;
      expect(ch.favors('Appearance')).to.exist;
      expect(ch.favors('Stamina')).not.to.exist;
    });

    it('patron and favored Yozis', function () {
      const { inData } = readFixtures('NoWingGull');
      const ch = new Character(inData);
      expect(ch.favors('Malfeas')).to.exist;
      expect(ch.favors('Ebon Dragon')).to.exist;
      expect(ch.favors('Cecelyne')).not.to.exist;
    });

    it('primary Virtue', function () {
      const { inData } = readFixtures('NoWingGull');
      const ch = new Character(inData);
      expect(ch.favors('Conviction')).to.exist;
      expect(ch.favors('Temperance')).not.to.exist;
    });

    it('major Grace', function () {
      const { inData } = readFixtures('VauChen');
      const ch = new Character(inData);
      expect(ch.favors('Cup')).to.exist;
      expect(ch.favors('Sword')).not.to.exist;
    });
  });
});

function readFixtures (basename) {
  const basePath = path.join(FIXTURES_DIR, basename);
  return {
    inData: loadYamlSync(`${basePath}.in.yml`),
    outData: loadYamlSync(`${basePath}.out.yml`),
  };
}

function recursiveSortByJson (array) {
  for (const item of array) {
    if (Array.isArray(item)) {
      recursiveSortByJson(item);
    }
  }
  array.sort(compareByJson);
}

function compareByJson (a, b) {
  const ja = JSON.stringify(a);
  const jb = JSON.stringify(b);
  if (ja < jb) {
    return -1;
  }
  if (ja > jb) {
    return 1;
  }
  return 0;
}
