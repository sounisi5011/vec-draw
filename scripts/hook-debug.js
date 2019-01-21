'use strict';

const path = require('path');
const indent = require('./src/indent.js');

const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);

console.log(`${SCRIPT_PATH}:`);
console.log(indent([
  'argv:',
  indent(JSON.stringify(process.argv, null, 2)),
  ...['HUSKY_GIT_PARAMS', 'HUSKY_GIT_STDIN']
    .map(name => (
      `env.${name}:\n` +
      indent(JSON.stringify(process.env[name], null, 2))
    )),
  '',
].join('\n'), 4));
