import test from 'ava';
import propertyStringify from '../../src/vnode/property-stringify';

test('単一行の属性値', async t => {
    const attrStr = propertyStringify('attr', 'value');
    t.is(attrStr, 'attr="value"');
});

test('複数行の属性値', async t => {
    const attrStr = propertyStringify('attr', 'value1\nvalue2');
    t.is(attrStr, 'attr="value1\n      value2"');
});

test('異なる改行コードが混在した複数行の属性値', async t => {
    const attrStr = propertyStringify(
        'attr',
        'value1\nvalue2\r\nvalue3\rvalue4',
    );
    t.is(
        attrStr,
        '' +
            'attr="value1\n' +
            '      value2\r\n' +
            '      value3\r' +
            '      value4"',
    );
});
