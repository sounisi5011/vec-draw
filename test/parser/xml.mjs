import test from 'ava';
import { parse } from '../../src/parser';
import { XMLError } from '../../src';

const newlineMap = {
  LF: '\n',
  CR: '\r',
  CRLF: '\r\n',
};

const newlineCallback = callback => {
  Object.entries(newlineMap).forEach(callback);
};

test(`XMLのみの内容`, async t => {
  [
    ...['<svg/>', '<svg></svg>', '<svg />', '<svg ></svg>', '<svg\n></svg>'],
    ...[
      '<svg attr="value"/>',
      '<svg\nattr="value"/>',
      '<svg attr="value" />',
      '<svg\nattr="value" />',
      '<svg attr="value"\n/>',
      '<svg\nattr="value"\n/>',
    ],
    ...[
      "<svg attr='value'/>",
      "<svg\nattr='value'/>",
      "<svg attr='value' />",
      "<svg\nattr='value' />",
      "<svg attr='value'\n/>",
      "<svg\nattr='value'\n/>",
    ],
    ...[
      '<data> </data>',
      '<data>\n</data>',
      '<data>球</data>',
      '<data>🌏</data>',
      '<data>\n  🌏\n</data>',
    ],
    ...['<!---->', '<!--顔-->', '<!--😊-->', '<!--\n😊\n-->'],
    ...[
      '<![CDATA[]]>',
      '<![CDATA[あ]]>',
      '<![CDATA[👌]]>',
      '<![CDATA[ <xml> ]]>',
      '<![CDATA[\n<svg/>\n]]>',
    ],
    ...[
      '<g><rect/></g>',
      '<g> <rect/> </g>',
      '<g>\n<rect/>\n</g>',
      '<g>\n  <rect/>\n</g>',
    ],
    ...[
      '<g><rect x="10" y="10" width="100" height="100"/></g>',
      '<g><rect\nx="10" y="10"\nwidth="100" height="100"/></g>',
      '<g> <rect x="10"    y="10" width="100"          height="100"/> </g>',
      '<g>\n<rect x="10" y="10" width="100" height="100"/>\n</g>',
      '<g>\n  <rect x="10"\n        y="10"\n    width="100"\nheight="100"/>\n</g>',
    ],
  ]
    .reduce((set, text) => {
      set
        .add(text.replace(/\n/g, '\r'))
        .add(text.replace(/\n/g, '\n'))
        .add(text.replace(/\n/g, '\r\n'));
      return set;
    }, new Set())
    .forEach(dsl => {
      t.snapshot(parse(dsl), JSON.stringify(dsl));
    });
});

test(`ネストしたXML`, async t => {
  [
    ...[
      'group fill=red <rect width="7" height="3"/>',
      'group fill=red\n  <rect width="7" height="3"/>',
      'group fill=red\n  <rect width="7"\n       height="3"/>',
      'group fill=red\n  <rect width="7"\nheight="3"/>',
    ],
    ...[
      'group\n  <g><rect/></g>',
      'group\n  <g> <rect/> </g>',
      'group\n  <g>\n<rect/>\n</g>',
      'group\n  <g>\n  <rect/>\n</g>',
    ],
    ...[
      'group fill=red <rect width="7" height="3"/> <rect fill="white" width="2" height="30"/>',
      'group fill=red <rect width="7" height="3"/>\n  <rect fill="white" width="2" height="30"/>',
      'group fill=red\n  <rect width="7" height="3"/>\n  <rect fill="white" width="2" height="30"/>',
      'group\n  fill=red\n  <rect width="7" height="3"/>\n  <rect fill="white" width="2" height="30"/>',
      'group\n  fill=red\n  <rect\nwidth="7"\n   height="3"/>\n  <rect fill="white"\n   width="2"\nheight="30"/>',
    ],
  ]
    .reduce((set, text) => {
      set
        .add(text.replace(/\n/g, '\r'))
        .add(text.replace(/\n/g, '\n'))
        .add(text.replace(/\n/g, '\r\n'));
      return set;
    }, new Set())
    .forEach(dsl => {
      t.snapshot(parse(dsl), JSON.stringify(dsl));
    });
});

test('閉じていないXML要素', async t => {
  t.throws(
    () => {
      parse('<svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /svg element is not closed (?:.* )?\[1:1-1:6\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg>🌏</data>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /svg element is not closed (?:.* )?\[1:1-1:8\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /data element is not closed (?:.* )?\[1:6-1:14\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</svg></data>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /data element is not closed (?:.* )?\[1:6-1:14\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /svg element is not closed (?:.* )?\[1:1-1:21\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data><g>text');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /g element is not closed (?:.* )?\[1:21-1:28\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data><g>text</group></svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /g element is not closed (?:.* )?\[1:21-1:28\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data><br><data>地球</data></svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /br element is not closed (?:.* )?\[1:21-1:40\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg>\n  <data>🌏</data>\n  <br>\n  <data>地球</data>\n</svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /br element is not closed (?:.* )?\[3:3-5:1\]/,
    },
  );
});

test('開いていないXML要素', async t => {
  t.throws(
    () => {
      parse('</svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /svg element has not started (?:.* )?\[1:1-1:7\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg>🌏</data></svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /data element has not started (?:.* )?\[1:8-1:15\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg>🌏</svg></data>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /data element has not started (?:.* )?\[1:14-1:21\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data><g>text</g></group></svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /group element has not started (?:.* )?\[1:32-1:40\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg><data>🌏</data></br><data>地球</data></svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /br element has not started (?:.* )?\[1:21-1:26\]/,
    },
  );
  t.throws(
    () => {
      parse('<svg>\n  <data>🌏</data>\n  </br>\n  <data>地球</data>\n</svg>');
    },
    {
      instanceOf: XMLError,
      name: 'XMLError',
      message: /br element has not started (?:.* )?\[3:3-3:8\]/,
    },
  );
});
