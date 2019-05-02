import * as statementNode2vnodeMap from './ast-to-vnode/statements';
import { AST } from '../parser';
import VNode, { isVNode } from '../vnode';

function isStatementNode(
    node: AST.StatementValueNode,
): node is AST.StatementNode {
    return node.type === 'statement';
}

function astChildren2vnodeList(children: AST.StatementValueNode[]): VNode[] {
    return children
        .filter(isStatementNode)
        .map(
            (statementNode): unknown | null => {
                const statementNode2vnode = (statementNode2vnodeMap as {
                    [key: string]: unknown;
                })[statementNode.name];
                if (typeof statementNode2vnode === 'function') {
                    return statementNode2vnode(statementNode);
                }
                return null;
            },
        )
        .filter(isVNode);
}

export default function ast2vnode(ast: AST.RootNode): VNode {
    const rootElem: VNode = {
        type: 'element',
        tagName: 'svg',
        properties: {
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg',
        },
        children: [],
    };

    rootElem.children = astChildren2vnodeList(ast.children);

    return rootElem;
}
