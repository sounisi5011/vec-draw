import test from 'ava';
import { parse } from '../../src/parser';

const newlineCallback = callback => {
  const newlineMap = {
    EMPTY: '',
    LF: '\n',
    CR: '\r',
    CRLF: '\r\n',
  };
  Object.entries(newlineMap).forEach(callback);
};

newlineCallback(([nlName, nlChar]) => {
  const msgSuffix = nlChar ? ` + 改行(${nlName})` : '';

  test(`コメントのみの内容：コメント${msgSuffix}`, async t => {
    t.deepEqual(parse(`--${nlChar}`), []);
  });

  test(`コメントのみの内容：コメント + 空白${msgSuffix}`, async t => {
    t.deepEqual(parse(`-- ${nlChar}`), []);
  });

  test(`コメントのみの内容：コメント + 内容${msgSuffix}`, async t => {
    t.deepEqual(parse(`--42${nlChar}`), []);
  });

  test(`コメントのみの内容：コメント + 空白 + 内容${msgSuffix}`, async t => {
    t.deepEqual(parse(`-- 42${nlChar}`), []);
  });
});
