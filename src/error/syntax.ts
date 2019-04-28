import BaseError from './base';

interface Position {
    start: Point;
    end: Point;
}

interface Point {
    offset?: number;
    line: number;
    column: number;
}

function isRecordObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === 'object' && value !== null;
}

function isPoint(value: unknown): value is Point {
    if (isRecordObject(value)) {
        if (
            typeof value.line === 'number' &&
            typeof value.column === 'number'
        ) {
            return /^(?:undefined|number)$/.test(typeof value.offset);
        }
    }
    return false;
}

function isPosition(value: unknown): value is Position {
    if (isRecordObject(value)) {
        return isPoint(value.start) && isPoint(value.end);
    }
    return false;
}

const position2msg = (position: Position): string =>
    `[${position.start.line}:${position.start.column}-${position.end.line}:${
        position.end.column
    }]`;

export default class SyntaxError extends BaseError {
    public position: Position | null = null;

    public constructor(message: string, position: Position | null = null) {
        super(message);

        const pos = isPosition(position) ? position : null;

        Object.defineProperties(this, {
            position: {
                configurable: true,
                enumerable: false,
                value: pos,
                writable: true,
            },
        });

        if (pos) {
            this.message +=
                (/ $/.test(this.message) ? '' : ' ') + position2msg(pos);
        }
    }
}
