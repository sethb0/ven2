/* eslint camelcase: off, no-console: off */
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import mkdirpAsync from 'mkdirp';
import opn from 'opn';
import path from 'path';
import { promisify } from 'util';
import qs from 'querystring';
import superagent from 'superagent';
import uid from 'uid-safe';
import url from 'url';

const mkdirp = promisify(mkdirpAsync);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const DEFAULT_CLIENT_ID
  = '128365878015-oge3eeois1a8gk3h3t2tqh1erpd3l6ji.apps.googleusercontent.com';
const DEFAULT_CLIENT_SECRET = 'DJaScQw8kEQ2z-Hq7j-Grdn_';
const DISCOVERY_URI = 'https://accounts.google.com/.well-known/openid-configuration';
const REDIRECT_URI = 'http://[::1]';
const SCOPES
  = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents';

let debug = false;

export default async function (argv) {
  debug = argv.debug;
  const discovery = await superagent
    .get(DISCOVERY_URI)
    .accept('json')
    .timeout({ deadline: 5000 })
    .then((result) => result.body)
    .catch(transformError('retrieve discovery document'));
  const secrets = await readFile(path.join(argv.configDir, 'client_secret.json'), 'utf8')
    .then((j) => JSON.parse(j).installed)
    .catch((e) => {
      transformError('fetch client secret')(e)
        .catch(warn);
      return {
        client_id: DEFAULT_CLIENT_ID,
        client_secret: DEFAULT_CLIENT_SECRET,
      };
    });
  let { user } = argv;
  const currentUserFile = path.join(argv.configDir, 'current-user');
  let currentUser = await readFile(currentUserFile, 'utf8')
    .catch((e) => {
      transformError('determine most recent user')(e)
        .catch(warn);
    });
  if (currentUser && currentUser.endsWith('\n')) {
    currentUser = currentUser.slice(0, -1);
  }
  if (!user) {
    if (!currentUser) {
      throw new Error('Cannot determine which user to log in, please specify a user');
    }
    user = currentUser;
  }
  const tokenFile = path.join(argv.configDir, 'access-tokens.json');
  const tokens = await readFile(tokenFile, 'utf8')
    .then(JSON.parse)
    .catch((e) => {
      transformError('fetch stored tokens')(e)
        .catch(warn);
      return {};
    });
  let dirMade = false;
  let { accessToken, expiresAt, refreshToken } = tokens[user] || {};
  if (argv.force || !accessToken || expiresAt <= Date.now() - 300000) { // min 5 minutes to live
    let refreshed = false;
    if (refreshToken) {
      try {
        const x = await refreshAccessToken({
          user, secrets, discovery, refreshToken,
        });
        accessToken = x.accessToken;
        expiresAt = x.expiresAt;
        refreshed = true;
      } catch (err) {
        warn(err);
      }
    }
    if (!refreshed) {
      const x = await getNewTokens({
        user, secrets, discovery,
      });
      accessToken = x.accessToken;
      expiresAt = x.expiresAt;
      refreshToken = x.refreshToken;
    }
    tokens[user] = {
      accessToken, expiresAt, refreshToken,
    };
    await mkdirp(argv.configDir);
    dirMade = true;
    await writeFile(tokenFile, JSON.stringify(tokens), { mode: 0o600 });
  }
  if (user !== currentUser) {
    if (!dirMade) {
      await mkdirp(argv.configDir);
    }
    await writeFile(currentUserFile, user);
  }
  return `User ${user} logged in`;
}

async function refreshAccessToken ({ secrets, discovery, refreshToken }) {
  return superagent
    .post(discovery.token_endpoint)
    .accept('json')
    .type('form')
    .send({
      refresh_token: refreshToken,
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
      grant_type: 'refresh_token',
    })
    .then((x) => {
      if (debug) {
        console.log(x.body);
      }
      return x;
    })
    .then((result) => ({
      accessToken: result.body.access_token,
      expiresAt: Date.now() + (result.body.expiresIn * 1000),
    }))
    .catch(transformError('refresh access token'));
}

async function getNewTokens ({ user, secrets, discovery }) {
  const trying = {};
  const server = createServer(trying);
  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('listening', () => {
      server.removeListener('error', reject);
      resolve(server.address().port);
    });
    server.listen(0, '::1');
  });
  const redirectUri = `${REDIRECT_URI}:${port}`;
  const { code, verifier } = await requestCode({
    user, trying, secrets, discovery, redirectUri,
  })
    .catch((err) => {
      server.close();
      throw err;
    });
  return superagent
    .post(discovery.token_endpoint)
    .accept('json')
    .type('form')
    .send({
      code,
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    })
    .then((x) => {
      if (debug) {
        console.log(x.body);
      }
      return x;
    })
    .then((result) => ({
      accessToken: result.body.access_token,
      refreshToken: result.body.refresh_token,
      expiresAt: Date.now() + (result.body.expires_in * 1000),
    }))
    .catch((e) => {
      transformError('retrieve access token')(e);
    });
}

class AbortError extends Error {}

function createServer (trying) {
  const server = http.createServer((req, res) => {
    try {
      if (req.method === 'GET') {
        const parsedUrl = url.parse(req.url, true);
        if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
          const state = parsedUrl.query.state;
          const code = parsedUrl.query.code;
          const error = parsedUrl.query.error;
          const errorMessage = parsedUrl.query.error_message;
          if (state && (code || error)) {
            const { re, verifier } = trying[state];
            if (re) {
              if (code) {
                re.solve({ code, verifier });
              } else {
                re.ject(new Error(errorMessage || error));
              }
              for (const [k, v] of Object.entries(trying)) {
                delete trying[k];
                if (k !== state) {
                  v.ject(new AbortError('aborted'));
                }
              }
              res.statusCode = 200;
              res.end('You may close this browser tab.');
              server.close();
              return;
            }
          }
          res.statusCode = 400;
        } else {
          res.statusCode = 404;
        }
      } else if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'GET, OPTIONS');
        res.statusCode = 204;
      } else {
        res.statusCode = 405;
      }
    } catch (err) {
      warn(err);
      res.statusCode = 500;
    }
    res.end();
  });
  return server;
}

async function requestCode ({ user, redirectUri, trying, secrets, discovery }) {
  const [state, verifier] = await Promise.all([uid(24), uid(48)]);
  const hasher = crypto.createHash('sha256');
  hasher.update(verifier, 'ascii');
  const challenge = hasher.digest('base64')
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')
    .replace(/(?:)=/gu, '');
  const re = {};
  const timeout = setTimeout(() => {
    re.ject(new Error('Timed out waiting for user response'));
  }, 30000);
  const p = new Promise((resolve, reject) => {
    re.solve = (x) => {
      clearTimeout(timeout);
      resolve(x);
    };
    re.ject = (e) => {
      clearTimeout(timeout);
      reject(e);
    };
  });
  trying[state] = { re, verifier };
  const queryParts = {
    client_id: secrets.client_id,
    response_type: 'code',
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  };
  if (user) {
    queryParts.login_hint = user;
  }
  await opn(
    `${discovery.authorization_endpoint}?${qs.stringify(queryParts)}`,
    { wait: false },
  );
  return p;
}

function transformError (action) {
  return async (err) => {
    if (err.status) {
      const message = (err.body && err.body.error)
        || http.STATUS_CODES[err.status];
      throw new Error(`Could not ${action}: ${err.status} ${message}`);
    }
    if (err.timeout) {
      throw new Error(`Timed out waiting to ${action}`);
    }
    throw err;
  };
}

function warn (e) {
  if (debug) {
    console.warn(`Warning: ${e.message}`);
  }
}
