import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';
import xmlToJson from 'xmltojson';
import { loadSync as loadYaml } from '@sethb0/yaml-utils';

xmlToJson.stringToXML = (string) => new DOMParser().parseFromString(string, 'text/xml');

export function readFixture (filename) {
  if (filename.endsWith('.yml')) {
    return loadYaml(path.resolve(__dirname, '..', 'fixtures', filename));
  }
  return xmlToJson.parseString(
    fs.readFileSync(path.resolve(__dirname, '..', 'fixtures', filename), 'utf8'),
    { grokText: false, xmlns: false }
  );
}
