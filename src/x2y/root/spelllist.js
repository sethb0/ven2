export default async function processXML (xml, properties, { debug }) {
  const out = [];
  if (debug) {
    console.log(xml); // eslint-disable-line no-console
  }
  for (const spell of xml.spelllist[0].spell || []) {
    const id = spell._attr.id._value;
    const item = {
      id, type: 'spell', circle: spell._attr.circle._value,
    };
    const name = properties[id];
    if (name) {
      item.name = name;
    }
    if (spell.source?.map((x) => x._attr.source._value)?.includes('ScrollErrata')) {
      item.errata = true;
    }
    out.push(item);
  }
  return out;
}
