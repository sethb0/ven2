import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

export const expect = chai.expect;

// Babel 7 doesn't yet have a plugin/polyfill for Object.fromEntries even though it's at
// stage 3 of the proposal process...I thought all Stage 3 and lower proposals were supposed to
// be covered by preset-env?
export function shim () {
  return Object.fromEntries
    ? Promise.resolve()
    : import('object.fromentries').then((x) => x.default.shim());
}
