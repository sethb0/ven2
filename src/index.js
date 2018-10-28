/* eslint no-console: off */
import yargs from 'yargs';

// Babel 7 doesn't yet have a plugin/polyfill for Object.fromEntries even though it's at
// stage 3 of the proposal process...I thought all Stage 3 and lower proposals were supposed to
// be covered by preset-env?
const p = Object.fromEntries
  ? Promise.resolve()
  : import('object.fromentries').then((x) => x.default.shim());

p.then(() => {
  const y = yargs
    .scriptName('venator')
    .usage('Usage: $0 <command> [options]')
    .strict()
    .commandDir('commands')
    .options({
      debug: {
        description: 'Debugging output',
        alias: 'd',
        hidden: true,
        nargs: 0,
        type: 'boolean',
      },
    })
    .help()
    .version()
    .alias({
      help: 'h',
      version: 'V',
    });

  if (!y.argv._.length) {
    y.showHelp('log');
  }
})
  .catch(console.error);
