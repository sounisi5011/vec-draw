import * as parser from './parser/dsl.parser';
import * as AST from './parser/dsl.type';

export const { SyntaxError } = parser;

export { AST };

export function parse(sourceText: string): AST.RootNode {
    return parser.parse(sourceText);
}
