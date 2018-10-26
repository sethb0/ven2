export function sum (array) {
  return array.reduce((a, b) => a + b, 0);
}

export function stat (obj) {
  if (!obj) {
    return 0;
  }
  const { creation, bonus, experienced, augmented, diminished } = obj;
  const n = augmented ?? experienced ?? bonus ?? creation ?? 0;
  if (typeof diminished === 'number' && diminished < n) {
    return diminished;
  }
  return n;
}

export function transpose (matrix) {
  const rows = matrix.length;
  const smooshed = [].concat(...matrix);
  const columns = Math.ceil(smooshed.length / rows);
  const out = [];
  for (let i = 0; i < columns; i += 1) {
    const row = [];
    for (let j = 0; j < rows; j += 1) {
      row.push(smooshed[(j * columns) + i]);
    }
    out.push(row);
  }
  return out;
}

// export function mergeObjects (...objs) {
//   if (objs.length < 1) {
//     return {};
//   }
//   if (objs.length > 2) {
//     return objs.reduce(mergeObjects);
//   }
//   if (objs.length === 1) {
//     const out = {};
//     for (const [k, v] of Object.entries(objs[0])) {
//       if (typeof v !== 'undefined' && v !== null) {
//         out[k] = v;
//       }
//     }
//     return out;
//   }
//   const [a, b] = objs;
//   const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
//   const out = {};
//   for (const key of keys.values()) {
//     const va = a[key];
//     const ta = typeof va;
//     const vb = b[key];
//     const tb = typeof vb;
//     if (ta === 'undefined' || va === null) {
//       if (tb === 'undefined' || vb === null) {
//         // omit key from output if both are nullish
//       } else {
//         // coalesce nullish
//         out[key] = vb;
//       }
//     } else if (tb === 'undefined' || vb === null) {
//       // coalesce nullish
//       out[key] = va;
//     } else if (Array.isArray(va)) {
//       if (Array.isArray(vb)) {
//         // concatenate arrays
//         out[key] = va.concat(vb);
//       } else {
//         if (tb === 'object') {
//           throw new TypeError('cannot merge array and object');
//         }
//         if (tb === 'boolean') {
//           throw new TypeError('cannot merge array and boolean');
//         }
//         // a non-boolean scalar is treated as shorthand for a one-element array
//         out[key] = va.concat([vb]);
//       }
//     } else if (Array.isArray(vb)) {
//       if (ta === 'object') {
//         throw new TypeError('cannot merge object and array');
//       }
//       if (ta === 'boolean') {
//         throw new TypeError('cannot merge boolean and array');
//       }
//       // a non-boolean scalar is treated as shorthand for a one-element array
//       out[key] = [va].concat(vb);
//     } else if (ta === 'boolean') {
//       if (tb === 'boolean') {
//         if (va !== vb) {
//           throw new Error('cannot merge conflicting booleans');
//         }
//         // coalesce equal booleans
//         out[key] = va;
//       } else {
//         throw new TypeError('cannot merge boolean and non-boolean');
//       }
//     } else if (tb === 'boolean') {
//       throw new TypeError('cannot merge non-boolean and boolean');
//     } else if (ta === 'object') {
//       if (tb === 'object') {
//         // recurse to merge objects by key
//         out[key] = mergeObjects(va, vb);
//       } else {
//         throw new TypeError('cannot merge scalar and object');
//       }
//     } else if (tb === 'object') { // eslint-disable-line no-negated-condition
//       throw new TypeError('cannot merge object and scalar');
//     } else {
//       // a non-boolean scalar is treated as shorthand for a one-element array
//       out[key] = [va, vb];
//     }
//   }
//   return out;
}
