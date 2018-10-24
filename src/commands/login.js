/* eslint no-process-env: off */
import os from 'os';
import path from 'path';
import { stdEpilogue } from '../command-helpers';

export const command = 'login [user]';

export const describe = 'Log into Google Drive or refresh stored access token';

export function builder (yargs) {
  return yargs
    .positional('user', {
      description: 'Email address of Google account to log into (default: most recent user)',
      type: 'string',
    })
    .options({
      force: {
        alias: 'f',
        description: 'Force login/refresh even if stored access token has not expired',
        type: 'boolean',
        'default': false,
      },
    })
    .epilogue(stdEpilogue);
}

export function handler (argv) {
  argv.configDir = process.env.VENATOR_CONFIG || path.join(os.homedir(), 'Library', 'ven2');
  return import('../handlers/login')
    .then((i) => i.default(argv))
    .then(console.log)
    .catch((err) => console.error(`Error: ${err.message}`));
}
