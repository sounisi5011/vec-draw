import test from 'ava';
import { readFile } from 'fs';
import { promisify } from 'util';
import { compile } from '../src/index';

const readFileAsync = promisify(readFile);

test.before(() => {
  process.chdir('./test/');
});

test('空のSVG', async t => {
  const srcText = await readFileAsync('assets/empty.vec-draw', 'utf-8');
  const destText = await readFileAsync('assets/empty.svg', 'utf-8');

  t.is(compile(srcText), destText);
});
