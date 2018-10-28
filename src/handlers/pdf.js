import { Character } from '../character';
import { DISPATCH } from '../handler-helpers';
import path from 'path';
import util from 'util';

export default async function handler (argv) {
  const { debug } = argv;
  const ch = new Character((await argv.file).data);
  if (debug) {
    console.log(ch);
  }
  const mode = ch.splat;
  const generator = DISPATCH[mode];
  if (!generator) {
    throw new Error(`No PDF generator found for ${mode}`);
  }
  if (debug) {
    console.log(`debug generator: ${generator}`);
  }
  const result = new (
    await import(path.resolve(__dirname, '..', 'pdf', generator))
  ).default(ch, { debug }) // eslint-disable-line new-cap, babel/new-cap
    .makeDocumentDescriptor();
  if (debug) {
    console.log(
      'debug output:\n%s',
      util.inspect(result, { colors: true, depth: Infinity }),
    );
  }
  return result;
}
