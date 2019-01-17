'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATE_FILE_LIST = [
  process.argv[2],
  '.gitmessage.txt',
  '.commit-msg',
];
const [ COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1 ] = (process.env.HUSKY_GIT_PARAMS || process.env.GIT_PARAMS || '').split(' ');
const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

const getTemplate = async () => {
  const filelist = [];

  for (const filename of TEMPLATE_FILE_LIST) {
    if (typeof filename !== 'string') {
      continue;
    }

    filelist.push(filename);

    try {
      const filepath = path.resolve(process.cwd(), filename);
      return fs.readFileSync(filepath).toString();
    } catch(error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  console.error(`${OUTPUT_PREFIX}[!] Could not find commit template files at ${filelist.join(', ')}`);
  process.exit();
};

(async () => {
  try {
    const msgFilePath = path.resolve(process.cwd(), COMMIT_MSG_FILE);
    const existing = fs.readFileSync(msgFilePath).toString();
    const templateText = await getTemplate();

    if (existing.substr(0, templateText.length) === templateText && /^[\r\n]$/.test(existing.charAt(templateText.length))) {
      console.log(`${OUTPUT_PREFIX}Commit template was duplicated`);
    } else {
      try {
        fs.writeFileSync(msgFilePath, `${templateText}\n\n${existing}`);
        console.log(`${OUTPUT_PREFIX}Commit template inserted`);
      } catch(error) {
        console.error(`${OUTPUT_PREFIX}[!] COMMIT_MSG_FILE can't write`);
        console.log(await getTemplate());
      }
    }
  } catch(error) {
    console.error(`${OUTPUT_PREFIX}[!] COMMIT_MSG_FILE is not found`);
    console.log(OUTPUT_PREFIX + await getTemplate());
  }
})();
