import parser from './parser/dsl.pegjs.js';
import IndentationError from './error/indentation';

export const { SyntaxError } = parser;

export function parse(sourceText) {
  try {
    return parser.parse(sourceText);
  } catch (err) {
    if (err instanceof SyntaxError) {
      const { expected: expectationList } = err;
      expectationList.forEach(({ type, description }) => {
        if (type === 'other' && description.scope === 'indentation') {
          const {
            expectedIndent: currentIndent,
            matchIndent: spaces,
            mode,
          } = description;
          const startsEquals =
            currentIndent.substr(
              0,
              Math.min(currentIndent.length, spaces.length),
            ) ===
            spaces.substr(0, Math.min(currentIndent.length, spaces.length));

          if (!startsEquals) {
            throw new IndentationError(
              'indent does not match current indentation level',
            );
          }

          if (currentIndent.length < spaces.length && mode === 'same') {
            throw new IndentationError('unexpected indent');
          } else if (currentIndent.length > spaces.length) {
            throw new IndentationError(
              'unindent does not match any outer indentation level',
            );
          }
        }
      });
    }
    throw err;
  }
}
