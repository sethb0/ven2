/* eslint no-console: off */
import Ajv from 'Ajv';
import ajvMergePatch from 'ajv-merge-patch';
import { load as loadYaml } from '@sethb0/yaml-utils';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const ITEM_SCHEMA_ID = 'urn:mfllc:venator:schema:master-item-schema';
const ROOT_SCHEMA_IDS = [
  'https://venator.sharpcla.ws/schema/character.json',
  'https://venator.sharpcla.ws/schema/charm.json',
  'https://venator.sharpcla.ws/schema/spell.json',
];

export default async function validate (argv) {
  const schemaDir = path.resolve(__dirname, '..', 'schemata');
  const files = (await readDir(schemaDir)).map((f) => path.join(schemaDir, f));
  const schemata = await Promise.all([
    ...files.filter((f) => f.endsWith('.json')).map(loadJson),
    ...files.filter((f) => f.endsWith('.yml')).map(loadYaml),
    // ignore other files (shouldn't be any)
    {
      $id: ITEM_SCHEMA_ID,
      oneOf: ROOT_SCHEMA_IDS.map((id) => ({ $ref: id })),
    },
  ]);
  const ajv = new Ajv({
    $data: true,
    jsonPointers: true,
    unicode: false,
    extendRefs: 'fail',
    schemas: schemata,
  });
  ajvMergePatch(ajv);
  const masterSchema = {
    oneOf: [{ $ref: ITEM_SCHEMA_ID }, { type: 'array', items: { $ref: ITEM_SCHEMA_ID } }],
  };
  const validator = ajv.compile(masterSchema);
  for (const { filename, data } of await argv.files) {
    if (validator(data)) {
      console.log(`${filename} is valid`);
    } else {
      const { errors } = validator;
      console.log(
        `${filename} had ${errors.length} validation error${errors.length === 1 ? '' : 's'}:`,
      );
      errors.forEach((e) => console.log(e));
    }
  }
}

function loadJson (f) {
  return readFile(f, 'utf8').then(JSON.parse);
}
