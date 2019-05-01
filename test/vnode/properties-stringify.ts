import test from 'ava';
import propertiesStringify from '../../src/vnode/properties-stringify';

test('空の属性', async t => {
    const attrsStr = propertiesStringify({});
    t.is(attrsStr, '');
});

test('一つの単一行値の属性', async t => {
    const attrsStr = propertiesStringify({ attr: 'value' });
    t.is(attrsStr, ' attr="value"');
});

test('一つの複数行値の属性', async t => {
    const attrsStr = propertiesStringify({
        attr: 'value1\nvalue2',
    });
    t.is(attrsStr, ' attr="value1\n       value2"');
});

test('複数の単一行値の属性', async t => {
    const attrsStr = propertiesStringify({
        attr: 'value',
        attrib: 'val',
        hogehuga: 'blah blah blah',
    });
    t.is(attrsStr, ' attr="value" attrib="val" hogehuga="blah blah blah"');
});

test('複数の複数行値の属性', async t => {
    const attrsStr = propertiesStringify({
        attr: 'value1\nvalue2\r\nvalue3',
        attrib: 'val\rvalue\rvalalalalala',
        hogehuga: 'blah\nblah!!\nblah!!!!',
    });
    t.is(
        attrsStr,
        '' +
            ' attr="value1\n' +
            '       value2\r\n' +
            '       value3"\n' +
            ' attrib="val\r' +
            '         value\r' +
            '         valalalalala"\n' +
            ' hogehuga="blah\n' +
            '           blah!!\n' +
            '           blah!!!!"',
    );
});
