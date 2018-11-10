import { MongoClient, Logger } from 'mongodb';

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
        (data.knacks ||= []).push(record);
        break;
      case 'proxy':
        // ignore
        break;
      default:
        console.warn(
          `${
            record.type ? `Unknown record type ${record.type}` : 'Missing record type'
          } in ${record.id} (index ${recno})`
        );
      }
    } else {
      console.warn(`Missing ID in record at index ${recno}`);
    }
    recno += 1;
  }

  const client = await MongoClient.connect(argv.url, { useNewUrlParser: true });
  try {
    const db = client.db(argv.db);
    await Promise.all(
      Object.keys(data)
        .map(
          (name) => db.collection(name)
            .createIndex({ id: 1 }, { unique: true, background: true, dropDups: true })
        )
    );
    const results = await Promise.all(
      Object.entries(data)
        .map(
          ([name, records]) => db.collection(name)
            .bulkWrite(records.map(
              (r) => ({ replaceOne: { filter: { id: r.id }, replacement: r, upsert: true } })
            ), { ordered: false, forceServerObjectId: true })
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
