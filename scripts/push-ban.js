'use strict';

const path = require('path');
const consoleMsg = require('./src/console-msg.js');

const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

const z40 = '0000000000000000000000000000000000000000';

const exitCode = (() => {
  const linesData = (process.env.HUSKY_GIT_STDIN || '')
    .split(/\r\n?|\n/)
    .map(line => line.split(/ +/))
    .filter(data => data.length === 4);

  for (const [local_ref, local_sha, remote_ref, remote_sha] of linesData) {
    if (local_sha === z40) {
      // Handle delete
    } else {
      if (/^refs\/(?!tags\/)[^/]+\//.test(remote_ref)) {
        const branchName = remote_ref.replace(/^refs\/[^/]+\//, '');
        if (/^(master|develop)$/.test(branchName)) {
          console.error(consoleMsg(
            OUTPUT_PREFIX,
            [
              `${branchName} ブランチの push は禁止されています。`,
            ]
          ));
          return 1;
        }
      }
    }
  }

  return 0;
})();

process.on('exit', function() {
  process.exit(exitCode);
});
