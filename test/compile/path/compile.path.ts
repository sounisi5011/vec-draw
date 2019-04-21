import test from 'ava';
import { readFile } from 'fs';
import { promisify } from 'util';
import { compile } from '../../../src/index';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir('./test/compile/path/');
});

test('単一のpath文の変換', async t => {
    const srcText = await readFileAsync('single-path.vec-draw', 'utf-8');
    const destText = await readFileAsync('single-path.svg', 'utf-8');

    t.is(compile(srcText), destText);
});
