/*:header

import * as AST from './dsl.type';

*/

{
  const indentList: string[] = [];
  let indentStart = false;

  function filterNullable<T>(value: T): value is Exclude<T, null | undefined> {
    return value !== null && value !== undefined;
  }

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
}

//: AST.StatementValueNode[]
start
  = st:statement_child_line stl:statement_children EOL? {
      return ((st: AST.StatementValueNode | null, stl: (AST.StatementValueNode | null)[]) => {
        return [st, ...stl].filter(filterNullable);
      })(st, stl);
    }

//: AST.StatementNode
statement "DSL Statement"
  = name:symbol st:statement_attr* comment:(SP+ SingleLineComment / SP*) StartIndent stl:statement_children {
      return ((
          name: AST.SymbolNode,
          st: (AST.XMLNode | AST.AttributeNode | AST.ValueNode)[],
          comment: (AST.CommentNode | undefined)[],
          stl: (AST.StatementValueNode | null)[]
        ) => {
        const fullChildren: AST.StatementValueNode[] = [...st, ...comment, ...stl].filter(filterNullable);
        const [attributes, attributeNodes, children] = fullChildren
          .reduce(([attributes, attributeNodes, children], childNode) => {
            if (childNode.type === 'attr') {
              const attrNode = childNode;
              attributes[attrNode.name] = attrNode.value;
              attributeNodes[attrNode.name] = attrNode;
            } else if (childNode.type !== 'comment') {
              children.push(childNode);
            }
            return [attributes, attributeNodes, children];
          }, [{} as AST.StatementAttributes, {} as AST.StatementAttributeNodes, [] as AST.StatementValueNode[]]);

        return {
          type: 'statement',
          name: name.value,
          nameSymbol: name,
          attributes: attributes,
          attributeNodes: attributeNodes,
          children: children,
          fullChildren: fullChildren,
          position: position(),
        };
      })(name, st, comment, stl);
    }

//: AST.XMLNode | AST.AttributeNode | AST.ValueNode
statement_attr
  = SP+ value:(XMLStatement / attr / value) {
      return value;
    }

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
          expected({
            scope: 'indentation',
            type: 'not equal',
            mode: 'same',
            expectedIndent: currentIndent,
            matchIndent: spaces,
            message: 'インデント不一致',
          }, locationData);
        }
      } else if (currentIndent.length < spaces.length) {
        // インデントが上がった場合

        if (!indentStart) {
          expected({
            scope: 'indentation',
            type: 'unexpected indent',
            mode: 'same',
            expectedIndent: currentIndent,
            matchIndent: spaces,
            message: '予期しない字上げ'
          }, locationData);
        } else if (!spaces.startsWith(currentIndent)) {
          expected({
            scope: 'indentation',
            type: 'not equal',
            mode: 'indent',
            expectedIndent: currentIndent,
            matchIndent: spaces,
            message: 'インデント不一致'
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
            expected({
              scope: 'indentation',
              type: 'unexpected unindent',
              mode: 'outdent',
              expectedIndent: currentIndent,
              matchIndent: spaces,
              message: '予期しない字下げ'
            }, locationData);
          }
          if (dedent.length === spaces.length) {
            if (spaces === dedent) {
              indentList.pop();
              indentStart = false;
              return false;
            } else {
              expected({
                scope: 'indentation',
                type: 'not equal',
                mode: 'outdent',
                expectedIndent: currentIndent,
                matchIndent: spaces,
                message: 'インデント不一致'
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
        expected({
          scope: 'xml',
          endTagName: end.name,
          message: '開始していない閉じタグ',
        }, end.position);
      }

      return {
        type: 'xml',
        content: contentValue,
        position: position()
      };
    }
  / end:XMLElemEnd {
      expected({
        scope: 'xml',
        endTagName: end.name,
        message: '開始していない閉じタグ',
      });
    }

//: AST.ElementNode
XMLElement "XML Element"
  = XMLElemSelfClose
  / start:XMLElemStart content:(XMLLiteral / XMLCdata / XMLComment / XMLElement)* end:(XMLElemEnd / !XMLElemEnd) {
      if (end === undefined) {
        expected({
          scope: 'xml',
          startTagName: start.name,
          message: '閉じていない開始タグ',
        });
      } else if (start.name !== end.name) {
        const { start: { offset: startOffset } } = location();
        const { start: { offset: endOffset } } = end.position;
        expected({
          scope: 'xml',
          startTagName: start.name,
          endTagName: end.name,
          message: '閉じていない開始タグ',
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
