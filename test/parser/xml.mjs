import test from 'ava';
import { parse } from '../../src/parser';

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
