import test from 'ava';
import { readFile } from 'fs';
import unified from 'unified';
import { promisify } from 'util';
import {
    compile,
    unifiedParser,
    unifiedAst2vnode,
    unifiedVnodeStringify,
} from '../../src/index';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir(__dirname);
});

test('unifiedによるコンパイルの出力確認', async t => {
    const dslText = await readFileAsync(
        '../compile/path/single-path.vec-draw',
        'utf-8',
    );
    const defaultSVG = compile(dslText);
    const unifiedSVG = String(
        await unified()
            .use(unifiedParser)
            .use(unifiedAst2vnode)
            .use(unifiedVnodeStringify)
            .process(dslText),
    );
    t.is(defaultSVG, unifiedSVG);
});
