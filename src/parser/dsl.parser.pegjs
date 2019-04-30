/*:header

import * as AST from './dsl.type';
import { IndentationError, XMLError } from '../error';

*/

{
  const indentList: string[] = [];
  let indentStart = false;

  /**
   * @param {number} [startOffset=location().start.offset]
   * @param {number} [endOffset=location().end.offset]
   * @return {{line: number, column: number, offset: number}}
   */
  function position(startOffset?: number, endOffset?: number) {
    if (typeof startOffset !== 'number' || typeof endOffset !== 'number') {
      const locationData = location();
      if (typeof startOffset !== 'number') {
        ({
          start: {
            offset: startOffset,
          },
        } = locationData);
      }
      if (typeof endOffset !== 'number') {
        ({
          end: {
            offset: endOffset,
          }
        } = locationData);
      }
    }

    return {
      start: computePoint(startOffset),
      end: computePoint(endOffset),
    };
  }

  /**
   * @param {number} offsetInt
   * @return {{line: number, column: number, offset: number}}
   *
   * TODO: pegjsが生成するpeg$computePosDetailsのような、Pointのキャッシュコード
   */
  function computePoint(offsetInt: number) {
    const inputData = input.substring(0, offsetInt);
    const lineBreakCount = (inputData.match(/\r\n?|\n/g) || []).length;
    const currentLineMatch = /(?:^|\r\n?|\n)([^\r\n]*)$/.exec(inputData);
    const currentLineText = currentLineMatch ? currentLineMatch[1] : '';

    return {
      line: lineBreakCount + 1,
      column: currentLineText.length + 1,
      offset: offsetInt,
    };
  }

  interface IndentationErrorOption {
    type: 'not equal' | 'unexpected indent' | 'unexpected unindent';
    mode: 'same' | 'indent' | 'outdent';
    expectedIndent: string;
    matchIndent: string;
  }

  function createIndentationError(options: IndentationErrorOption, position?: AST.Position) {
    const {
      expectedIndent: currentIndent,
      matchIndent: spaces,
      mode,
    } = options;

    if (!position) {
      position = location();
    }

    const indentMinLength = Math.min(currentIndent.length, spaces.length);
    const startsEquals = currentIndent.substr(0, indentMinLength) === spaces.substr(0, indentMinLength);
    if (!startsEquals) {
      // TODO: 互換性のためこのエラーメッセージを維持しているが、
      //       ここで発するべきメッセージは「indent string does not match current indentation string」である
      return new IndentationError(
        `indent does not match current indentation level`,
        position,
      );
    }

    if (currentIndent.length < spaces.length && mode === 'same') {
      return new IndentationError(
        `unexpected indent`,
        position,
      );
    } else if (currentIndent.length > spaces.length) {
      return new IndentationError(
        `unindent does not match any outer indentation level`,
        position,
      );
    }

    return null;
  }

  function createXMLError(options: { startTagName?: string; endTagName?: string }, position?: AST.Position) {
    const { startTagName, endTagName } = options;

    if (!position) {
      position = location();
    }

    if (startTagName) {
      return new XMLError(
        `${startTagName} element is not closed`,
        position,
      );
    } else if (endTagName) {
      return new XMLError(
        `${endTagName} element has not started`,
        position,
      );
    }

    return null;
  }
}

//: AST.StatementValueNode[]
start
  = st:statement_child_line stl:statement_children EOL? {
      return AST.createRootNode(st as (AST.StatementValueNode | null), ...(stl as (AST.StatementValueNode | null)[]));
    }

//: AST.StatementNode
statement "DSL Statement"
  = name:symbol st:statement_attr* comment:statement_attr_comment StartIndent stl:statement_children {
      return AST.createStatementNode(position(), name, ...st, ...comment, ...stl);
    }

//: AST.XMLNode | AST.AttributeNode | AST.ValueNode
statement_attr
  = SP+ value:(XMLStatement / attr / value) {
      return value;
    }

//: AST.CommentNode | void
statement_attr_comment
  = SP+ comment:SingleLineComment { return comment; }
  / SP* {}

//: (AST.StatementValueNode | null)[]
statement_children
  = (EOL st:statement_child_line { return st; })*

