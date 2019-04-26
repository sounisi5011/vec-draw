/**
 * @see https://qiita.com/Mizunashi_Mana/items/c533fbb51bfee491b0e7
 * @see https://qiita.com/necojackarc/items/c77cf3b5368b9d33601b
 * @see https://github.com/necojackarc/extensible-custom-error
 * @see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
 */

interface HaveStackError extends Error {
    stack: string;
}

function hasStackPropError(error: Error): error is HaveStackError {
    return typeof error.stack === 'string';
}

function mergeStackTrace(
    targetError: Error,
    previousError: Error,
): string | null {
    if (hasStackPropError(targetError) && hasStackPropError(previousError)) {
        const targetErrorStack = targetError.stack;
        const previousErrorStack = previousError.stack;
        const targetStackTraceLines = targetErrorStack
            .split('\n')
            .map(line =>
                previousErrorStack.includes(line.trim())
                    ? line.replace(/^(\s*)(\S(?:.*\S)?)(\s*)$/, '$1[dup] $2$3')
                    : line,
            );

        return `${targetStackTraceLines.join(
            '\n',
        )}\n\n${previousErrorStack.replace(/^/gm, '  ')}`;
    }
    return null;
}

interface V8ErrorConstructor extends ErrorConstructor {
    captureStackTrace(error: Error, errorConstructor: Function): void;
}

function hasCaptureStackTrace(errorConstructor: {
    [key: string]: unknown;
}): errorConstructor is V8ErrorConstructor {
    return typeof errorConstructor.captureStackTrace === 'function';
}

export default class BaseError extends Error {
    public previous: Error | null = null;

    public constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, BaseError.prototype);

        const { constructor } = this;

        if ('name' in constructor) {
            Object.defineProperty(this, 'name', {
                configurable: true,
                enumerable: false,
                value: String((constructor as { name: unknown }).name),
                writable: true,
            });
        }

        Object.defineProperties(this, {
            message: {
                configurable: true,
                enumerable: false,
                value: message,
                writable: true,
            },
            previous: {
                configurable: true,
                enumerable: false,
                value: null,
                writable: false,
            },
        });

        if (hasCaptureStackTrace(Error)) {
            Error.captureStackTrace(this, constructor);
        }
    }

    public setPrevious(error: unknown): this {
        if (error instanceof Error) {
            Object.defineProperty(this, 'previous', {
                configurable: true,
                enumerable: false,
                value: error,
                writable: false,
            });

            if (hasStackPropError(this)) {
                const mergedStackTrace = mergeStackTrace(this, error);
                if (mergedStackTrace !== null) {
                    this.stack = mergedStackTrace;
                }
            }
        }
        return this;
    }
}
