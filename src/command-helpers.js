import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

function loadFile (path) {
  return fs.readFileSync(path, 'utf8');
}

export const stdBuilder = {
  input: {
    description: 'Input filename',
    defaultDescription: 'stdin',
    alias: 'i',
    coerce: loadFile,
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

export function stdOutput (argv, message) {
  return (
    argv.output
      ? writeFile(argv.output, message)
      : new Promise((resolve) => {
        process.stdout.write(message, resolve);
      })
  ).then(() => null);
}
