/**
 * @see https://qiita.com/Mizunashi_Mana/items/c533fbb51bfee491b0e7
 * @see https://qiita.com/necojackarc/items/c77cf3b5368b9d33601b
 * @see https://github.com/necojackarc/extensible-custom-error
 */

const mergeStackTrace = (targetError, previousError) => {
  if (
    targetError instanceof Error &&
    targetError.stack &&
    previousError instanceof Error &&
    previousError.stack
  ) {
    const targetStackTraceLines = targetError.stack
      .split('\n')
      .map(line =>
        previousError.stack.includes(line.trim())
          ? line.replace(/^(\s*)(\S(?:.*\S)?)(\s*)$/, '$1[dup] $2$3')
          : line,
      );

    return `${targetStackTraceLines.join(
      '\n',
    )}\n\n${previousError.stack.replace(/^/gm, '  ')}`;
  }
  return null;
};

export default class BaseError extends Error {
  constructor(message, ...args) {
    super(message, ...args);

    Object.defineProperties(this, {
      name: {
        configurable: true,
        enumerable: false,
        value: this.constructor.name,
        writable: true,
      },
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

    if (Object.prototype.hasOwnProperty.call(Error, 'captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  setPrevious(error) {
    if (error instanceof Error) {
      Object.defineProperty(this, 'previous', {
        configurable: true,
        enumerable: false,
        value: error,
        writable: false,
      });

      const mergedStackTrace = mergeStackTrace(this, error);
      if (mergedStackTrace) {
        this.stack = mergedStackTrace;
      }
    }
    return this;
  }
}
