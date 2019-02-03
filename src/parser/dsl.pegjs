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
  = st:(statement_value / SPL) stl:statement_children* {
      return [].concat(st, ...stl);
    }

statement
  = name:Identifier st:statement_attr* SP* StartIndent stl:statement_children* EndIndent {
      const children = [].concat(st, ...stl);
      return {
        type: 'statement',
        name: name,
        attributes: children
          .filter(node => node.type === 'attr')
          .reduce((obj, attrNode) => {
            obj[attrNode.name] = attrNode.value;
            return obj;
          }, {}),
        children: children.filter(node => node.type !== 'attr'),
        fullChildren: children,
        position: location2Position(location())
      };
    }

statement_attr
  = SP+ value:(attr / value) {
      return value;
    }

statement_children
  = EOL value:(statement_value / SPL) {
      return value;
    }

statement_value
  = Indent value:(attr / statement / value) {
      return value;
    }

attr
  = name:Identifier "=" SP* value:value {
      return {
        type: 'attr',
        name: name,
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
        position: location2Position(location())
      };
    }

angle
  = value:number unit:"deg"i {
      return {
        type: 'angle',
        value: value.value,
        unit: unit.toLowerCase(),
        position: location2Position(location())
      };
    }

number
  = value:$([0-9]* "." [0-9]+ / [0-9]+) {
      return {
        type: 'number',
        value: value.replace(/^\./, '0.'),
        position: location2Position(location())
      };
    }

symbol
  = value:Identifier {
      return {
        type: 'symbol',
        value: value,
        position: location2Position(location())
      };
    }

Identifier
  = $([_a-z]i [_a-z0-9-]i*)

Indent
  = spaces:$(SP*) ! SP &{
      const currentIndent = indentList.join('');

      if (spaces === currentIndent) {
        if (!indentStart) {
          return true;
        }
      } else if (indentStart && spaces.startsWith(currentIndent)) {
        const newIndent = spaces.substr(currentIndent.length);
        indentList.push(newIndent);
        indentStart = false;
        return true;
      }

      return false;
    }

StartIndent
  = &{
      indentStart = true;
      return true;
    }

EndIndent
  = &{
      if (indentStart === false) {
        indentList.pop();
      } else {
        indentStart = false;
      }
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
