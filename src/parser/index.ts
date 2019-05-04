import * as parser from './dsl.parser';
import * as AST from './dsl.type';
import WrapSyntaxError from '../error/syntax';

export function isSyntaxError(value: unknown): value is parser.SyntaxError {
    if (typeof value === 'object' && value !== null) {
        const obj: { [key: string]: unknown } = value;
        if (
            obj.name === 'SyntaxError' &&
            typeof obj.message === 'string' &&
            (typeof obj.found === 'string' || obj.found === null) &&
            (typeof obj.location === 'object' && obj.location) &&
            Array.isArray(obj.expected) &&
            obj instanceof Error
        ) {
            return true;
        }
    }
    return false;
}

export const { SyntaxError } = parser;

export { AST };

export function parse(sourceText: string): AST.RootNode {
    try {
        return parser.parse(sourceText);
    } catch (error) {
        if (isSyntaxError(error)) {
            throw new WrapSyntaxError(
                error.message,
                error.location,
            ).setPrevious(error);
        } else {
            throw error;
        }
    }
}
