'use strict';

const fs = require('fs');
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

  /*
   * git hookの引数にファイルパスが含まれている場合は、ファイルの内容を表示する
   */
  ...(process.env.HUSKY_GIT_PARAMS || '').split(/ +/)
    .map(param => {
      try {
        if (param !== '') {
          const filePath = path.resolve(process.cwd(), param);
          const fileStr = fs.readFileSync(filePath, { encoding: 'utf-8' });
          return `file:./${param}:\n${fileStr.replace(/^/mg, '  > ')}`;
        }
      } catch(err) {}
      return null;
    })
    .filter(data => data !== null),
  '',
].join('\n'), 4));
