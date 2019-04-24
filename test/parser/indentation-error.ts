import test from 'ava';
import { parse } from '../../dist/parser';

test('余分なインデント / SP SP ≠ SP SP SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n   42');
        },
        {
            name: 'IndentationError',
            message: /unexpected indent (?:.* )?\[3:1-3:4\]/,
        },
    );
});

test('不足したインデント / SP SP ≠ SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n 42');
        },
        {
            name: 'IndentationError',
            message: /unindent does not match any outer indentation level (?:.* )?\[3:1-3:2\]/,
        },
    );
});

test('インデント文字が一致しない / SP ≠ TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n 12\n\t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:2\]/,
        },
    );
});

test('インデント文字が一致しない / TAB ≠ SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t12\n 42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:2\]/,
        },
    );
});

test('インデント文字が一致しない / SP SP ≠ SP TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n \t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / SP SP ≠ TAB SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n\t 42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / SP SP ≠ TAB TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n\t\t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / SP TAB ≠ SP SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n \t12\n  42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / SP TAB ≠ TAB SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n \t12\n\t 42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / SP TAB ≠ TAB TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n \t12\n\t\t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB SP ≠ SP SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t 12\n  42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB SP ≠ SP TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t 12\n \t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB SP ≠ TAB TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t 12\n\t\t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB TAB ≠ SP SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t\t12\n  42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB TAB ≠ SP TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t\t12\n \t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('インデント文字が一致しない / TAB TAB ≠ TAB SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n\t\t12\n\t 42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:3\]/,
        },
    );
});

test('余分なインデント+インデント文字が一致しない / SP SP ≠ SP TAB SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n \t 42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:4\]/,
        },
    );
});

test('余分なインデント+インデント文字が一致しない / SP SP ≠ SP SP TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n  \t42');
        },
        {
            name: 'IndentationError',
            message: /unexpected indent (?:.* )?\[3:1-3:4\]/,
        },
    );
});

test('不足したインデント+インデント文字が一致しない / SP SP ≠ TAB', async t => {
    t.throws(
        () => {
            parse('xxxx\n  12\n\t42');
        },
        {
            name: 'IndentationError',
            message: /indent does not match current indentation level (?:.* )?\[3:1-3:2\]/,
        },
    );
});

test('不足したインデント+インデント文字が一致しない / SP TAB ≠ SP', async t => {
    t.throws(
        () => {
            parse('xxxx\n \t12\n 42');
        },
        {
            name: 'IndentationError',
            message: /unindent does not match any outer indentation level (?:.* )?\[3:1-3:2\]/,
        },
    );
});
