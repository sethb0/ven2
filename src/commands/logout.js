/* eslint no-process-env: off */
import os from 'os';
import path from 'path';
import { stdEpilogue } from '../command-helpers';

export const command = 'logout [user]';

export const describe = 'Log out of Google Drive';

export function builder (yargs) {
  return yargs
    .positional('user', {
      description: 'Email address of Google account to log out (default: most recent user)',
      type: 'string',
    })
    .epilogue(stdEpilogue);
}

export function handler (argv) {
  argv.configDir = process.env.VENATOR_CONFIG || path.join(os.homedir(), 'Library', 'ven2');
  return import('../handlers/logout')
    .then((i) => i.default(argv))
    .then(console.log)
    .catch((err) => console.error(`Error: ${err.message}`));
}
