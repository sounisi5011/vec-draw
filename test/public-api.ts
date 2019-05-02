import test from 'ava';
import * as api from '../src/index';

test('公開APIの存在検証', t => {
    const apiNameList = [
        'compile',
        'parser',
        'ast2vnode',
        'vnodeStringify',
        'unifiedParser',
        'unifiedAst2vnode',
        'unifiedVnodeStringify',
        'BaseError',
        'IndentationError',
        'SyntaxError',
        'XMLError',
    ];

    t.deepEqual(apiNameList.sort(), Object.keys(api).sort());
});

test('compile関数の型チェック', t => {
    t.is(typeof api.compile, 'function');
});
