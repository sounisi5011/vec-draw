const test = require('ava');
const indent = require('../../../scripts/src/indent.js');

test('空白2文字でインデント', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3';
  // prettier-ignore
  const outputLines =
    '  line1\n' +
    '  line2\n' +
    '  line3';

  t.is(indent(inputLines), outputLines);
});

test('空行はインデントしない', t => {
  // prettier-ignore
  const inputLines =
    'line1\r' +
    '\r' +
    'line2\r\n' +
    '\r\n' +
    '\r\n' +
    'line3\n' +
    '\n' +
    '\n' +
    '\n';
  // prettier-ignore
  const outputLines =
    '  line1\r' +
    '\r' +
    '  line2\r\n' +
    '\r\n' +
    '\r\n' +
    '  line3\n' +
    '\n' +
    '\n' +
    '\n';

  t.is(indent(inputLines), outputLines);
});

test('インデントを数値で指定', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n';
  // prettier-ignore
  const outputLines =
    '    line1\n' +
    '    line2\n' +
    '    line3\n';

  t.is(indent(inputLines, 4), outputLines);
});

test('インデントを文字列で指定', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    '\n' +
    'line2\n' +
    'line3\n' +
    '\n';
  // prettier-ignore
  const outputLines =
    '\tline1\n' +
    '\n' +
    '\tline2\n' +
    '\tline3\n' +
    '\n';

  t.is(indent(inputLines, '\t'), outputLines);
});
