import * as parser from './dsl.parser';
import * as AST from './dsl.type';
import WrapSyntaxError from '../error/syntax';

export const { SyntaxError } = parser;

export { AST };

export function parse(sourceText: string): AST.RootNode {
    try {
        return parser.parse(sourceText);
    } catch (error) {
        if (error instanceof parser.SyntaxError) {
            throw new WrapSyntaxError(
                error.message,
                error.location,
            ).setPrevious(error);
        } else {
            throw error;
        }
    }
}
