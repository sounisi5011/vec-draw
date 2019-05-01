import test from 'ava';
import { readFile } from 'fs';
import unified from 'unified';
import { promisify } from 'util';
import { parser, unifiedParser } from '../../src/index';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir('./test/');
});

test('unifiedで使用するパーサの出力確認', async t => {
    const dslText = await readFileAsync(
        'compile/path/single-path.vec-draw',
        'utf-8',
    );
    const defaultAst = parser(dslText);
    const unifiedAst = unified()
        .use(unifiedParser)
        .parse(dslText);
    t.deepEqual(defaultAst, unifiedAst);
});
