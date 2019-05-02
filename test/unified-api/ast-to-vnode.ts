import test from 'ava';
import { readFile } from 'fs';
import unified from 'unified';
import { promisify } from 'util';
import { parser, ast2vnode, unifiedAst2vnode } from '../../src/index';

const readFileAsync = promisify(readFile);

test.before(() => {
    process.chdir(__dirname);
});

test('unifiedで使用するAST to VNodeの出力確認', async t => {
    const dslText = await readFileAsync(
        '../compile/path/single-path.vec-draw',
        'utf-8',
    );
    const astTree = parser(dslText);

    const defaultVNode = ast2vnode(astTree);
    const unifiedVNode = await unified()
        .use(unifiedAst2vnode)
        .run(astTree);
    t.deepEqual(defaultVNode, unifiedVNode);
});
