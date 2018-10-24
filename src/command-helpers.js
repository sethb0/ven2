import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

export const stdBuilder = {
  input: {
    description: 'Input filename',
    defaultDescription: 'stdin',
    alias: 'i',
    coerce: (path) => fs.readFileSync(path, 'utf8'),
    nargs: 1,
    normalize: true,
    requiresArg: true,
    type: 'string',
  },
  output: {
    description: 'Output filename',
    defaultDescription: 'stdout',
    alias: 'o',
    nargs: 1,
    normalize: true,
    requiresArg: true,
    type: 'string',
  },
  // verbose: {
  //   description: 'Verbose output',
  //   alias: 'v',
  //   nargs: 0,
  //   type: 'boolean',
  // },
};

export const stdEpilogue = `Environment variables:
  VENATOR_CONFIG  Directory of config files            [default: ~/Library/ven2]`;

export function stdOutput (argv, message) {
  return (
    argv.output
      ? writeFile(argv.output, message)
      : new Promise((resolve) => {
        process.stdout.write(message, resolve);
      })
  ).then(() => null);
}
