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

export interface StatementNode extends Parent {
    type: 'statement';
    name: string;
    nameSymbol: SymbolNode;
    attributes: { [key: string]: ValueNode };
    attributeNodes: { [key: string]: AttributeNode };
    children: Exclude<StatementValueNode, AttributeNode | CommentNode>[];
    fullChildren: StatementValueNode[];
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
