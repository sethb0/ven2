import { load as loadYaml } from '@sethb0/yaml-utils';

export const command = 'validate <files..>';

export const describe = "Validate YAML files against Venator's schemata";

export function builder (yargs) {
  return yargs
    .positional('files', {
      description: 'YAML files to validate',
      normalize: true,
      coerce: (files) => Promise.all(files.map(load)),
    });
}

export function handler (argv) {
  return import('../handlers/validate')
    .then((i) => i.default(argv))
    .catch(console.error);
}

function load (filename) {
  return loadYaml(filename)
    .then((data) => ({ filename, data }))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
