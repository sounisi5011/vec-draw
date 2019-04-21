import BaseError from './base';

const position2msg = (position): string =>
    `[${position.start.line}:${position.start.column}-${position.end.line}:${
        position.end.column
    }]`;

export default class SyntaxError extends BaseError {
    public constructor(message, position = null, ...args) {
        super(message, ...args);

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