//: AST.StatementValueNode | null
statement_child_line
  = SPL { return null; }
  / statement_value

//: AST.StatementValueNode
statement_value
  = Indent value:(SingleLineComment / XMLStatement / attr / statement / value) {
      return value;
    }

//: AST.AttributeNode
attr "DSL Attribute"
  = name:symbol "=" SP* value:value {
      return {
        type: 'attr',
        name: name.value,
        nameSymbol: name,
        value: value,
        position: position()
      };
    }

//: AST.ValueNode
value "DSL Value"
  = coord
  / size
  / angle
  / number
  / symbol

//: AST.CoordNode
coord "DSL Coordinate-type Value"
  = "(" SP* x:number SP* "," SP* y:number SP* ")" {
      return {
        type: 'coord',
        value: {
          x: x.value,
          y: y.value
        },
        valueNode: {
          x: x,
          y: y
        },
        position: position()
      };
    }

//: AST.SizeNode
size "DSL Size-type Value"
  = "(" SP* width:number SP* "x" SP* height:number SP* ")" {
      return {
        type: 'size',
        value: {
          width: width.value,
          height: height.value
        },
        valueNode: {
          width: width,
          height: height
        },
        position: position()
      };
    }

//: AST.AngleNode
angle "DSL Angle-type Value"
  = value:number unit:"deg"i {
      return {
        type: 'angle',
        value: value.value,
        valueNode: value,
        unit: unit.toLowerCase(),
        position: position()
      };
    }

//: AST.NumberNode
number "DSL Numeric Value"
  = value:$([0-9]* "." [0-9]+ / [0-9]+) {
      return {
        type: 'number',
        value: value.replace(/^\./, '0.'),
        rawValue: value,
        position: position()
      };
    }

//: AST.SymbolNode
symbol "DSL Symbol-type Value"
  = value:$([_a-z]i [_a-z0-9-]i*) {
      return {
        type: 'symbol',
        value: value,
        position: position()
      };
    }

//: AST.CommentNode
SingleLineComment "DSL Comment"
  = "--" value:$(!EOL .)* {
      return {
        type: 'comment',
        value: value,
        position: position()
      };
    }

//: string
Indent
  = spaces:$(SP*) ! SP &{
      const currentIndent = indentList.join('');

      const { end } = location();
      const locationData = position(end.offset - spaces.length, end.offset);

      if (currentIndent.length === spaces.length) {
        // インデントが同じ長さの場合
        if (spaces === currentIndent) {
          if (indentStart) {
            indentStart = false;
          } else {
            return true;
          }
        } else {
          throw createIndentationError({
            type: 'not equal',
            mode: 'same',
            expectedIndent: currentIndent,
            matchIndent: spaces,
          }, locationData);
        }
      } else if (currentIndent.length < spaces.length) {
        // インデントが上がった場合

        if (!indentStart) {
          throw createIndentationError({
            type: 'unexpected indent',
            mode: 'same',
            expectedIndent: currentIndent,
            matchIndent: spaces,
          }, locationData);
        } else if (!spaces.startsWith(currentIndent)) {
          throw createIndentationError({
            type: 'not equal',
            mode: 'indent',
            expectedIndent: currentIndent,
            matchIndent: spaces,
          }, locationData);
        }

        const newIndent = spaces.substr(currentIndent.length);
        indentList.push(newIndent);
        indentStart = false;
        return true;
      } else if (spaces.length < currentIndent.length) {
        // インデントが下がった場合

        for (let i = indentList.length - 1; 0 <= i; i--) {
          const dedent = indentList.slice(0, i).join('');
          if (dedent.length < spaces.length) {
            throw createIndentationError({
              type: 'unexpected unindent',
              mode: 'outdent',
              expectedIndent: currentIndent,
              matchIndent: spaces,
            }, locationData);
          }
          if (dedent.length === spaces.length) {
            if (spaces === dedent) {
              indentList.pop();
              indentStart = false;
              return false;
            } else {
              throw createIndentationError({
                type: 'not equal',
                mode: 'outdent',
                expectedIndent: currentIndent,
                matchIndent: spaces,
              }, locationData);
            }
          }
        }
      }

      return false;
    }

