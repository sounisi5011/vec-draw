import test from 'ava';
import { compile } from '../src/index';

test('空のSVG', t => {
  t.is(compile(''), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
});
