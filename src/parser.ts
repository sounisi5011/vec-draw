import parser, { AST } from './parser/dsl.pegjs.js';
import { IndentationError, XMLError } from './error';

interface IndentationErrorDescription {
    scope: 'indentation';
    type: 'not equal' | 'unexpected indent';
    mode: 'same' | 'indent' | 'outdent';
    expectedIndent: string;
    matchIndent: string;
    message: string;
}

interface XMLErrorDescription {
    scope: 'xml';
    startTagName?: string;
    endTagName?: string;
    message: string;
}

function isIndentationErrorDescription(
    value: unknown,
): value is IndentationErrorDescription {
    if (typeof value === 'object' && value !== null) {
        const obj: { [key: string]: unknown } = value;
        if (obj.scope === 'indentation') {
            return true;
        }
    }
    return false;
}

function isXMLErrorDescription(value: unknown): value is XMLErrorDescription {
    if (typeof value === 'object' && value !== null) {
        const obj: { [key: string]: unknown } = value;
        if (obj.scope === 'xml') {
            return true;
        }
    }
    return false;
}

export const { SyntaxError } = parser;

export { AST };

export function parse(sourceText: string): AST.StatementValueNode[] {
    try {
        return parser.parse(sourceText);
    } catch (err) {
        if (err instanceof SyntaxError) {
            const { expected: expectationList, location } = err;

            if (expectationList) {
                expectationList.forEach(expectation => {
                    if (expectation.type === 'other') {
                        const { description } = expectation;
                        if (isIndentationErrorDescription(description)) {
                            const {
                                expectedIndent: currentIndent,
                                matchIndent: spaces,
                                mode,
                            } = description;
                            const startsEquals =
                                currentIndent.substr(
                                    0,
                                    Math.min(
                                        currentIndent.length,
                                        spaces.length,
                                    ),
                                ) ===
                                spaces.substr(
                                    0,
                                    Math.min(
                                        currentIndent.length,
                                        spaces.length,
                                    ),
                                );

                            if (!startsEquals) {
                                throw new IndentationError(
                                    `indent does not match current indentation level`,
                                    location,
                                ).setPrevious(err);
                            }

                            if (
                                currentIndent.length < spaces.length &&
                                mode === 'same'
                            ) {
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
                        } else if (isXMLErrorDescription(description)) {
                            if (description.startTagName) {
                                throw new XMLError(
                                    `${
                                        description.startTagName
                                    } element is not closed`,
                                    location,
                                ).setPrevious(err);
                            } else if (description.endTagName) {
                                throw new XMLError(
                                    `${
                                        description.endTagName
                                    } element has not started`,
                                    location,
                                ).setPrevious(err);
                            }
                        }
                    }
                });
            }
        }
        throw err;
    }
}
