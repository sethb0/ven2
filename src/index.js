/* eslint no-console: off, no-process-exit: off */
import yargs from 'yargs';

try {
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
    process.exit(1);
  }
} catch (err) {
  console.error(err);
  process.exit(2);
}
