#!/usr/bin/env node
'use strict';

const { loadSync } = require('@sethb0/yaml-utils');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const argv = yargs
  .usage('$0 <in> <out>')
  .demandCommand(2)
  .argv;
const mapped = argv._.map((x) => path.resolve(__dirname, '..', x));

fs.writeFileSync(mapped[1], JSON.stringify(loadSync(mapped[0])));
