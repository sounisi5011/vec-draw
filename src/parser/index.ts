import * as parser from './dsl.parser';
import * as AST from './dsl.type';

export const { SyntaxError } = parser;

export { AST };

export function parse(sourceText: string): AST.RootNode {
    return parser.parse(sourceText);
}
