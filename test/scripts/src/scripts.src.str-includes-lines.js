const test = require('ava');
const strIncludesLines = require('../../../scripts/src/str-includes-lines.js');

test('複数行の一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2\n' +
    'line3';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('複数行の不一致：行頭文字の欠落', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'ine2\n' +
    'line3';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('複数行の不一致：行末文字の欠落', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2\n' +
    'line';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('複数行の不一致：異なる改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2\r\n' +
    'line3';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('複数行の一致：行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2\n' +
    'line3\n';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('複数行の不一致：行頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line2\n' +
    'line3';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('単一行の不一致：行の不一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('単一行の一致：行の一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('単一行の一致：行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line2\n';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('単一行の不一致：行頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line2';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('先頭行の一致：行の一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line1';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('先頭行の一致：行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line1\n';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('先頭行の不一致：行頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line1';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('最終行の一致：行の一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line4';
  t.is(strIncludesLines(inputLines, searchString), true);
});

test('最終行の不一致：行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    'line4\n';
  t.is(strIncludesLines(inputLines, searchString), false);
});

test('最終行の不一致：行頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line4';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行付き最終行の一致：行の一致', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n' +
    'line5\n';
  // prettier-ignore
  const searchString =
    'line5';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('改行付き最終行の一致：行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n' +
    'line5\n';
  // prettier-ignore
  const searchString =
    'line5\n';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('改行付き最終行の不一致：異なる行末の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n' +
    'line5\n';
  // prettier-ignore
  const searchString =
    'line5\r';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行付き最終行の不一致：異なる行末の改行コード（CRLF）', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n' +
    'line5\r\n';
  // prettier-ignore
  const searchString =
    'line5\r';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行付き最終行の不一致：行頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n' +
    'line5\n';
  // prettier-ignore
  const searchString =
    '\n' +
    'line5';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行付き先頭行の一致：行の一致', t => {
  // prettier-ignore
  const inputLines =
    '\n' +
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line1';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('改行付き先頭行の不一致：異なる先頭の改行コード', t => {
  // prettier-ignore
  const inputLines =
    '\r' +
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line1';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行付き先頭行の不一致：異なる先頭の改行コード（CRLF）', t => {
  // prettier-ignore
  const inputLines =
    '\r\n' +
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line1';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('改行開始単一行の不一致：前に非空の行', t => {
  // prettier-ignore
  const inputLines =
    'line0\n' +
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '\n' +
    'line1';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('空行の不一致：空行が存在しない', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('空行の一致：最終行に空行が存在', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    'line3\n' +
    'line4\n';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('空行の一致：途中の行に空行が存在', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\n' +
    '\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('空行の不一致：空行が存在しない（CRLF）', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\r\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), false);
});

test('空行の一致：途中の行に空行が存在（CRLF）', t => {
  // prettier-ignore
  const inputLines =
    'line1\n' +
    'line2\r\n' +
    '\r\n' +
    'line3\n' +
    'line4';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), true);
});

test('空行の一致：空文字列は空行とみなす', t => {
  // prettier-ignore
  const inputLines =
    '';
  // prettier-ignore
  const searchString =
    '';

  t.is(strIncludesLines(inputLines, searchString), true);
});
