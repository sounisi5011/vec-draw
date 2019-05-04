import test, { ExecutionContext, ThrowsExpectation } from 'ava';
import { parser, SyntaxError, ReferenceError } from '../../src';

const snapshotTest = (t: ExecutionContext, input: string): void => {
    t.snapshot(parser(input));
};

const throwsTest = (
    t: ExecutionContext,
    input: string,
    expected: ThrowsExpectation,
): void => {
    t.throws(() => {
        parser(input);
    }, expected);
};

test(
    '#ref付きの文',
    snapshotTest,
    `
path#main
  (0, 0)
  line
  (10, 10)
`,
);

test(
    '#ref付きの複数の文',
    snapshotTest,
    `
path#outer
  (0, 0)
  line
  (0, 10)
  line
  (10, 10)
  line
  (10, 0)
  close
rect#inner
  (2, 2)
  (6 x 6)
`,
);

test(
    'ネストした#ref付きの文',
    snapshotTest,
    `
group#l1
  group#l2
    rect#inner
      (2, 2)
      (6 x 6)
  path#l2x
    (0, 0)
    bezCurve (0, 10)
    (10, 10)
`,
);

test(
    '#ref付きの値',
    snapshotTest,
    `
path
  (0, 0)#start-pos
  line
  (10, 10)#end-pos
`,
);

test(
    '#ref付きの値と、値を参照する座標',
    snapshotTest,
    `
path
  (0#start-x, 0#start-y)#start-pos
  bezCurve
    (#start-x, #end-y)
  (10#end-x, 10#end-y)#end-pos
  line
  #start-pos
  line
  (#end-x, #start-y)
`,
);

test(
    '#ref付きの値を持つ属性',
    snapshotTest,
    `
rect
  fill=red#inner-color
  (2, 2)
  (6 x 6)
`,
);

test(
    '#ref付きの値を持つ属性と、値を参照する属性',
    snapshotTest,
    `
rect
  fill=red#rect1-color
  (2, 2)
  (6 x 6)
rect
  fill=#rect1-color
  (10, 10)
  (6 x 6)
`,
);

test(
    '#ref付きの値をカラーコードとして使用している属性',
    snapshotTest,
    `
rect
  stroke=#000000
  fill=#ff0000
  (0, 0)
  (10 x 10)
`,
);

test(
    '#ref付きの文と値の混在',
    snapshotTest,
    `
path#main stroke=#000000 fill=#ff0000
  (0#start-x, 0#start-y)#start-pos
  bezCurve
    (#start-x, #end-y)
  (10#end-x, 10#end-y)#end-pos
  line
  #start-pos
  line
  (#end-x, #start-y)
use
  href=#main
  x=#end-x
  y=13
`,
);

test(
    '重複した文の#ref',
    throwsTest,
    `
path#rect1
  (0, 0)
  line
  (0, 10)
  line
  (10, 10)
  line
  (10, 0)
  close
rect#rect1
  (2, 2)
  (6 x 6)
`,
    {
        instanceOf: ReferenceError,
        name: 'ReferenceError',
        message: /\[11:5-11:11\]/,
    },
);

test(
    '重複した値の#ref',
    throwsTest,
    `
path
  (0#start, 0#start)
  line
  (10, 10)
`,
    {
        instanceOf: ReferenceError,
        name: 'ReferenceError',
        message: /\[3:14-3:20\]/,
    },
);

test(
    '離れた位置で重複した値の#ref',
    throwsTest,
    `
path
  (0#x, 0)
  line
  (10, 10#x)
`,
    {
        instanceOf: ReferenceError,
        name: 'ReferenceError',
        message: /\[5:10-5:12\]/,
    },
);

test(
    '文と値とで重複した#ref',
    throwsTest,
    `
path#main
  (0, 0)#main
  line
  (10, 10)#main
`,
    {
        instanceOf: ReferenceError,
        name: 'ReferenceError',
        message: /\[3:9-3:14\]/,
    },
);

test(
    '文とネストした値とで重複した#ref',
    throwsTest,
    `
group#main
  path
    (0#main, 0#main)
    line
    (10, 10)
`,
    {
        instanceOf: ReferenceError,
        name: 'ReferenceError',
        message: /\[4:7-4:12\]/,
    },
);

test(
    '#refに#refを割り当てることは不可',
    throwsTest,
    `
group#main
  path
    (0, 0)
    line
    (10, 10)
#main#main2
`,
    { instanceOf: SyntaxError, message: /\[7:6-7:12\]/ },
);
