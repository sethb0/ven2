import path from 'path';

import { expect } from '../setup';
import { readFixture } from './read-fixture';

import processCharmXML from '../../src/x2y/root/charmlist';
import processSpellXML from '../../src/x2y/root/spelllist';

function readCharmFixture (file) {
  return readFixture(path.join('x2y-charmlist', file));
}

function readSpellFixture (file) {
  return readFixture(path.join('x2y-spelllist', file));
}

describe('x2y root tag', function () {
  describe('charmlist', function () {
    for (const test of readFixture('x2y-charmlist-tests.yml')) {
      it(test.description, async function () {
        if (test.pending) {
          this.skip();
        } else {
          expect(await processCharmXML(
            readCharmFixture(`${test.fixture}.xml`),
            test.properties,
            {},
          ))
            .to.deep.equal(readCharmFixture(`${test.fixture}.yml`));
        }
      });
    }
  });

  describe('spelllist', function () {
    it('returns nothing when given nothing', async function () {
      expect(await processSpellXML(
        readSpellFixture('empty.xml'),
        { dummyID: 'dummy name' },
        {},
      ))
        .to.deep.equal([]);
    });

    it('handles a single spell', async function () {
      expect(await processSpellXML(
        readSpellFixture('1.xml'),
        { 'Terrestrial.MaledictionDistortedCompass': 'NAME' },
        {},
      ))
        .to.deep.equal([{
          id: 'Terrestrial.MaledictionDistortedCompass',
          name: 'NAME',
          type: 'spell',
          circle: 'Terrestrial',
        }]);
    });

    it('handles a spell with no name property', async function () {
      expect(await processSpellXML(
        readSpellFixture('1.xml'),
        {},
        {},
      ))
        .to.deep.equal([{
          id: 'Terrestrial.MaledictionDistortedCompass',
          type: 'spell',
          circle: 'Terrestrial',
        }]);
    });

    it('handles two spells', async function () {
      expect(await processSpellXML(
        readSpellFixture('2.xml'),
        {
          'Terrestrial.MaledictionDistortedCompass': 'NAME1',
          'Terrestrial.DeathObsidianButterflies': 'NAME2',
        },
        {},
      ))
        .to.deep.equal([
          {
            id: 'Terrestrial.MaledictionDistortedCompass',
            name: 'NAME1',
            type: 'spell',
            circle: 'Celestial',
          },
          {
            id: 'Terrestrial.DeathObsidianButterflies',
            name: 'NAME2',
            type: 'spell',
            circle: 'Solar',
          },
        ]);
    });

    it('handles an errata reference', async function () {
      expect(await processSpellXML(
        readSpellFixture('errata.xml'),
        { 'Terrestrial.DeathObsidianButterflies': 'NAME2' },
        {},
      ))
        .to.deep.equal([{
          id: 'Terrestrial.DeathObsidianButterflies',
          name: 'NAME2',
          type: 'spell',
          circle: 'Terrestrial',
          errata: true,
        }]);
    });
  });
});
