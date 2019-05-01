import * as Unist from 'unist';

export * from 'unist';

export interface StatementNode extends Unist.Parent {
    type: 'statement';
    name: string;
    nameSymbol: SymbolNode;
    attributes: StatementAttributes;
    attributeNodes: StatementAttributeNodes;
    children: Exclude<StatementValueNode, AttributeNode | CommentNode>[];
    fullChildren: StatementValueNode[];
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

export interface AngleNode extends Unist.Literal {
    type: 'angle';
    value: string;
    valueNode: NumberNode;
    unit: string;
}

export interface NumberNode extends Unist.Literal {
    type: 'number';
    value: string;
    rawValue: string;
}

export interface SymbolNode extends Unist.Literal {
    type: 'symbol';
    value: string;
}

export interface CommentNode extends Unist.Literal {
    type: 'comment';
    value: string;
}

export interface TextNode extends Unist.Literal {
    type: 'text';
    value: string;
}

export interface XMLNode extends Unist.Node {
    type: 'xml';
    content: TextNode | CommentNode | ElementNode;
}

export interface ElementNode extends Unist.Parent {
    type: 'element';
    tagName: string;
    properties: ElementProperties;
    children: (TextNode | CommentNode | ElementNode)[];
}

export interface ElementProperties {
    [key: string]: ElementPropertyValue;
}

export type ElementPropertyValue = string;
