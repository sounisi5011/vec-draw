const fs = require('fs');
const path = require('path');
const util = require('util');

const makeDir = require('make-dir');
const pegjs = require('pegjs');
const tspegjs = require('ts-pegjs');

const customHeaderRegExp = /\/\*:header((?:(?!\*\/)[\s\S])+)\*\//g;
const returnTypeRegExp = /\/\/:([^\r\n]+)(?:\r\n?|\n)((?![0-9])[a-zA-Z0-9_]+)/g;

const [fsReadFile, fsWriteFile] = [fs.readFile, fs.writeFile].map(
  util.promisify,
);

function trimNewlines(str) {
  return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}

async function createFile(filepath, contents) {
  await makeDir(path.dirname(filepath));
  await fsWriteFile(filepath, contents);
}

(async () => {
  const inputFullpath = path.resolve(process.argv[2]);
  const outputFullpath =
    process.argv.length > 3
      ? path.resolve(process.argv[3])
      : `${inputFullpath}.ts`;

  const inputContents = await fsReadFile(inputFullpath, 'utf8');

  const customHeaders = [];
  for (;;) {
    const matchResult = customHeaderRegExp.exec(inputContents);
    if (!matchResult) {
      break;
    }
    customHeaders.push(matchResult[1]);
  }
  const customHeaderStr = customHeaders
    .map(trimNewlines)
    .filter(str => str !== '')
    .join('\n\n');

  const returnTypes = {};
  for (;;) {
    const matchResult = returnTypeRegExp.exec(inputContents);
    if (!matchResult) {
      break;
    }

    const outputType = matchResult[1].trim();
    const ruleName = matchResult[2];
    returnTypes[ruleName] = `${outputType} | {}`;
  }

  const options = {
    output: 'source',
    plugins: [tspegjs],
    tspegjs: {
      customHeader: customHeaderStr !== '' ? `${customHeaderStr}\n` : null,
    },
    returnTypes,
  };

  const parser = pegjs.generate(inputContents, options);

  await createFile(outputFullpath, parser);
})();
