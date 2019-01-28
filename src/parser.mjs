import parser from './parser/dsl.pegjs.js';

export function parse(sourceText) {
  return parser.parse(sourceText);
}

export const { SyntaxError } = parser.SyntaxError;
