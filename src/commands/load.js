import { stdInput, stdInputOption } from '../command-helpers';

export const command = 'load';

export const describe = 'Load a charm data file into the database';

export function builder (yargs) {
  return yargs
    .options({
      ...stdInputOption,
      server: {
        description: 'Database server URL',
        'default': 'mongodb://localhost:27017/ven2',
        alias: 'url',
        nargs: 1,
        requiresArg: true,
        type: 'string',
      },
      verbose: {
        description: 'Verbose output',
        alias: 'v',
        nargs: 0,
        type: 'boolean',
      },
    });
}

export function handler (argv) {
  return callHandler(argv);
}

export function callHandler (argv) {
  stdInput(argv);
  return import('../handlers/load')
    .then((i) => i.default(argv))
    .catch((e) => console.error(argv.debug ? e : e.message));
}
