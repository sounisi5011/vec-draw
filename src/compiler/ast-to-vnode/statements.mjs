function findFirstChildNode(node, expectedObject) {
  const expectedEntries = Object.entries(expectedObject);
  return node.children.find(
    childNode =>
      childNode && expectedEntries.every(([k, v]) => v === childNode[k]),
  );
}

function array2doublyLinkedList(array) {
  return array.map((val, index, arr) => ({
    prev: arr[index - 1],
    value: val,
    next: arr[index + 1],
  }));
}

function isStatementNode(node, statementName = null) {
  if (node.type === 'statement') {
    if (statementName === null) {
      return true;
    }
    if (typeof statementName === 'string') {
      return node.name === statementName;
    }
    if (Array.isArray(statementName)) {
      return statementName.includes(node.name);
    }
  }
  return false;
}

export function rect(statementNode) {
  const attrs = {};

  const coordNode = findFirstChildNode(statementNode, { type: 'coord' });
  if (coordNode) {
    ({ x: attrs.x, y: attrs.y } = coordNode.value);
  }

  const sizeNode = findFirstChildNode(statementNode, { type: 'size' });
  if (sizeNode) {
    ({ width: attrs.width, height: attrs.height } = sizeNode.value);
  }

  return {
    nodeName: 'rect',
    attributes: attrs,
    children: [],
  };
}

export function path(statementNode) {
  const attrs = {};

  const dataChildren = statementNode.children.filter(childNode =>
    /^(?:coord|statement)$/.test(childNode.type),
  );
  const dataLinkedList = array2doublyLinkedList(dataChildren);

  attrs.d = dataLinkedList
    .map(({ prev: prevNode, value: childNode, next: nextNode }) => {
      if (childNode.type === 'coord') {
        const coordNode = childNode;
        if (
          !prevNode ||
          isStatementNode(prevNode, ['close', 'circle', 'ellipse'])
        ) {
          return `M ${coordNode.value.x} ${coordNode.value.y}`;
        }
      } else if (isStatementNode(childNode, 'line')) {
        if (nextNode.type === 'coord') {
          const stopCoordNode = nextNode;
          const stopCoord = `${stopCoordNode.value.x} ${stopCoordNode.value.y}`;

          return `L ${stopCoord}`;
        }
      } else if (isStatementNode(childNode, 'close')) {
        return 'Z';
      } else if (isStatementNode(childNode, 'bezCurve')) {
        if (nextNode.type === 'coord') {
          const coordList = childNode.children
            .filter(node => node.type === 'coord')
            .map(coordNode => `${coordNode.value.x} ${coordNode.value.y}`);

          const stopCoordNode = nextNode;
          const stopCoord = `${stopCoordNode.value.x} ${stopCoordNode.value.y}`;

          if (coordList.length === 1) {
            return `Q ${coordList[0]} ${stopCoord}`;
          }
          if (coordList.length === 2) {
            return `C ${coordList[0]} ${coordList[1]} ${stopCoord}`;
          }
          // TODO: 2以上の制御点を有するn次ベジェ曲線の生成
        }
      } else if (isStatementNode(childNode, 'arc')) {
        if (nextNode.type === 'coord') {
          const sizeNode = findFirstChildNode(childNode, {
            type: 'size',
          });
          const [rx, ry] = [
            sizeNode.value.width / 2,
            sizeNode.value.height / 2,
          ];
          const radiusSize = `${rx} ${ry}`;

          const angleNode = findFirstChildNode(childNode, {
            type: 'angle',
          });
          const xAxisRotation = angleNode ? angleNode.value : 0;

          const sizeAttrValueNode = childNode.attributes.size;
          const largeArcFlag =
            sizeAttrValueNode && sizeAttrValueNode.value === 'large' ? 1 : 0;

          const dirAttrValueNode = childNode.attributes.dir;
          const sweepFlag =
            dirAttrValueNode &&
            /^(?:turn-left|clockwise)$/.test(dirAttrValueNode.value)
              ? 1
              : 0;

          const stopCoordNode = nextNode;
          const stopCoord = `${stopCoordNode.value.x} ${stopCoordNode.value.y}`;

          return (
            `A ${radiusSize}\n` +
            `  ${xAxisRotation}\n` +
            `  ${largeArcFlag} ${sweepFlag}\n` +
            `  ${stopCoord}`
          );
        }
      } else if (isStatementNode(childNode, ['circle', 'ellipse'])) {
        const currentCoordNode = prevNode;
        const currentCoord = `${currentCoordNode.value.x} ${
          currentCoordNode.value.y
        }`;

        const diagonalCoordNode = findFirstChildNode(childNode, {
          type: 'coord',
        });
        const diagonalCoord = `${diagonalCoordNode.value.x} ${
          diagonalCoordNode.value.y
        }`;

        const pathRotateAttrValueNode = childNode.attributes['path-rotate'];

        const width = Math.abs(
          diagonalCoordNode.value.x - currentCoordNode.value.x,
        );
        const height = Math.abs(
          diagonalCoordNode.value.y - currentCoordNode.value.y,
        );
        const sweepFlag =
          pathRotateAttrValueNode &&
          /^(?:turn-left|clockwise)$/.test(pathRotateAttrValueNode.value)
            ? 1
            : 0;

        if (isStatementNode(childNode, 'circle')) {
          const diameter = Math.sqrt(width ** 2 + height ** 2);
          const radius = diameter / 2;
          const radiusSize = `${radius} ${radius}`;

          return (
            `A ${radiusSize}\n` +
            `  0\n` +
            `  0 ${sweepFlag}\n` +
            `  ${diagonalCoord}\n` +
            `A ${radiusSize}\n` +
            `  0\n` +
            `  0 ${sweepFlag}\n` +
            `  ${currentCoord}`
          );
        }
        if (isStatementNode(childNode, 'ellipse')) {
          const sizeNode = findFirstChildNode(childNode, {
            type: 'size',
          });

          // TODO: もっとちゃんとした式に変える
          const { width: xRatio, height: yRatio } = sizeNode.value;
          const [rx, ry] = (() => {
            if (height === 0) {
              return [width / xRatio, (width / xRatio) * yRatio];
            }
            if (width === 0) {
              return [height / yRatio, (height / yRatio) * xRatio];
            }
            return [NaN, NaN];
          })().map(num => num / 2);
          const radiusSize = `${rx} ${ry}`;

          return (
            `A ${radiusSize}\n` +
            `  0\n` +
            `  0 ${sweepFlag}\n` +
            `  ${diagonalCoord}\n` +
            `A ${radiusSize}\n` +
            `  0\n` +
            `  0 ${sweepFlag}\n` +
            `  ${currentCoord}`
          );
        }
      }

      return null;
    })
    .filter(Boolean)
    .join('\n');

  return {
    nodeName: 'path',
    attributes: attrs,
    children: [],
  };
}
