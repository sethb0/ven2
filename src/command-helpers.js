/* eslint no-console: off, no-process-exit: off */
import concat from 'concat-stream';
import fs from 'fs';
import { load as loadYaml, SCHEMA } from '@sethb0/yaml-utils';
import pump from 'pump';
import { safeLoad as safeLoadYaml } from 'js-yaml';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

export const stdInputOption = {
  input: {
    description: 'Input filename',
    defaultDescription: 'stdin',
    alias: 'i',
    nargs: 1,
    normalize: true,
    requiresArg: true,
    type: 'string',
  },
};

export const stdOutputOption = {
  output: {
    description: 'Output filename',
    defaultDescription: 'stdout',
    alias: 'o',
    nargs: 1,
    normalize: true,
    requiresArg: true,
    type: 'string',
  },
};

export const stdEpilogue = `Environment variables:
  VENATOR_CONFIG  Directory of config files            [default: ~/Library/ven2]`;

export function stdInput (argv) {
  if (argv.input) {
    // argv.input is a getter/setter; changing the value calls normalize again.
    // Blah.
    argv.file = loadYaml(argv.input)
      .then((data) => ({ filename: argv.input, data }))
      .catch(errorHandler);
  } else {
    argv.file = drainStream(process.stdin)
      .then((buf) => ({ data: safeLoadYaml(buf.toString('utf8'), { schema: SCHEMA }) }))
      .catch(errorHandler);
  }
}

export function stdOutput (argv, message) {
  return (
    argv.output
      ? writeFile(argv.output, message)
      : new Promise((resolve) => {
        process.stdout.write(message, resolve);
      })
  )
    .then(() => null)
    .catch(errorHandler);
}

function drainStream (stream) {
  return new Promise((resolve, reject) => {
    const c = concat(resolve);
    pump(stream, c, (err) => err && reject(err));
  });
}

function errorHandler (err) {
  console.error(err);
  process.exit(1);
}
