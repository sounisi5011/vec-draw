import test from 'ava';
import { readFile } from 'fs';
import { promisify } from 'util';
import { compile } from '../../../src';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir(__dirname);
});

test('空のSVG', async t => {
    const srcText = await readFileAsync('empty.vec-draw', 'utf-8');
    const destText = await readFileAsync('empty.svg', 'utf-8');

    t.is(compile(srcText), destText);
});
