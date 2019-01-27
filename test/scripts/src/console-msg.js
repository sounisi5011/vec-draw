const test = require('ava');
const consoleMsg = require('../../../scripts/src/console-msg.js');

test('consoleMsg() / 先頭行以降は字数に合わせてインデント', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3';
  // prettier-ignore
  const outputLines =
    'output: line1\n' +
    '        line2\n' +
    '        line3';

  t.is(consoleMsg('output: ', inputLines), outputLines);
});

test('consoleMsg() / 改行コードは維持', t => {
  // prettier-ignore
  const inputLines =
    'line1\r' +
    'line2\n' +
    'line3\r\n' +
    'line4';
  // prettier-ignore
  const outputLines =
    'test: line1\r' +
    '      line2\n' +
    '      line3\r\n' +
    '      line4';

  t.is(consoleMsg('test: ', inputLines), outputLines);
});

test('consoleMsg() / 空行はインデントしない', t => {
  // prettier-ignore
  const inputLines =
    '42\n' +
    '\n' +
    '42\r' +
    '\r' +
    '\r' +
    '42\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '42\n' +
    '\n' +
    '\n' +
    '\n' +
    '\n' +
    '\n';
  // prettier-ignore
  const outputLines =
    'The answer to life the universe and everything: 42\n' +
    '\n' +
    '                                                42\r' +
    '\r' +
    '\r' +
    '                                                42\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '                                                42\n' +
    '\n' +
    '\n' +
    '\n' +
    '\n' +
    '\n';

  t.is(
    consoleMsg('The answer to life the universe and everything: ', inputLines),
    outputLines,
  );
});
