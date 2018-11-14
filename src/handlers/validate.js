import Ajv from 'Ajv';
import ajvMergePatch from 'ajv-merge-patch';
import fs from 'fs';
import { load as loadYaml } from '@sethb0/yaml-utils';
import path from 'path';
import { promisify } from 'util';

const readDir = promisify(fs.readdir);

const ROOT_SCHEMA_IDS = [
  'https://venator.sharpcla.ws/schema/character.json',
  'https://venator.sharpcla.ws/schema/charm.json',
  'https://venator.sharpcla.ws/schema/spell.json',
];

export default async function validate (argv) {
  const schemaDir = path.resolve(__dirname, '..', 'schemata');
  const schemata = (await readDir(schemaDir)).map((f) => loadYaml(path.join(schemaDir, f)));
  // if there are any JSON files, we take advantage of the fact that YAML is a superset of JSON
  const ajv = new Ajv({
    $data: true,
    jsonPointers: true,
    unicode: false,
    extendRefs: 'fail',
    schemas: await Promise.all(schemata),
  });
  ajvMergePatch(ajv);
  const masterSchema = {
    oneOf: [
      { type: 'array', maxItems: 0 },
    ].concat(...ROOT_SCHEMA_IDS.map((id) => [
      { $ref: id },
      { type: 'array', items: { $ref: id }, minItems: 1 },
    ])),
  };
  const validator = ajv.compile(masterSchema);
  for (const { filename, data } of await argv.files) {
    // we don't parallelize these because validator isn't reentrant and because we don't want
    // the output to be interleaved
    if (validator(data)) {
      console.log(`${filename} is valid`);
    } else {
      console.log(`${filename} failed validation`);
      if (argv.debug) {
        for (const e of validator.errors) {
          console.log(e);
        }
      }
    }
  }
}
