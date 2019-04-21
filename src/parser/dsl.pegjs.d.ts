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

export function parse(input: string, options?: PEGJs.ParserOptions): unknown;

export class SyntaxError extends Error {
    public message: string;

    public expected: PEGJs.Expectation[] | null;

    public found: string | null;

    public location: PEGJs.Location;

    public name: 'SyntaxError';
}
