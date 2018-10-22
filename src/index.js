import fs from 'fs';
import yargs from 'yargs';

function loadFile (path) {
  return fs.readFileSync(path, 'utf8');
}

const { argv } = yargs
  .scriptName('ven2')
  .usage('Usage: $0 <command> [options]')
  .strict()
  .commandDir('commands')
  .options({
    d: {
      description: 'debugging output',
      alias: 'debug',
      hidden: true,
      nargs: 0,
      type: 'boolean',
    },
    f: {
      description: 'input filename',
      defaultDescription: 'stdin',
      alias: 'file',
      coerce: loadFile,
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string',
    },
    o: {
      description: 'output filename',
      defaultDescription: 'stdout',
      alias: 'output',
      nargs: 1,
      normalize: true,
      requiresArg: true,
      type: 'string',
    },
    v: {
      description: 'verbose output',
      alias: 'verbose',
      nargs: 0,
      type: 'boolean',
    },
  })
  .help('h')
  .version()
  .alias({
    h: 'help',
  })
  .skipValidation(['h', 'V'])
  .env('VENATOR')
  .config()
  .recommendCommands()
  .completion('completion', false);

// console.log(argv);
