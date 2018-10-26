import { CharmProcessor, GenericCharmProcessor, MiscProcessor } from '../charm-processors';

export default async function processXML (xml, properties, { debug }) {
  if (debug) {
    console.log(xml); // eslint-disable-line no-console
  }
  const out = [];
  let charmProcessor;
  let genericCharmProcessor;
  let miscProcessor;
  for (
    const [type, x] of Object.entries(xml.charmlist[0])
      .filter(([y]) => !y.startsWith('_'))
  ) {
    switch (type) {
    case 'charm':
      charmProcessor ||= new CharmProcessor(properties);
      for (const charm of x) {
        out.push(charmProcessor.process(charm));
      }
      break;
    case 'genericCharm':
      genericCharmProcessor ||= new GenericCharmProcessor(properties);
      for (const genericCharm of x) {
        out.push(genericCharmProcessor.process(genericCharm));
      }
      break;
    case 'alternatives':
      miscProcessor ||= new MiscProcessor();
      for (const alternatives of x) {
        for (const alternative of alternatives.alternative || []) {
          miscProcessor.processAlternative(alternative);
        }
      }
      break;
    case 'merges':
      miscProcessor ||= new MiscProcessor();
      for (const merges of x) {
        for (const merged of merges.merged || []) {
          miscProcessor.processMerged(merged);
        }
      }
      break;
    case 'renames':
      break;
    default:
      process.emitWarning(`Unrecognized Charm type ${type}`);
    }
  }
  if (miscProcessor) {
    const alternatives = miscProcessor.alternatives;
    if (alternatives.length) {
      out.alternatives = alternatives;
    }
    const merges = miscProcessor.merges;
    if (merges.length) {
      out.merges = merges;
    }
  }
  return out;
}
