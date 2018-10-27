import { createWriteStream, readFile as readFileAsync } from 'fs';
import { DOMParser } from 'xmldom';
import { dumpStream as dumpYamlStream } from '@sethb0/yaml-utils';
import { promisify } from 'util';
import xmlToJson from 'xmltojson';

xmlToJson.stringToXML = (string) => new DOMParser().parseFromString(string, 'text/xml');

const readFile = promisify(readFileAsync);

export const command = 'x2y <files..>';

export const describe = 'Convert and merge Anathema XML and properties files to YAML';

export function builder (yargs) {
  return yargs
    .positional('files', {
      description: 'Files to convert',
      normalize: true,
      coerce: (files) => Promise.all(files.map(load)),
      // argv.files will be a Promise for an array of data items.
      // Each data item is either an array of [key, value] pairs, or an object.
      // Arrays come from properties files, objects from XML files.
    })
    .options({
      output: {
        description: 'Output filename',
        defaultDescription: 'stdout',
        alias: 'o',
        nargs: 1,
        normalize: true,
        requiresArg: true,
        type: 'string',
      },
    });
}

export function handler (argv) {
  return import('../handlers/x2y')
    .then((i) => i.default(argv))
    .then((data) => dump(argv.output, data))
    .catch(console.error);
}

function load (path) {
  const fn = path.endsWith('.properties')
    ? parseProperties
    : (data) => {
      const xmlData = xmlToJson.parseString(data, { grokText: false, xmlns: false });
      xmlData._path = path; // for error messages
      return xmlData;
    };
  return readFile(path, 'utf8').then(fn);
}

async function dump (path, data) {
  const str = path ? createWriteStream(path) : process.stdout;
  try {
    await dumpYamlStream(str, data);
  } finally {
    if (path) {
      str.destroy();
    }
  }
}

function parseProperties (text) {
  return text.split('\n')
    .map((l) => /^\s*([^#].*?)\s*=\s*(.+?)\s*$/u.exec(l))
    .filter((x) => x)
    .map((a) => a.slice(1, 3));
}
