export namespace PEGJs {
    export interface ParserOptions {
        startRule?: string;
    }

    export interface LiteralExpectation {
        type: 'literal';
        text: string;
        ignoreCase: boolean;
    }

    export interface ClassExpectation {
        type: 'class';
        parts: ([string, string] | string)[];
        inverted: boolean;
        ignoreCase: boolean;
    }

    export interface AnyExpectation {
        type: 'any';
    }

    export interface EndExpectation {
        type: 'end';
    }

    export interface OtherExpectation {
        type: 'other';
        description: string | unknown;
        // Note: descriptionパラメータの値は、PEG.jsの実装上はstringを想定しているように思えるが、
        //       expected()関数の引数にどのような値も渡せるため、
        //       unknown型も併記した。
    }

    export type Expectation =
        | LiteralExpectation
        | ClassExpectation
        | AnyExpectation
        | EndExpectation
        | OtherExpectation;

    export interface Location {
        start: {
            offset: number;
            line: number;
            column: number;
        };
        end: {
            offset: number;
            line: number;
            column: number;
        };
    }
}

export namespace AST {
    export interface Node {
        type: string;
        position: PEGJs.Location;
    }

    export interface Parent extends Node {
        children: Node[];
    }

    export interface Literal extends Node {
        value: unknown;
    }

    export interface StatementNode extends Parent {
        type: 'statement';
        name: string;
        nameSymbol: SymbolNode;
        attributes: { [key: string]: ValueNode };
        attributeNodes: AttributeNode[];
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
        properties: { [key: string]: string };
        children: (TextNode | CommentNode | ElementNode)[];
    }
}

export function parse(
    input: string,
    options?: PEGJs.ParserOptions,
): AST.StatementValueNode[];

export class SyntaxError extends Error {
    public message: string;

    public expected: PEGJs.Expectation[] | null;

    public found: string | null;

    public location: PEGJs.Location;

    public name: 'SyntaxError';
}
