import * as Unist from 'unist';

import { AST } from '../../parser';
import VNode from '../../vnode';

function findFirstChildNode(
    node: Unist.Parent,
    expectedObject: { type: 'coord' },
): AST.CoordNode | undefined;
function findFirstChildNode(
    node: Unist.Parent,
    expectedObject: { type: 'size' },
): AST.SizeNode | undefined;
function findFirstChildNode(
    node: Unist.Parent,
    expectedObject: { type: 'angle' },
): AST.AngleNode | undefined;
function findFirstChildNode(
    node: Unist.Parent,
    expectedObject: object,
): Unist.Node | undefined {
    const expectedEntries = Object.entries(expectedObject);
    return node.children.find(
        childNode =>
            childNode && expectedEntries.every(([k, v]) => v === childNode[k]),
    );
}

interface DoublyLinkedList<T> {
    prev: T | undefined;
    value: T;
    next: T | undefined;
}

function array2doublyLinkedList<T>(array: T[]): (DoublyLinkedList<T>)[] {
    return array.map((val, index, arr) => ({
        prev: arr[index - 1],
        value: val,
        next: arr[index + 1],
    }));
}

function isObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === 'object' && value !== null;
}

function isNode(value: unknown): value is Unist.Node {
    return isObject(value) && typeof value.type === 'string';
}

function isStatementNode(
    node: AST.StatementValueNode,
    statementName: null | string | string[] = null,
): node is AST.StatementNode {
    if (node.type === 'statement') {
        if (statementName === null) {
            return true;
        }
        if (typeof statementName === 'string') {
            return node.name === statementName;
        }
        if (Array.isArray(statementName)) {
            return statementName.includes(node.name);
        }
    }
    return false;
}

function isCoordNode(value: unknown): value is AST.CoordNode {
    return isNode(value) && value.type === 'coord';
}

function isSymbolNode(value: unknown): value is AST.SymbolNode {
    return isNode(value) && value.type === 'symbol';
}

export function rect(statementNode: AST.StatementNode): VNode {
    const attrs: { [key: string]: string } = {};

    const coordNode = findFirstChildNode(statementNode, { type: 'coord' });
    if (coordNode) {
        ({ x: attrs.x, y: attrs.y } = coordNode.value);
    }

    const sizeNode = findFirstChildNode(statementNode, { type: 'size' });
    if (sizeNode) {
        ({ width: attrs.width, height: attrs.height } = sizeNode.value);
    }

    return {
        type: 'element',
        tagName: 'rect',
        properties: attrs,
        children: [],
    };
}

