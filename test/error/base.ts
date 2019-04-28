import test from 'ava';
import BaseError from '../../src/error/base';

test('BaseErrorクラスのプロパティを検証', t => {
    const baseError = new BaseError('The EXAMPLE');

    t.is(baseError.name, 'BaseError');
    t.is(baseError.message, 'The EXAMPLE');
    t.is(baseError.previous, null);
});

test('BaseErrorクラスのメソッドを検証', t => {
    const baseError = new BaseError('The EXAMPLE');

    t.is(typeof baseError.setPrevious, 'function');

    const previousError = new Error();
    const extendedError = baseError.setPrevious(previousError);

    t.is(extendedError.previous, previousError);
    t.is(baseError.previous, previousError);
    t.is(baseError, extendedError);
});
