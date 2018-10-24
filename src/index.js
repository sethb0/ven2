import yargs from 'yargs';

const y = yargs
  .scriptName('ven2')
  .usage('Usage: $0 <command> [options]')
  .strict()
  .demandCommand(1)
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