export function path(statementNode: AST.StatementNode): VNode {
    const attrs: { [key: string]: string } = {};

    const dataChildren = statementNode.children.filter(childNode =>
        /^(?:coord|statement)$/.test(childNode.type),
    );
    const dataLinkedList = array2doublyLinkedList(dataChildren);

    attrs.d = dataLinkedList
        .map(({ prev: prevNode, value: childNode, next: nextNode }) => {
            if (isCoordNode(childNode)) {
                const coordNode = childNode;
                if (
                    !prevNode ||
                    isStatementNode(prevNode, ['close', 'circle', 'ellipse'])
                ) {
                    return `M ${coordNode.value.x} ${coordNode.value.y}`;
                }
            } else if (isStatementNode(childNode, 'line')) {
                if (isCoordNode(nextNode)) {
                    const stopCoordNode = nextNode;
                    const stopCoord = `${stopCoordNode.value.x} ${
                        stopCoordNode.value.y
                    }`;

                    return `L ${stopCoord}`;
                }
            } else if (isStatementNode(childNode, 'close')) {
                return 'Z';
            } else if (isStatementNode(childNode, 'bezCurve')) {
                if (isCoordNode(nextNode)) {
                    const coordList = childNode.children
                        .filter(isCoordNode)
                        .map(
                            coordNode =>
                                `${coordNode.value.x} ${coordNode.value.y}`,
                        );

                    const stopCoordNode = nextNode;
                    const stopCoord = `${stopCoordNode.value.x} ${
                        stopCoordNode.value.y
                    }`;

                    if (coordList.length === 1) {
                        return `Q ${coordList[0]} ${stopCoord}`;
                    }
                    if (coordList.length === 2) {
                        return `C ${coordList[0]} ${coordList[1]} ${stopCoord}`;
                    }
                    // TODO: 2以上の制御点を有するn次ベジェ曲線の生成
                }
            } else if (isStatementNode(childNode, 'arc')) {
                if (isCoordNode(nextNode)) {
                    const sizeNode = findFirstChildNode(childNode, {
                        type: 'size',
                    });
                    // TODO: サイズ指定が省略されたarc文の動作をキチンと定義する
                    const [rx, ry] = sizeNode
                        ? [
                              Number(sizeNode.value.width) / 2,
                              Number(sizeNode.value.height) / 2,
                          ]
                        : [0, 0];
                    const radiusSize = `${rx} ${ry}`;

                    const angleNode = findFirstChildNode(childNode, {
                        type: 'angle',
                    });
                    const xAxisRotation = angleNode ? angleNode.value : 0;

                    const sizeAttrValueNode = childNode.attributes.size;
                    // TODO: sizeAttrValueNodeがSymbol-type Valueではない場合のエラー処理
                    const largeArcFlag =
                        isSymbolNode(sizeAttrValueNode) &&
                        sizeAttrValueNode.value === 'large'
                            ? 1
                            : 0;

                    const dirAttrValueNode = childNode.attributes.dir;
                    // TODO: dirAttrValueNodeがSymbol-type Valueではない場合のエラー処理
                    const sweepFlag =
                        isSymbolNode(dirAttrValueNode) &&
                        /^(?:turn-left|clockwise)$/.test(dirAttrValueNode.value)
                            ? 1
                            : 0;

                    const stopCoordNode = nextNode;
                    const stopCoord = `${stopCoordNode.value.x} ${
                        stopCoordNode.value.y
                    }`;

                    return (
                        `A ${radiusSize}\n` +
                        `  ${xAxisRotation}\n` +
                        `  ${largeArcFlag} ${sweepFlag}\n` +
                        `  ${stopCoord}`
                    );
                }
            } else if (isStatementNode(childNode, ['circle', 'ellipse'])) {
                // TODO: 開始座標（prevNode）が省略されたcircle,ellipse文の動作をキチンと定義する
                if (isCoordNode(prevNode)) {
                    const currentCoordNode = prevNode;
                    const currentCoord = `${currentCoordNode.value.x} ${
                        currentCoordNode.value.y
                    }`;

                    const diagonalCoordNode = findFirstChildNode(childNode, {
                        type: 'coord',
                    });
                    // TODO: 対角位置の座標（diagonalCoordNode）が省略されたcircle,ellipse文の動作をキチンと定義する
                    if (diagonalCoordNode) {
                        const diagonalCoord = `${diagonalCoordNode.value.x} ${
                            diagonalCoordNode.value.y
                        }`;

                        const pathRotateAttrValueNode =
                            childNode.attributes['path-rotate'];

                        const width = Math.abs(
                            Number(diagonalCoordNode.value.x) -
                                Number(currentCoordNode.value.x),
                        );
                        const height = Math.abs(
                            Number(diagonalCoordNode.value.y) -
                                Number(currentCoordNode.value.y),
                        );
                        // TODO: pathRotateAttrValueNodeがSymbol-type Valueではない場合のエラー処理
                        const sweepFlag =
                            isSymbolNode(pathRotateAttrValueNode) &&
                            /^(?:turn-left|clockwise)$/.test(
                                pathRotateAttrValueNode.value,
                            )
                                ? 1
                                : 0;

                        if (isStatementNode(childNode, 'circle')) {
                            const diameter = Math.sqrt(
                                width ** 2 + height ** 2,
                            );
                            const radius = diameter / 2;
                            const radiusSize = `${radius} ${radius}`;

                            return (
                                `A ${radiusSize}\n` +
                                `  0\n` +
                                `  0 ${sweepFlag}\n` +
                                `  ${diagonalCoord}\n` +
                                `A ${radiusSize}\n` +
                                `  0\n` +
                                `  0 ${sweepFlag}\n` +
                                `  ${currentCoord}`
                            );
                        }
                        if (isStatementNode(childNode, 'ellipse')) {
                            const sizeNode = findFirstChildNode(childNode, {
                                type: 'size',
                            });

                            // TODO: 楕円の大きさの比率（sizeNode）が省略されたellipse文の動作をキチンと定義する
                            // TODO: もっとちゃんとした式に変える
                            const {
                                width: xRatioStr,
                                height: yRatioStr,
                            } = sizeNode
                                ? sizeNode.value
                                : { width: '1', height: '1' };
                            const [xRatio, yRatio] = [
                                Number(xRatioStr),
                                Number(yRatioStr),
                            ];
                            const [rx, ry] = (() => {
                                if (height === 0) {
                                    return [
                                        width / xRatio,
                                        (width / xRatio) * yRatio,
                                    ];
                                }
                                if (width === 0) {
                                    return [
                                        height / yRatio,
                                        (height / yRatio) * xRatio,
                                    ];
                                }
                                return [NaN, NaN];
                            })().map(num => num / 2);
                            const radiusSize = `${rx} ${ry}`;

                            return (
                                `A ${radiusSize}\n` +
                                `  0\n` +
                                `  0 ${sweepFlag}\n` +
                                `  ${diagonalCoord}\n` +
                                `A ${radiusSize}\n` +
                                `  0\n` +
                                `  0 ${sweepFlag}\n` +
                                `  ${currentCoord}`
                            );
                        }
                    }
                }
            }

            return null;
        })
        .filter(Boolean)
        .join('\n');

    return {
        type: 'element',
        tagName: 'path',
        properties: attrs,
        children: [],
    };
}
