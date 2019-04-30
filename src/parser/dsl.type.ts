function filterNullable<T>(value: T): value is Exclude<T, null | undefined> {
    return value !== null && value !== undefined;
}

export interface Node {
    type: string;
    position: Position;
}

export interface Parent extends Node {
    children: Node[];
}

export interface Literal extends Node {
    value: unknown;
}

export interface Point {
    offset: number;
    line: number;
    column: number;
}

export interface Position {
    start: Point;
    end: Point;
}

export function createRootNode(
    ...children: (StatementValueNode | null)[]
): StatementValueNode[] {
    return children.filter(filterNullable);
}

export interface StatementNode extends Parent {
    type: 'statement';
    name: string;
    nameSymbol: SymbolNode;
    attributes: StatementAttributes;
    attributeNodes: StatementAttributeNodes;
    children: Exclude<StatementValueNode, AttributeNode | CommentNode>[];
    fullChildren: StatementValueNode[];
}

export function createStatementNode(
    position: Position,
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

export interface AttributeNode extends Literal {
    type: 'attr';
    name: string;
    nameSymbol: SymbolNode;
    value: ValueNode;
}

export function createAttributeNode(
    position: Position,
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

export interface CoordNode extends Literal {
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
    position: Position,
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

export interface SizeNode extends Literal {
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
    position: Position,
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

export interface AngleNode extends Literal {
    type: 'angle';
    value: string;
    valueNode: NumberNode;
    unit: string;
}

export interface NumberNode extends Literal {
    type: 'number';
    value: string;
    rawValue: string;
}

export interface SymbolNode extends Literal {
    type: 'symbol';
    value: string;
}

export interface CommentNode extends Literal {
    type: 'comment';
    value: string;
}

export interface TextNode extends Literal {
    type: 'text';
    value: string;
}

export interface XMLNode extends Node {
    type: 'xml';
    content: TextNode | CommentNode | ElementNode;
}

export interface ElementNode extends Parent {
    type: 'element';
    tagName: string;
    properties: ElementProperties;
    children: (TextNode | CommentNode | ElementNode)[];
}

export interface ElementProperties {
    [key: string]: ElementPropertyValue;
}

export type ElementPropertyValue = string;
