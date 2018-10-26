#!/usr/bin/env node
'use strict';

const { loadSync } = require('@sethb0/yaml-utils');
const fs = require('fs');
const yargs = require('yargs');

const argv = yargs
  .usage('$0 <in> <out>')
  .demandCommand(2)
  .argv;

fs.writeFileSync(argv._[1], JSON.stringify(loadSync(argv._[0])));
