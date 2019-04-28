import test from 'ava';
import BaseError from '../../src/error/base';

interface HaveStackError extends Error {
    stack: string;
}

function hasStackPropError(error: Error): error is HaveStackError {
    return 'stack' in error;
}

test('BaseErrorクラスのプロパティを検証', t => {
    const baseError = new BaseError('The EXAMPLE');

    t.is(baseError.name, 'BaseError');
    t.is(baseError.message, 'The EXAMPLE');
    t.is(baseError.previous, null);
    t.true(/^BaseError: The EXAMPLE(?:[\r\n]|$)/.test(String(baseError)));
    if (hasStackPropError(baseError)) {
        t.is(typeof baseError.stack, 'string');
        t.true(/^BaseError: The EXAMPLE(?:[\r\n]|$)/.test(baseError.stack));
    }
});

test('BaseErrorクラスのメソッドを検証', t => {
    const baseError = new BaseError('The EXAMPLE');

    t.is(typeof baseError.setPrevious, 'function');

    const previousError1 = new Error();
    const previousError2 = new BaseError('');

    const extendedError1 = baseError.setPrevious(previousError1);

    t.is(extendedError1, baseError);
    t.not(extendedError1.previous, null);
    t.is(extendedError1.previous, previousError1);
    t.not(extendedError1.previous, previousError2);

    const extendedError2 = extendedError1.setPrevious(null);

    t.is(extendedError2, extendedError1);
    t.not(extendedError2.previous, null);
    t.is(extendedError2.previous, previousError1);
    t.not(extendedError2.previous, previousError2);

    const extendedError3 = extendedError2.setPrevious(previousError2);

    t.is(extendedError3, extendedError2);
    t.not(extendedError3.previous, null);
    t.not(extendedError3.previous, previousError1);
    t.is(extendedError3.previous, previousError2);

    const extendedError4 = extendedError3.setPrevious({});

    t.is(extendedError4, extendedError3);
    t.not(extendedError4.previous, null);
    t.not(extendedError4.previous, previousError1);
    t.is(extendedError4.previous, previousError2);

    const extendedError5 = extendedError4.setPrevious(undefined);

    t.is(extendedError5, extendedError4);
    t.not(extendedError5.previous, null);
    t.not(extendedError5.previous, previousError1);
    t.is(extendedError5.previous, previousError2);
});

class CustomError1Lv1 extends BaseError {
    public xxxx(): this {
        return this;
    }
}
class CustomError1Lv2 extends CustomError1Lv1 {
    public yyyy(): string {
        return this.message;
    }
}
class CustomError2Lv1 extends BaseError {
    public zzzz(): unknown {
        return this.previous;
    }
}

test('BaseErrorクラスの継承を検証', t => {
    const baseError = new BaseError('');

    t.true(baseError instanceof Error);
    t.true(baseError instanceof BaseError);
    t.false(baseError instanceof CustomError1Lv1);
    t.false(baseError instanceof CustomError1Lv2);
    t.false(baseError instanceof CustomError2Lv1);

    const cs1Error = new CustomError1Lv1('');

    t.true(cs1Error instanceof Error);
    t.true(cs1Error instanceof BaseError);
    t.true(cs1Error instanceof CustomError1Lv1);
    t.false(cs1Error instanceof CustomError1Lv2);
    t.false(cs1Error instanceof CustomError2Lv1);

    t.is(cs1Error.name, 'CustomError1Lv1');

    t.is(typeof cs1Error.setPrevious, 'function');
    t.is(typeof cs1Error.xxxx, 'function');
    // @ts-ignore: TS2339: Property 'yyyy' does not exist on type 'CustomError1Lv1'.
    t.not(typeof cs1Error.yyyy, 'function');
    // @ts-ignore: TS2339: Property 'zzzz' does not exist on type 'CustomError1Lv1'.
    t.not(typeof cs1Error.zzzz, 'function');

    const cs2Error = new CustomError1Lv2('');

    t.true(cs2Error instanceof Error);
    t.true(cs2Error instanceof BaseError);
    t.true(cs2Error instanceof CustomError1Lv1);
    t.true(cs2Error instanceof CustomError1Lv2);
    t.false(cs2Error instanceof CustomError2Lv1);

    t.is(cs2Error.name, 'CustomError1Lv2');

    t.is(typeof cs2Error.setPrevious, 'function');
    t.is(typeof cs2Error.xxxx, 'function');
    t.is(typeof cs2Error.yyyy, 'function');
    // @ts-ignore: TS2339: Property 'zzzz' does not exist on type 'CustomError1Lv2'.
    t.not(typeof cs2Error.zzzz, 'function');

    const cs3Error = new CustomError2Lv1('');

    t.true(cs3Error instanceof Error);
    t.true(cs3Error instanceof BaseError);
    t.false(cs3Error instanceof CustomError1Lv1);
    t.false(cs3Error instanceof CustomError1Lv2);
    t.true(cs3Error instanceof CustomError2Lv1);

    t.is(cs3Error.name, 'CustomError2Lv1');

    t.is(typeof cs3Error.setPrevious, 'function');
    // @ts-ignore: TS2339: Property 'xxxx' does not exist on type 'CustomError2Lv1'.
    t.not(typeof cs3Error.xxxx, 'function');
    // @ts-ignore: TS2339: Property 'yyyy' does not exist on type 'CustomError2Lv1'.
    t.not(typeof cs3Error.yyyy, 'function');
    t.is(typeof cs3Error.zzzz, 'function');
});
