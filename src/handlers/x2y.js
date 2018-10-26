export default async function x2y (argv) {
  const { debug } = argv;
  const files = await argv.files;
  const properties = Object.fromEntries([].concat(...files.filter(Array.isArray)));
  const out = [];
  const alternatives = [];
  const merges = [];
  for (const result of await Promise.all(
    files.filter((x) => !Array.isArray(x))
      .map(async (xmlData) => {
        const path = xmlData._path;
        const [rootTag] = Object.keys(xmlData).filter((x) => !x.startsWith('_'));
        if (!/^\w+$/u.test(rootTag)) {
          throw new Error(`Invalid XML root tag ${rootTag} in file ${path}`);
        }
        let processor;
        try {
          processor = (await import(`../x2y/root/${rootTag}`)).default;
        } catch (e) {
          throw new Error(`Failed to load processor for XML root tag ${rootTag}: ${e.message}`);
        }
        return processor(xmlData, properties, { path, debug });
      })
  )) {
    if (result.alternatives) {
      alternatives.push(...result.alternatives);
    }
    if (result.merges) {
      merges.push(...result.merges);
    }
    out.push(...result);
  }
  if (alternatives.length) {
    out.push({ type: 'alternatives', alternatives });
  }
  if (merges.length) {
    out.push({ type: 'merges', merges });
  }
  return out;
}
