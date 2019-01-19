'use strict';

const path = require('path');
const branch = require('git-branch');

const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

function indent(str, indent='    ', firstIndent=indent) {
  return str.split(/\r\n?|\n/)
    .map((line, index) => (
      (line !== '') ?
      (index === 0 ? firstIndent : indent) + line :
      ''
    ))
    .join('\n');
}

function consoleMsg(msg) {
  return indent(
    Array.isArray(msg) ? msg.filter(line => line !== null).join('\n') : msg,
    ' '.repeat(OUTPUT_PREFIX.length),
    OUTPUT_PREFIX
  );
}

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
      console.error(consoleMsg(`${branchName} ブランチへの commit は禁止されています。`));
      return 1;
    }

    return 0;
  })();
})();
