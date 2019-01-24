const path = require('path');
const branch = require('git-branch');
const consoleMsg = require('./src/console-msg.js');

const SCRIPT_PATH = `./${path.relative(process.cwd(), process.argv[1])}`;
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

let exitCode = 1;
process.on('exit', () => {
  process.exit(exitCode);
});

(async () => {
  exitCode = await (async () => {
    const branchName = await branch();

    if (['master', 'develop'].includes(branchName)) {
      /*
       * master ブランチと develop ブランチへの commit は禁止
       */
      // eslint-disable-next-line no-console
      console.error(
        consoleMsg(
          OUTPUT_PREFIX,
          `${branchName} ブランチへの commit は禁止されています。`,
        ),
      );
      return 1;
    }

    return 0;
  })();
})();
