import unified from 'unified';
import { parse, AST } from './parser';
import ast2vnode from './compiler/ast-to-vnode';
import vnodeStringify from './vnode/stringify';
import { isVNode } from './vnode';
import { VFileCompatible2text } from './utils/unified';

/**
 * @param {string} text 変換するvec-draw DSLの文字列
 * @return {string} 生成したSVG
 */
export function compile(text: string): string {
    /*
     * vec-draw DSLを解析し、定義文ごとに処理を行う
     */
    const ast = parse(text);

    const vnode = ast2vnode(ast);

    return vnodeStringify(vnode);
}

export { parse as parser, ast2vnode, vnodeStringify };

const unifiedParser: unified.Plugin = function unifiedParser(): void {
    this.Parser = file => {
        return parse(VFileCompatible2text(file));
    };
};

const unifiedAst2vnode: unified.Plugin = function unifiedAst2vnode(): unified.Transformer {
    return node => {
        if (AST.isRootNode(node)) {
            return ast2vnode(node);
        }
        return new Error('Argument node is not AST.RootNode');
    };
};

const unifiedVnodeStringify: unified.Plugin = function unifiedVnodeStringify(): void {
    this.Compiler = node => (isVNode(node) ? vnodeStringify(node) : '');
};

export { unifiedParser, unifiedAst2vnode, unifiedVnodeStringify };

export * from './error';
