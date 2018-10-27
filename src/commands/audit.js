import { stdInput, stdInputOption } from '../command-helpers';

export const command = 'audit';

export const describe = 'Audit XP earned and spent for a character';

export function builder (yargs) {
  return yargs
    .options({
      ...stdInputOption,
      mode: {
        description: 'Force auditing by given rules (splat.caste.variant)',
        alias: 'm',
        type: 'string',
        nargs: 1,
      },
      verbose: {
        description: 'Show XP breakdown by category',
        alias: 'v',
        type: 'boolean',
        nargs: 0,
      },
    });
}

export function handler (argv) {
  stdInput(argv);
  return import('../handlers/audit')
    .then((i) => i.default(argv))
    .catch(console.error);
}
