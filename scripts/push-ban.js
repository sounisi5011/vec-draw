const path = require('path');
const consoleMsg = require('./src/console-msg.js');

const SCRIPT_PATH = `./${path.relative(process.cwd(), process.argv[1])}`;
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

const z40 = '0000000000000000000000000000000000000000';

process.exitCode = (() => {
  const linesData = (process.env.HUSKY_GIT_STDIN || '')
    .split(/\r\n?|\n/)
    .map(line => line.split(/ +/))
    .filter(data => data.length === 4);

  const isBlocked = linesData.some(([, localSHA, remoteRef]) => {
    if (localSHA === z40) {
      // Handle delete
    } else if (/^refs\/(?!tags\/)[^/]+\//.test(remoteRef)) {
      const branchName = remoteRef.replace(/^refs\/[^/]+\//, '');
      if (/^(master|develop)$/.test(branchName)) {
        // eslint-disable-next-line no-console
        console.error(
          consoleMsg(OUTPUT_PREFIX, [
            `${branchName} ブランチの push は禁止されています。`,
          ]),
        );
        return true;
      }
    }

    return false;
  });

  if (isBlocked) {
    return 1;
  }

  return 0;
})();
