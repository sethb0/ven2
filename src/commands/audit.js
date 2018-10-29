import { stdInput, stdInputOption } from '../command-helpers';

export const command = 'audit';

export const describe = 'Audit XP earned and spent for a character';

export const stdModeOption = {
  mode: {
    description: 'Force auditing by given rules (splat.caste.variant)',
    alias: 'm',
    type: 'string',
    nargs: 1,
  },
};

export function builder (yargs) {
  return yargs
    .options({
      ...stdInputOption,
      ...stdModeOption,
      verbose: {
        description: 'Show XP breakdown by category',
        alias: 'v',
        type: 'boolean',
        nargs: 0,
      },
    });
}

export function handler (argv) {
  return callHandler(argv, command);
}

export function callHandler (argv, dir) {
  stdInput(argv);
  return import('../handlers/audit')
    .then((i) => i.default(argv, dir))
    .catch((e) => console.error(argv.debug ? e : e.message));
}
