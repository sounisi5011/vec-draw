import { parse } from './parser';
import * as AST from './parser/dsl.type';
import ast2vnode from './compiler/ast-to-vnode';
import vnode2str from './compiler/vnode-to-str';

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

    return vnode2str(vnode);
}

export function parser(text: string): AST.StatementValueNode[] {
    return parse(text);
}

export * from './error';
