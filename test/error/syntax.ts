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
    t.regex(
        String(syntaxError),
        /^SyntaxError: The EXAMPLE \[2:1-3:5\](?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxError)) {
        t.is(typeof syntaxError.stack, 'string');
        t.regex(
            syntaxError.stack,
            /^SyntaxError: The EXAMPLE \[2:1-3:5\](?:[\r\n]|$)/,
        );
    }
});

test('position引数を省略したSyntaxErrorクラスのプロパティを検証', t => {
    const syntaxError = new SyntaxError('The EXAMPLE');

    t.is(syntaxError.name, 'SyntaxError');
    t.is(syntaxError.message, 'The EXAMPLE');
    t.is(syntaxError.position, null);
    t.regex(String(syntaxError), /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/);
    if (hasStackPropError(syntaxError)) {
        t.regex(syntaxError.stack, /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/);
    }
});

test('不正な値のposition引数を指定したSyntaxErrorクラスのプロパティを検証', t => {
    const syntaxErrorObjPos = new SyntaxError(
        'The EXAMPLE',
        // @ts-ignore: TS2345: TS2345: Argument of type '{}' is not assignable to parameter of type 'Position'.
        {},
    );

    t.is(syntaxErrorObjPos.message, 'The EXAMPLE');
    t.is(syntaxErrorObjPos.position, null);
    t.regex(String(syntaxErrorObjPos), /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/);
    if (hasStackPropError(syntaxErrorObjPos)) {
        t.regex(
            syntaxErrorObjPos.stack,
            /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
        );
    }

    const syntaxError42Pos = new SyntaxError(
        'The EXAMPLE',
        // @ts-ignore: TS2345: Argument of type '42' is not assignable to parameter of type 'Position | null | undefined'.
        42,
    );

    t.is(syntaxError42Pos.message, 'The EXAMPLE');
    t.is(syntaxError42Pos.position, null);
    t.regex(String(syntaxError42Pos), /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/);
    if (hasStackPropError(syntaxError42Pos)) {
        t.regex(
            syntaxError42Pos.stack,
            /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
        );
    }

    const voidPointPos = { start: {}, end: {} };
    const syntaxErrorVoidPointPos = new SyntaxError(
        'The EXAMPLE',
        // @ts-ignore: TS2345: Argument of type '{ start: {}; end: {}; }' is not assignable to parameter of type 'Position'.
        voidPointPos,
    );

    t.is(syntaxErrorVoidPointPos.message, 'The EXAMPLE');
    t.is(syntaxErrorVoidPointPos.position, null);
    t.regex(
        String(syntaxErrorVoidPointPos),
        /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxErrorVoidPointPos)) {
        t.regex(
            syntaxErrorVoidPointPos.stack,
            /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
        );
    }

    const nonNumberPointsPos = {
        start: { offset: 10, line: undefined, column: true },
        end: { offset: [], line: {}, column: null },
    };
    const syntaxErrorNonNumberPointsPos = new SyntaxError(
        'The EXAMPLE',
        // @ts-ignore: TS2345: Argument of type '{ start: { offset: number; line: undefined; column: boolean; }; end: { offset: never[]; line: {}; column: null; }; }' is not assignable to parameter of type 'Position'.
        nonNumberPointsPos,
    );

    t.is(syntaxErrorNonNumberPointsPos.message, 'The EXAMPLE');
    t.is(syntaxErrorNonNumberPointsPos.position, null);
    t.regex(
        String(syntaxErrorNonNumberPointsPos),
        /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxErrorNonNumberPointsPos)) {
        t.regex(
            syntaxErrorNonNumberPointsPos.stack,
            /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
        );
    }

    const offsetGonePointsPos = {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
    };
    const syntaxErrorOffsetGonePointsPos = new SyntaxError(
        'The EXAMPLE',
        offsetGonePointsPos,
    );

    t.is(syntaxErrorOffsetGonePointsPos.message, 'The EXAMPLE [1:1-1:6]');
    t.is(syntaxErrorOffsetGonePointsPos.position, offsetGonePointsPos);
    t.regex(
        String(syntaxErrorOffsetGonePointsPos),
        /^SyntaxError: The EXAMPLE \[1:1-1:6\](?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxErrorOffsetGonePointsPos)) {
        t.regex(
            syntaxErrorOffsetGonePointsPos.stack,
            /^SyntaxError: The EXAMPLE \[1:1-1:6\](?:[\r\n]|$)/,
        );
    }

    const offsetNonNumberPointsPos = {
        start: { offset: '0', line: 1, column: 1 },
        end: { offset: '5', line: 1, column: 6 },
    };
    const syntaxErrorOffsetNonNumberPointsPos = new SyntaxError(
        'The EXAMPLE',
        // @ts-ignore: TS2345: Argument of type '{ start: { offset: string; line: number; column: number; }; end: { offset: string; line: number; column: number; }; }' is not assignable to parameter of type 'Position'.
        offsetNonNumberPointsPos,
    );

    t.is(syntaxErrorOffsetNonNumberPointsPos.message, 'The EXAMPLE');
    t.is(syntaxErrorOffsetNonNumberPointsPos.position, null);
    t.regex(
        String(syntaxErrorOffsetNonNumberPointsPos),
        /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxErrorOffsetNonNumberPointsPos)) {
        t.regex(
            syntaxErrorOffsetNonNumberPointsPos.stack,
            /^SyntaxError: The EXAMPLE(?:[\r\n]|$)/,
        );
    }
});

test('範囲がおかしいposition引数を指定したSyntaxErrorクラスのプロパティを検証', t => {
    const invalidRangePos = {
        start: { offset: -20, line: 10, column: Infinity },
        end: { offset: 18, line: -10, column: 12.86 },
    };
    const syntaxError = new SyntaxError('The EXAMPLE', invalidRangePos);

    t.is(syntaxError.name, 'SyntaxError');
    t.is(syntaxError.message, 'The EXAMPLE [10:Infinity--10:12.86]');
    t.is(syntaxError.position, invalidRangePos);
    t.regex(
        String(syntaxError),
        /^SyntaxError: The EXAMPLE \[10:Infinity--10:12\.86\](?:[\r\n]|$)/,
    );
    if (hasStackPropError(syntaxError)) {
        t.is(typeof syntaxError.stack, 'string');
        t.regex(
            syntaxError.stack,
            /^SyntaxError: The EXAMPLE \[10:Infinity--10:12\.86\](?:[\r\n]|$)/,
        );
    }
});
