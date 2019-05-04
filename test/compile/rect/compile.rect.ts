import test from 'ava';
import { readFile } from 'fs';
import { promisify } from 'util';
import { compile } from '../../../src';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir('./test/compile/rect/');
});

test('単一のrect文の変換', async t => {
    const srcText = await readFileAsync('single-rect.vec-draw', 'utf-8');
    const destText = await readFileAsync('single-rect.svg', 'utf-8');

    t.is(compile(srcText), destText);
});

test('複数のrect文の変換', async t => {
    const srcText = await readFileAsync('multi-rect.vec-draw', 'utf-8');
    const destText = await readFileAsync('multi-rect.svg', 'utf-8');

    t.is(compile(srcText), destText);
});
