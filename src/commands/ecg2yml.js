import { stdInput, stdInputOption, stdOutput, stdOutputOption } from '../command-helpers';

export const command = 'ecg2yml';

export const describe = 'Convert an Anathema .ecg file to YAML';

export const builder = {
  ...stdInputOption,
  ...stdOutputOption,
};

export function handler (argv) {
  stdInput(argv);
  return import('../handlers/ecg2yml')
    .then((i) => i.default(argv))
    .then((output) => stdOutput(argv, output))
    .catch((e) => console.error(argv.debug ? e : e.message));
}
