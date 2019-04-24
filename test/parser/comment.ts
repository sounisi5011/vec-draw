import test from 'ava';
import { parse } from '../../dist/parser';

const newlineCallback = (
    callback: (nlData: [string, string]) => void,
): void => {
    const newlineMap = {
        EMPTY: '',
        LF: '\n',
        CR: '\r',
        CRLF: '\r\n',
    };
    Object.entries(newlineMap).forEach(callback);
};

newlineCallback(([nlName, nlChar]) => {
    const msgSuffix = nlChar ? ` + 改行(${nlName})` : '';

    test(`コメントのみの内容：コメント${msgSuffix}`, async t => {
        t.snapshot(parse(`--${nlChar}`));
    });

    test(`コメントのみの内容：コメント + 空白${msgSuffix}`, async t => {
        t.snapshot(parse(`-- ${nlChar}`));
    });

    test(`コメントのみの内容：コメント + 内容${msgSuffix}`, async t => {
        t.snapshot(parse(`--42${nlChar}`));
    });

    test(`コメントのみの内容：コメント + 空白 + 内容${msgSuffix}`, async t => {
        t.snapshot(parse(`-- 42${nlChar}`));
    });
});

test('文の後ろのコメント', async t => {
    t.snapshot(parse(`rect (0,0) (10x10) fill=white -- □`));
});

test('文の内容のコメント', async t => {
    newlineCallback(([NLName, NL]) => {
        if (!NL) {
            return;
        }

        t.snapshot(
            parse(
                `rect${NL}  -- 位置${NL}  (0,0)${NL}  --大きさ${NL}  (10x10)${NL}`,
            ),
            `NL:${NLName}`,
        );
    });
});

test('文の内容のコメント；インデントの誤り', async t => {
    newlineCallback(([NLName, NL]) => {
        if (!NL) {
            return;
        }

        t.throws(
            () => {
                parse(
                    `rect${NL}  -- 位置${NL}  (0,0)${NL} --大きさ${NL}  (10x10)${NL}`,
                );
            },
            {
                name: 'IndentationError',
                message: /unindent does not match any outer indentation level (?:.* )?\[4:1-4:2\]/,
            },
            `インデント不足 NL:${NLName}`,
        );

        t.throws(
            () => {
                parse(
                    `rect${NL}  -- 位置${NL}  (0,0)${NL}   --大きさ${NL}  (10x10)${NL}`,
                );
            },
            {
                name: 'IndentationError',
                message: /unexpected indent (?:.* )?\[4:1-4:4\]/,
            },
            `インデント過剰 NL:${NLName}`,
        );
    });
});