//: void
StartIndent
  = &{
      indentStart = true;
      return true;
    }

//: AST.XMLNode | void
XMLStatement "DSL XML Value"
  = contentValue:(XMLCdata / XMLComment / XMLElement) end:XMLElemEnd? {
      if (end) {
        throw createXMLError({
          endTagName: end.name,
        }, end.position);
      }

      return {
        type: 'xml',
        content: contentValue,
        position: position()
      };
    }
  / end:XMLElemEnd {
      throw createXMLError({
        endTagName: end.name,
      });
    }

//: AST.ElementNode
XMLElement "XML Element"
  = XMLElemSelfClose
  / start:XMLElemStart content:(XMLLiteral / XMLCdata / XMLComment / XMLElement)* end:(XMLElemEnd / !XMLElemEnd) {
      if (end === undefined) {
        throw createXMLError({
          startTagName: start.name,
        });
      } else if (start.name !== end.name) {
        const { start: { offset: startOffset } } = location();
        const { start: { offset: endOffset } } = end.position;
        throw createXMLError({
          startTagName: start.name,
          endTagName: end.name,
        }, position(startOffset, endOffset));
      }

      return {
        type: "element",
        tagName: start.name,
        properties: start.attr,
        children: content,
        position: position()
      };
    }

//: AST.ElementNode
XMLElemSelfClose
  = "<" nodeName:$([a-z]i [a-z0-9-]i*) attrList:(XMLAttr / SP / EOL)* "/>" {
      return ((
        nodeName: string,
        attrList: ({ name: string, value: string } | string | undefined)[],
      ) => ({
        type: "element",
        tagName: nodeName,
        properties: attrList.reduce((properties, attr) => {
          if (typeof attr === "object") {
            const {name: attrName, value: attrValue} = attr;
            properties[attrName] = attrValue;
          }
          return properties;
        }, {} as AST.ElementProperties),
        children: [],
        position: position()
      }))(nodeName, attrList);
    }

//: { name: string, attr: AST.ElementProperties }
XMLElemStart
  = "<" nodeName:$([a-z]i [a-z0-9-]i*) attrList:(XMLAttr / SP / EOL)* ">" {
      return ((
        nodeName: string,
        attrList: ({ name: string, value: string } | string | undefined)[],
      ) => ({
        name: nodeName,
        attr: attrList.reduce((properties, attr) => {
          if (typeof attr === "object") {
            const {name: attrName, value: attrValue} = attr;
            properties[attrName] = attrValue;
          }
          return properties;
        }, {} as AST.ElementProperties)
      }))(nodeName, attrList);
    }

//: { name: string, position: IFileRange }
XMLElemEnd
  = "</" nodeName:$([a-z]i [a-z0-9-]i*) ">" {
      return {
        name: nodeName,
        position: position()
      };
    }

//: { name: string, value: string }
XMLAttr "XML Attribute"
  = name:$([a-z]i [a-z0-9-]i*) SP* "=" SP* value:XMLAttrValue {
      return {
        name: name,
        value: value,
      };
    }

//: string
XMLAttrValue "XML Attribute Value"
  = "'" value:$[^']* "'" { return value; }
  / '"' value:$[^"]* '"' { return value; } //"

//: AST.CommentNode
XMLComment "XML Comment"
  = "<!--" value:$(!"-->" [^>])* "-->" {
      return {
        type: 'comment',
        value: value,
        position: position()
      };
    }

//: AST.TextNode
XMLCdata "XML CDATA Section"
  = "<![CDATA[" value:$(!"]]>" .)* "]]>" {
      return {
        type: 'text',
        value: value,
        position: position()
      };
    }

//: AST.TextNode
XMLLiteral "XML Literal"
  = value:$[^<>]+ {
      return {
        type: 'text',
        value: value,
        position: position()
      };
    }

//: void
SPL "Whitespace Line"
  = SP* (& EOL / ! .) {}

//: string
EOL "Newline Character"
  = "\r\n"
  / "\r"
  / "\n"

//: void
SP "Whitespace Character"
  = [ \t] {}
