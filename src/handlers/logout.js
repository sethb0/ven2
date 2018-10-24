/* eslint camelcase: off, no-console: off */
// import fs from 'fs';
// import http from 'http';
// import path from 'path';
// import { promisify } from 'util';
// import superagent from 'superagent';

// const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);

// const DISCOVERY_URI = 'https://accounts.google.com/.well-known/openid-configuration';

// let debug = false;

export default async function (/* argv */) {
  return 'This command is currently disabled.';
  // debug = argv.debug;
  // const discovery = await superagent
  //   .get(DISCOVERY_URI)
  //   .accept('json')
  //   .timeout({ deadline: 5000 })
  //   .then((result) => result.body)
  //   .catch(transformError('retrieve discovery document'));
  // const tokenFile = path.join(argv.configDir, 'access-tokens.json');
  // const tokens = await readFile(tokenFile, 'utf8')
  //   .then(JSON.parse)
  //   .catch((e) => {
  //     transformError('fetch stored tokens')(e)
  //       .catch(warn);
  //   });
  // if (!tokens) {
  //   return 'No users are logged in';
  // }
  // let { user } = argv;
  // const currentUserFile = path.join(argv.configDir, 'current-user');
  // let currentUser = await readFile(currentUserFile, 'utf8')
  //   .catch((e) => {
  //     transformError('determine most recent user')(e)
  //       .catch(warn);
  //   });
  // if (currentUser && currentUser.endsWith('\n')) {
  //   currentUser = currentUser.slice(0, -1);
  // }
  // if (!user) {
  //   if (!currentUser) {
  //     throw new Error('Cannot determine which user to log out, please specify a user');
  //   }
  //   user = currentUser;
  // }
  // const { refreshToken } = tokens[user] || {};
  // if (!refreshToken) {
  //   return `User ${user} was not logged in`;
  // }
  // await revokeToken({ discovery, refreshToken });
  // tokens[user] = undefined; // eslint-disable-line no-undefined
  // await writeFile(tokenFile, JSON.stringify(tokens), { mode: 0o600 });
  // return `User ${user} logged out`;
}

// async function revokeToken ({ discovery, refreshToken }) {
//   return superagent
//     .post(discovery.token_endpoint)
//     .accept('json')
//     .type('form')
//     .send({
//       refresh_token: refreshToken,
//     })
//     .catch(transformError('revoke token'));
// }

// function transformError (action) {
//   return async (err) => {
//     if (err.status) {
//       console.error(err);
//       const message = (err.body && err.body.error)
//         || http.STATUS_CODES[err.status];
//       throw new Error(`Could not ${action}: ${err.status} ${message}`);
//     }
//     if (err.timeout) {
//       throw new Error(`Timed out waiting to ${action}`);
//     }
//     throw err;
//   };
// }

// function warn (e) {
//   if (debug) {
//     console.warn(`Warning: ${e.message}`);
//   }
// }
