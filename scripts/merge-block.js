'use strict';

const fs = require('fs');
const path = require('path');

const [ COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1 ] = (process.env.HUSKY_GIT_PARAMS || process.env.GIT_PARAMS || '').split(' ');
const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

console.log(`${OUTPUT_PREFIX}start`);

console.log({ COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1 });

if (COMMIT_SOURCE === 'merge') {
  try {
    const msgFilePath = path.resolve(process.cwd(), COMMIT_MSG_FILE);
    const commitMsg = fs.readFileSync(msgFilePath).toString();

    console.log(
      commitMsg.split(/\r\n?|\n/)
        .filter(line => !/^#/.test(line))
        .join('\n')
    );
  } catch(e) {
    
  }
}

process.on('exit', function() {
  console.log(`${OUTPUT_PREFIX}exit`);
//   process.exit(1);
});
