import test from 'ava';
import SyntaxError from '../../src/error/syntax';

interface HaveStackError extends Error {
    stack: string;
}

function hasStackPropError(error: Error): error is HaveStackError {
    return 'stack' in error;
}

test('SyntaxErrorクラスのプロパティを検証', t => {
    const pos = {
        start: {
            offset: 10,
            line: 2,
            column: 1,
        },
        end: {
            offset: 1,
            line: 3,
            column: 5,
        },
    };
    const syntaxError = new SyntaxError('The EXAMPLE', pos);

    t.is(syntaxError.name, 'SyntaxError');
    t.is(syntaxError.message, 'The EXAMPLE [2:1-3:5]');
    t.is(syntaxError.position, pos);
    t.true(
        /^SyntaxError: The EXAMPLE \[2:1-3:5\](?:[\r\n]|$)/.test(
            String(syntaxError),
        ),
    );
    if (hasStackPropError(syntaxError)) {
        t.is(typeof syntaxError.stack, 'string');
        t.true(
            /^SyntaxError: The EXAMPLE \[2:1-3:5\](?:[\r\n]|$)/.test(
                syntaxError.stack,
            ),
        );
    }
});
