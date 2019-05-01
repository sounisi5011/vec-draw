import * as Unist from 'unist';

function filterNullable<T>(value: T): value is Exclude<T, null | undefined> {
    return value !== null && value !== undefined;
}

export function createRootNode(
    ...children: (StatementValueNode | null)[]
): StatementValueNode[] {
    return children.filter(filterNullable);
}

export interface StatementNode extends Unist.Parent {
    type: 'statement';
    name: string;
    nameSymbol: SymbolNode;
    attributes: StatementAttributes;
    attributeNodes: StatementAttributeNodes;
    children: Exclude<StatementValueNode, AttributeNode | CommentNode>[];
    fullChildren: StatementValueNode[];
}

export function createStatementNode(
    position: Unist.Position,
    name: SymbolNode,
    ...allChildren: (StatementValueNode | null | undefined)[]
): StatementNode {
    const fullChildren = allChildren.filter(filterNullable);
    const attributes: StatementAttributes = {};
    const attributeNodes: StatementAttributeNodes = {};
    const children: StatementNode['children'] = [];

    fullChildren.forEach(childNode => {
        if (childNode.type === 'attr') {
            const attrNode = childNode;
            attributes[attrNode.name] = attrNode.value;
            attributeNodes[attrNode.name] = attrNode;
        } else if (childNode.type !== 'comment') {
            children.push(childNode);
        }
    });

    return {
        type: 'statement',
        name: name.value,
        nameSymbol: name,
        attributes,
        attributeNodes,
        children,
        fullChildren,
        position,
    };
}

export interface StatementAttributes {
    [key: string]: ValueNode;
}

export interface StatementAttributeNodes {
    [key: string]: AttributeNode;
}

export type StatementValueNode =
    | CommentNode
    | XMLNode
    | AttributeNode
    | StatementNode
    | ValueNode;

export interface AttributeNode extends Unist.Literal {
    type: 'attr';
    name: string;
    nameSymbol: SymbolNode;
    value: ValueNode;
}

export function createAttributeNode(
    position: Unist.Position,
    name: SymbolNode,
    value: ValueNode,
): AttributeNode {
    return {
        type: 'attr',
        name: name.value,
        nameSymbol: name,
        value,
        position,
    };
}

export type ValueNode =
    | CoordNode
    | SizeNode
    | AngleNode
    | NumberNode
    | SymbolNode;

export interface CoordNode extends Unist.Literal {
    type: 'coord';
    value: {
        x: string;
        y: string;
    };
    valueNode: {
        x: NumberNode;
        y: NumberNode;
    };
}

export function createCoordNode(
    position: Unist.Position,
    x: NumberNode,
    y: NumberNode,
): CoordNode {
    return {
        type: 'coord',
        value: {
            x: x.value,
            y: y.value,
        },
        valueNode: {
            x,
            y,
        },
        position,
    };
}

export interface SizeNode extends Unist.Literal {
    type: 'size';
    value: {
        width: string;
        height: string;
    };
    valueNode: {
        width: NumberNode;
        height: NumberNode;
    };
}

export function createSizeNode(
    position: Unist.Position,
    width: NumberNode,
    height: NumberNode,
): SizeNode {
    return {
        type: 'size',
        value: {
            width: width.value,
            height: height.value,
        },
        valueNode: {
            width,
            height,
        },
        position,
    };
}

export interface AngleNode extends Unist.Literal {
    type: 'angle';
    value: string;
    valueNode: NumberNode;
    unit: string;
}

export function createAngleNode(
    position: Unist.Position,
    value: NumberNode,
    unit: string,
): AngleNode {
    return {
        type: 'angle',
        value: value.value,
        valueNode: value,
        unit: unit.toLowerCase(),
        position,
    };
}

export interface NumberNode extends Unist.Literal {
    type: 'number';
    value: string;
    rawValue: string;
}

export function createNumberNode(
    position: Unist.Position,
    value: string,
): NumberNode {
    return {
        type: 'number',
        value: value.replace(/^\./, '0.'),
        rawValue: value,
        position,
    };
}

export interface SymbolNode extends Unist.Literal {
    type: 'symbol';
    value: string;
}

export function createSymbolNode(
    position: Unist.Position,
    value: string,
): SymbolNode {
    return {
        type: 'symbol',
        value,
        position,
    };
}

export interface CommentNode extends Unist.Literal {
    type: 'comment';
    value: string;
}

export function createCommentNode(
    position: Unist.Position,
    value: string,
): CommentNode {
    return {
        type: 'comment',
        value,
        position,
    };
}

export interface TextNode extends Unist.Literal {
    type: 'text';
    value: string;
}

export function createTextNode(
    position: Unist.Position,
    value: string,
): TextNode {
    return {
        type: 'text',
        value,
        position,
    };
}

export interface XMLNode extends Unist.Node {
    type: 'xml';
    content: TextNode | CommentNode | ElementNode;
}

export function createXMLNode(
    position: Unist.Position,
    contentValue: TextNode | CommentNode | ElementNode,
): XMLNode {
    return {
        type: 'xml',
        content: contentValue,
        position,
    };
}

export interface ElementNode extends Unist.Parent {
    type: 'element';
    tagName: string;
    properties: ElementProperties;
    children: (TextNode | CommentNode | ElementNode)[];
}

export function createElementNode(
    position: Unist.Position,
    nodeName: string,
    attrList: (
        | { name: string; value: ElementPropertyValue }
        | string
        | undefined)[],
    children: ElementNode['children'],
): ElementNode {
    const props: ElementProperties = {};

    attrList.forEach(attr => {
        if (typeof attr === 'object') {
            const { name: attrName, value: attrValue } = attr;
            props[attrName] = attrValue;
        }
    });

    return {
        type: 'element',
        tagName: nodeName,
        properties: props,
        children,
        position,
    };
}

export interface ElementProperties {
    [key: string]: ElementPropertyValue;
}

export type ElementPropertyValue = string;
