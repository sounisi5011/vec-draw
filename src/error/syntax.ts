import BaseError from './base';

interface Position {
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

const position2msg = (position: Position): string =>
    `[${position.start.line}:${position.start.column}-${position.end.line}:${
        position.end.column
    }]`;

export default class SyntaxError extends BaseError {
    public position: Position | null = null;

    public constructor(message: string, position: Position | null = null) {
        super(message);

        Object.defineProperties(this, {
            position: {
                configurable: true,
                enumerable: false,
                value: position,
                writable: true,
            },
        });

        if (position) {
            this.message +=
                (/ $/.test(this.message) ? '' : ' ') + position2msg(position);
        }
    }
}
