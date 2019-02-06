{
  const indentList = [];
  let indentStart = false;

  /**
   * @param {number} [startOffset=location().start.offset]
   * @param {number} [endOffset=location().end.offset]
   * @return {{line: number, column: number, offset: number}}
   */
  function position(startOffset = null, endOffset = null) {
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
  function computePoint(offsetInt) {
    const inputData = input.substring(0, offsetInt);
    const lineBreakCount = (inputData.match(/\r\n?|\n/g) || []).length;
    const currentLineText = /(?:^|\r\n?|\n)([^\r\n]*)$/.exec(inputData)[1];

    return {
      line: lineBreakCount + 1,
      column: currentLineText.length + 1,
      offset: offsetInt,
    };
  }
}

start
  = st:(SingleLineComment / SPL / statement_value) stl:statement_children* {
      return [].concat(st, ...stl).filter(Boolean);
    }

statement
  = name:symbol st:statement_attr* comment:(SP+ SingleLineComment / SP*) StartIndent stl:statement_children* {
      const fullChildren = [].concat(...st, ...comment, ...stl).filter(Boolean);
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
        }, [{}, {}, []]);

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
    }

statement_attr
  = SP+ value:(XMLStatement / attr / value) {
      return value;
    }

statement_children
  = EOL value:(SPL / statement_value) {
      return value;
    }

statement_value
  = Indent value:(SingleLineComment / XMLStatement / attr / statement / value) {
      return value;
    }

attr
  = name:symbol "=" SP* value:value {
      return {
        type: 'attr',
        name: name.value,
        nameSymbol: name,
        value: value,
        position: position()
      };
    }

value
  = coord
  / size
  / angle
  / number
  / symbol

coord
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

size
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

angle
  = value:number unit:"deg"i {
      return {
        type: 'angle',
        value: value.value,
        valueNode: value,
        unit: unit.toLowerCase(),
        position: position()
      };
    }

number
  = value:$([0-9]* "." [0-9]+ / [0-9]+) {
      return {
        type: 'number',
        value: value.replace(/^\./, '0.'),
        rawValue: value,
        position: position()
      };
    }

symbol
  = value:$([_a-z]i [_a-z0-9-]i*) {
      return {
        type: 'symbol',
        value: value,
        position: position()
      };
    }

SingleLineComment
  = "--" value:$(!EOL .)* {
      return {
        type: 'comment',
        value: value,
        position: position()
      };
    }

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

StartIndent
  = &{
      indentStart = true;
      return true;
    }

XMLStatement
  = contentValue:(XMLCdata / XMLComment / XMLElement) {
      return {
        type: 'xml',
        content: contentValue,
        position: position()
      };
    }

XMLElement
  = XMLElemSelfClose
  / start:XMLElemStart content:(XMLLiteral / XMLCdata / XMLComment / XMLElement)* end:XMLElemEnd {
      return {
        type: "element",
        tagName: start.name,
        properties: start.attr,
        children: content,
        position: position()
      };
    }

XMLElemSelfClose
  = "<" nodeName:$([a-z]i [a-z0-9-]i*) attrList:(XMLAttr / SP / EOL)* "/>" {
      return {
        type: "element",
        tagName: nodeName,
        properties: attrList.reduce((properties, attr) => {
          if (typeof attr === "object") {
            const {name: attrName, value: attrValue} = attr;
            properties[attrName] = attrValue;
          }
          return properties;
        }, {}),
        children: [],
        position: position()
      };
    }

XMLElemStart
  = "<" nodeName:$([a-z]i [a-z0-9-]i*) attrList:(XMLAttr / SP / EOL)* ">" {
      return {
        name: nodeName,
        attr: attrList.reduce((properties, attr) => {
          if (typeof attr === "object") {
            const {name: attrName, value: attrValue} = attr;
            properties[attrName] = attrValue;
          }
          return properties;
        }, {})
      };
    }

XMLElemEnd
  = "</" nodeName:$([a-z]i [a-z0-9-]i*) ">" {
      return {
        name: nodeName
      };
    }

XMLAttr
  = name:$([a-z]i [a-z0-9-]i*) SP* "=" SP* value:XMLAttrValue {
      return {
        name: name,
        value: value,
      };
    }

XMLAttrValue
  = "'" value:$[^']* "'" { return value; }
  / '"' value:$[^"]* '"' { return value; } //"

XMLComment
  = "<!--" value:$(!"-->" [^>])* "-->" {
      return {
        type: 'comment',
        value: value,
        position: position()
      };
    }

XMLCdata
  = "<![CDATA[" value:$(!"]]>" .)* "]]>" {
      return {
        type: 'text',
        value: value,
        position: position()
      };
    }

XMLLiteral
  = value:$[^<>]+ {
      return {
        type: 'text',
        value: value,
        position: position()
      };
    }

SPL
  = SP* (& EOL / ! .) {}

EOL
  = "\r\n"
  / "\r"
  / "\n"

SP
  = [ \t] {}
