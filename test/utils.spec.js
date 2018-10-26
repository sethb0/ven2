import { expect /* , shim */ } from './setup';

import { stat, transpose /* , mergeObjects */ } from '../src/utils';

describe('utility functions', function () {
  describe('transpose', function () {
    it('turns a 2x3 matrix into a 3x2 matrix', function () {
      const m = [[1, 2, 3], [4, 5, 6]];
      expect(transpose(m)).to.deep.equal([[1, 4], [2, 5], [3, 6]]);
    });
  });

  describe('stat', function () {
    it('returns 0 by default', function () {
      expect(stat({})).to.equal(0);
    });

    it('returns creation if nothing else', function () {
      expect(stat({ creation: 1 })).to.equal(1);
    });

    it('returns bonus if nothing else', function () {
      expect(stat({ bonus: 2 })).to.equal(2);
    });

    it('returns bonus if bonus and creation', function () {
      expect(stat({ creation: 1, bonus: 2 })).to.equal(2);
    });

    it('returns experienced if nothing else', function () {
      expect(stat({ experienced: 1 })).to.equal(1);
    });

    it('returns experienced if experienced and creation', function () {
      expect(stat({ creation: 3, experienced: 4 })).to.equal(4);
    });

    it('returns experienced if experienced and bonus', function () {
      expect(stat({ bonus: 2, experienced: 3 })).to.equal(3);
    });

    it('returns experienced if experienced, bonus and creation', function () {
      expect(stat({
        creation: 4, bonus: 6, experienced: 9,
      })).to.equal(9);
    });

    it('returns augmented if nothing else', function () {
      expect(stat({ augmented: 5 })).to.equal(5);
    });

    it('returns augmented if augmented and creation', function () {
      expect(stat({ creation: 5, augmented: 6 })).to.equal(6);
    });

    it('returns augmented if augmented and bonus', function () {
      expect(stat({ bonus: 3, augmented: 4 })).to.equal(4);
    });

    it('returns augmented if augmented, bonus and creation', function () {
      expect(stat({
        creation: 1, bonus: 2, augmented: 3,
      })).to.equal(3);
    });

    it('returns augmented if augmented and experienced', function () {
      expect(stat({ experienced: 2, augmented: 8 })).to.equal(8);
    });

    it('returns augmented if augmented, experienced and creation', function () {
      expect(stat({
        creation: 1, experienced: 2, augmented: 3,
      })).to.equal(3);
    });

    it('returns augmented if augmented, experienced and bonus', function () {
      expect(stat({
        bonus: 3, experienced: 4, augmented: 5,
      })).to.equal(5);
    });

    it('returns augmented if augmented, experienced, bonus and creation', function () {
      expect(stat({
        creation: 2, bonus: 4, experienced: 5, augmented: 7,
      })).to.equal(7);
    });

    it('returns diminished if diminished less than max', function () {
      expect(stat({ creation: 5, diminished: 3 })).to.equal(3);
    });

    it("doesn't return diminished if diminished greater than max", function () {
      expect(stat({ creation: 3, diminished: 5 })).to.equal(3);
    });

    it("doesn't return diminished by default", function () {
      expect(stat({ diminished: 1 })).to.equal(0);
    });
  });

  // describe('mergeObjects', function () {
  //   before(shim);
  //
  //   it('drops matching nulls', function () {
  //     expect(mergeObjects({ a: null }, { a: null })).to.deep.equal({});
  //   });
  //
  //   it('coalesces nulls', function () {
  //     expect(mergeObjects({ a: null }, { a: 'foo' })).to.deep.equal({ a: 'foo' });
  //     expect(mergeObjects({ a: 'foo' }, { a: null })).to.deep.equal({ a: 'foo' });
  //   });
  //
  //   it('always outputs an object', function () {
  //     expect(mergeObjects()).to.deep.equal({});
  //   });
  //
  //   it('drops nullish in a single argument', function () {
  //     expect(mergeObjects({
  //       a: null, b: undefined, c: 5, // eslint-disable-line no-undefined
  //     })).to.deep.equal({ c: 5 });
  //   });
  //
  //
  // });
});
