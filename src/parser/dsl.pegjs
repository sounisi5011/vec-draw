{
  const indentList = [];
  let indentStart = false;

  function location2Position(locationData) {
    return {
      start: {
        line: locationData.start.line,
        column: locationData.start.column,
        offset: locationData.start.offset
      },
      end: {
        line: locationData.end.line,
        column: locationData.end.column,
        offset: locationData.end.offset
      }
    };
  }
}

start
  = st:(SPL / statement_value) stl:statement_children* {
      return [].concat(st, ...stl);
    }

statement
  = name:symbol st:statement_attr* SP* StartIndent stl:statement_children* {
      const fullChildren = [].concat(st, ...stl);
      const [attributes, attributeNodes, children] = fullChildren
        .reduce(([attributes, attributeNodes, children], childNode) => {
          if (childNode.type === 'attr') {
            const attrNode = childNode;
            attributes[attrNode.name] = attrNode.value;
            attributeNodes[attrNode.name] = attrNode;
          } else {
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
        position: location2Position(location())
      };
    }

statement_attr
  = SP+ value:(attr / value) {
      return value;
    }

statement_children
  = EOL value:(SPL / statement_value) {
      return value;
    }

statement_value
  = Indent value:(attr / statement / value) {
      return value;
    }

attr
  = name:symbol "=" SP* value:value {
      return {
        type: 'attr',
        name: name.value,
        nameSymbol: name,
        value: value,
        position: location2Position(location())
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
        position: location2Position(location())
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
        position: location2Position(location())
      };
    }

angle
  = value:number unit:"deg"i {
      return {
        type: 'angle',
        value: value.value,
        valueNode: value,
        unit: unit.toLowerCase(),
        position: location2Position(location())
      };
    }

number
  = value:$([0-9]* "." [0-9]+ / [0-9]+) {
      return {
        type: 'number',
        value: value.replace(/^\./, '0.'),
        rawValue: value,
        position: location2Position(location())
      };
    }

symbol
  = value:$([_a-z]i [_a-z0-9-]i*) {
      return {
        type: 'symbol',
        value: value,
        position: location2Position(location())
      };
    }

Indent
  = spaces:$(SP*) ! SP &{
      const currentIndent = indentList.join('');

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
          });
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
          });
        } else if (!spaces.startsWith(currentIndent)) {
          expected({
            scope: 'indentation',
            type: 'not equal',
            mode: 'indent',
            expectedIndent: currentIndent,
            matchIndent: spaces,
            message: 'インデント不一致'
          });
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
            });
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
              });
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

SPL
  = sp:SP* (& EOL / ! .) {
      return sp;
    }

EOL
  = "\r\n"
  / "\r"
  / "\n"

SP
  = [ \t]
