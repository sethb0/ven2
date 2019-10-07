import { MongoClient } from 'mongodb';

export default async function load (argv) {
  const f = (await argv.file).data;
  const data = {};
  let recno = 0;
  for (const record of Array.isArray(f) ? f : [f]) {
    if (record.id) {
      switch (record.type) {
      case 'spell':
        (data.spells ||= []).push(record);
        break;
      case 'charm':
      case 'generic':
        if (record.exalt) {
          (data[toKebab(record.exalt)] ||= []).push(record);
        } else {
          console.warn(`Missing exalt type in ${record.id} (index ${recno})`);
        }
        break;
      case 'knack':
        if (record.group) {
          (data.knacks ||= []).push(record);
        } else {
          console.warn(`Missing knack group in ${record.id} (index ${recno})`);
        }
        break;
      case 'proxy':
        (data.proxies ||= []).push(record);
        break;
      case 'note':
        console.warn(`Record type "note" should not have ID at index ${recno}`);
        break;
      default:
        console.warn(
          `${
            record.type ? `Unknown record type ${record.type}` : 'Missing record type'
          } in ${record.id} (index ${recno})`
        );
      }
    } else if (record.type !== 'note') {
      console.warn(`Missing ID in record at index ${recno}`);
    }
    recno += 1;
  }

  const client = await MongoClient.connect(argv.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    const db = client.db();
    await Promise.all(
      Object.keys(data)
        .map(
          (name) => {
            const indexes = [];
            if (name === 'proxies') {
              indexes.push(
                { key: { id: 1, 'variants.id': 1 }, unique: true, background: true },
                { key: { 'for.exalt': 1, 'for.group': 1 }, background: true },
              );
            } else {
              indexes.push(
                { key: { id: 1 }, unique: true, background: true },
                { key: { name: 1 }, background: true },
              );
              if (name === 'spells') {
                indexes.push({ key: { circle: 1 }, background: true });
              } else {
                indexes.push(
                  { key: { group: 1 }, background: true },
                );
                if (name !== 'knacks') {
                  indexes.push(
                    { key: { type: 1 }, background: true },
                  );
                }
              }
            }
            return db.collection(name).createIndexes(indexes);
          }
        )
    );
    const results = await Promise.all(
      Object.entries(data)
        .map(
          ([name, records]) => db.collection(name)
            .bulkWrite(
              records.map(
                (r) => ({
                  replaceOne: {
                    filter: name === 'proxies'
                      ? {
                        id: r.id,
                        'variants.id': r.variants
                          ? r.variants[0].id
                          : { $exists: 0 },
                      }
                      : { id: r.id },
                    replacement: r,
                    upsert: true,
                  },
                })
              ),
              { ordered: false, forceServerObjectId: true }
            )
            .then((result) => ({
              name,
              count: records.length,
              deleted: result.deletedCount,
              inserted: result.insertedCount,
              matched: result.matchedCount,
              modified: result.modifiedCount,
              upserted: result.upsertedCount,
            }))
        )
    );
    if (argv.debug || argv.verbose) {
      console.log(results);
    }
  } finally {
    client.close();
  }
}

function toKebab (str) {
  return str.toLowerCase().replace(/\W+/gu, '-');
}
