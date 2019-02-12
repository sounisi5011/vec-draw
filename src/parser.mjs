import parser from './parser/dsl.pegjs.js';
import { IndentationError, XMLError } from './error';

export const { SyntaxError } = parser;

export function parse(sourceText) {
  try {
    return parser.parse(sourceText);
  } catch (err) {
    if (err instanceof SyntaxError) {
      const { expected: expectationList, location } = err;

      expectationList.forEach(({ type, description }) => {
        if (type === 'other' && description) {
          if (description.scope === 'indentation') {
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
                `indent does not match current indentation level`,
                location,
              ).setPrevious(err);
            }

            if (currentIndent.length < spaces.length && mode === 'same') {
              throw new IndentationError(
                `unexpected indent`,
                location,
              ).setPrevious(err);
            } else if (currentIndent.length > spaces.length) {
              throw new IndentationError(
                `unindent does not match any outer indentation level`,
                location,
              ).setPrevious(err);
            }
          } else if (description.scope === 'xml') {
            throw new XMLError(
              `${description.startTagName} element is not closed`,
              location,
            ).setPrevious(err);
          }
        }
      });
    }
    throw err;
  }
}
