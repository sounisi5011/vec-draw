'use strict';

const path = require('path');

function indent(str, indent='    ', firstIndent=indent) {
  return str.split(/\r\n?|\n/)
    .map((line, index) => (
      (line !== '') ?
      (index === 0 ? firstIndent : indent) + line :
      ''
    ))
    .join("\n");
}

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
          console.error(indent(
            [
              `${branchName} ブランチの push は禁止されています。`,
            ]
              .filter(line => line !== null)
              .join("\n"),
            ' '.repeat(OUTPUT_PREFIX.length),
            OUTPUT_PREFIX
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
