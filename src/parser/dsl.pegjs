{
  const indentList = [];
  let indentStart = false;
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
        fullChildren: children
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
        value: value
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
          y: y.value,
        }
      };
    }

size
  = "(" SP* width:number SP* "x" SP* height:number SP* ")" {
      return {
        type: 'size',
        value: {
          width: width.value,
          height: height.value,
        }
      };
    }

angle
  = value:number unit:"deg"i {
      return {
        type: 'angle',
        value: value.value,
        unit: unit.toLowerCase()
      };
    }

number
  = value:$([0-9]* "." [0-9]+ / [0-9]+) {
      return {
        type: 'number',
        value: value.replace(/^\./, '0.')
      };
    }

symbol
  = value:Identifier {
      return {
        type: 'symbol',
        value: value
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
