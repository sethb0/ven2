/* eslint no-process-exit: off */
import { load as loadYaml } from '@sethb0/yaml-utils';

export const command = 'validate <file..>';

export const describe = "Validate YAML file(s) against Venator's schemata";

export const builder = (yargs) => yargs
  .positional('file', {
    description: 'YAML file(s) to validate',
    normalize: true,
    coerce: (files) => Promise.all(files.map(load)),
  });

export const handler
  = (argv) => import('../handlers/validate')
    .then((i) => i.default(argv))
    .catch(console.error);

function load (filename) {
  return loadYaml(filename)
    .then((data) => ({ filename, data }))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
