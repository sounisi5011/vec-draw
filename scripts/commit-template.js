'use strict';

const fs = require('fs');
const path = require('path');
const strIncludesLines = require('./src/str-includes-lines.js');
const consoleMsg = require('./src/console-msg.js');

const TEMPLATE_FILE_LIST = [process.argv[2], '.gitmessage.txt', '.commit-msg'];
const [COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1] = (
  process.env.HUSKY_GIT_PARAMS ||
  process.env.GIT_PARAMS ||
  ''
).split(' ');
const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;
const DEFAULT_COMMENT_REGEXP = /(^|[\r\n])((?=# Please enter the commit message)(?:#[^\r\n]*(?:\r\n?|\n))+$)/;

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
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  console.error(
    consoleMsg(
      OUTPUT_PREFIX,
      `Could not find commit template files at ${filelist.join(', ')}`,
    ),
  );
  process.exit();
};

(async () => {
  try {
    const msgFilePath = path.resolve(process.cwd(), COMMIT_MSG_FILE);
    const existingText = fs.readFileSync(msgFilePath).toString();
    const templateText = await getTemplate();

    const defaultCommentMatch = DEFAULT_COMMENT_REGEXP.exec(existingText);
    if (defaultCommentMatch) {
      if (strIncludesLines(existingText, templateText)) {
        console.log(consoleMsg(OUTPUT_PREFIX, 'Commit template is duplicated'));
      } else {
        const defaultCommitComment = defaultCommentMatch[2];
        const existingCommitMessage = existingText.substr(
          0,
          defaultCommentMatch.index + defaultCommentMatch[1].length,
        );
        const newCommitMessage =
          existingCommitMessage.replace(/[^\r\n]$/, '$&\n') +
          templateText
            .replace(/[^\r\n]$/, '$&\n')
            .replace(/[^\r\n](?:\r\n?|\n)$/, '$&\n') +
          defaultCommitComment;

        try {
          fs.writeFileSync(msgFilePath, newCommitMessage);
          console.log(consoleMsg(OUTPUT_PREFIX, 'Commit template inserted'));
        } catch (error) {
          console.error(
            consoleMsg(OUTPUT_PREFIX, `${COMMIT_MSG_FILE} can't write\n`) +
              `${(await getTemplate()).replace(/^/gm, '    │ ')}`,
          );
        }
      }
    }
  } catch (error) {
    console.error(
      consoleMsg(OUTPUT_PREFIX, `${COMMIT_MSG_FILE} is not found\n`) +
        `${(await getTemplate()).replace(/^/gm, '    │ ')}`,
    );
  }
})();
