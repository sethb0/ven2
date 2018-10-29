import { stdInputOption } from '../command-helpers';
import { callHandler, stdModeOption } from './audit';

export const command = 'xplist';

export const describe = "List XP spent on each of a character's traits";

export function builder (yargs) {
  return yargs
    .options({
      ...stdInputOption,
      ...stdModeOption,
    });
}

export function handler (argv) {
  return callHandler(argv, command);
}
