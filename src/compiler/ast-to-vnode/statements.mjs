function findFirstChildNode(node, expectedObject) {
  const expectedEntries = Object.entries(expectedObject);
  return node.children.find(
    childNode =>
      childNode && expectedEntries.every(([k, v]) => v === childNode[k]),
  );
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

  attrs.d = statementNode.children
    .map((childNode, index, childNodeList) => {
      const prevNode = childNodeList[index - 1];
      if (childNode.type === 'coord') {
        const coordNode = childNode;

        if (
          !prevNode ||
          (prevNode.type === 'statement' &&
            /^(?:close|circle|ellipse)$/.test(prevNode.name))
        ) {
          return `M ${coordNode.value.x} ${coordNode.value.y}\n`;
        }
        return ` ${coordNode.value.x} ${coordNode.value.y}\n`;

        // eslint-disable-next-line no-else-return
      } else if (childNode.type === 'statement') {
        // eslint-disable-next-line no-shadow
        const statementNode = childNode;

        if (statementNode.name === 'line') {
          return 'L';

          // eslint-disable-next-line no-else-return
        } else if (statementNode.name === 'close') {
          return 'Z\n';
        } else if (statementNode.name === 'bezCurve') {
          const coordList = statementNode.children
            .filter(node => node.type === 'coord')
            .map(coordNode => `${coordNode.value.x} ${coordNode.value.y}`);
          if (coordList.length === 1) {
            return `Q ${coordList[0]}`;

            // eslint-disable-next-line no-else-return
          } else if (coordList.length === 2) {
            return `C ${coordList[0]} ${coordList[1]}`;
          } else {
            return `C ${coordList[0]} ${coordList[1]}`;
          }
        } else if (statementNode.name === 'arc') {
          const sizeNode = findFirstChildNode(statementNode, {
            type: 'size',
          });
          const angleNode = findFirstChildNode(statementNode, {
            type: 'angle',
          });
          const sizeAttrValueNode = statementNode.attributes.size;
          const dirAttrValueNode = statementNode.attributes.dir;

          const [rx, ry] = [
            sizeNode.value.width / 2,
            sizeNode.value.height / 2,
          ];
          const xAxisRotation = angleNode ? angleNode.value : 0;
          const largeArcFlag =
            sizeAttrValueNode && sizeAttrValueNode.value === 'large' ? 1 : 0;
          const sweepFlag =
            dirAttrValueNode &&
            /^(?:turn-left|clockwise)$/.test(dirAttrValueNode.value)
              ? 1
              : 0;

          return (
            `A ${rx} ${ry}\n` +
            `  ${xAxisRotation}\n` +
            `  ${largeArcFlag} ${sweepFlag}\n` +
            ` `
          );
        } else if (/^(?:circle|ellipse)$/.test(statementNode.name)) {
          const currentCoordNode = prevNode;
          const coordNode = findFirstChildNode(statementNode, {
            type: 'coord',
          });
          const sizeNode = findFirstChildNode(statementNode, {
            type: 'size',
          });
          const pathRotateAttrValueNode =
            statementNode.attributes['path-rotate'];

          const width = Math.abs(coordNode.value.x - currentCoordNode.value.x);
          const height = Math.abs(coordNode.value.y - currentCoordNode.value.y);
          const sweepFlag =
            pathRotateAttrValueNode &&
            /^(?:turn-left|clockwise)$/.test(pathRotateAttrValueNode.value)
              ? 1
              : 0;
          if (statementNode.name === 'ellipse') {
            const { width: xRatio, height: yRatio } = sizeNode.value;
            const [rx, ry] = (() => {
              if (height === 0) {
                return [width / xRatio, (width / xRatio) * yRatio];
                // eslint-disable-next-line no-else-return
              } else if (width === 0) {
                return [height / yRatio, (height / yRatio) * xRatio];
              }
              return [NaN, NaN];
            })().map(num => num / 2);

            return (
              `A ${rx} ${ry}\n` +
              `  0\n` +
              `  0 ${sweepFlag}\n` +
              `  ${coordNode.value.x} ${coordNode.value.y}\n` +
              `A ${rx} ${ry}\n` +
              `  0\n` +
              `  0 ${sweepFlag}\n` +
              `  ${currentCoordNode.value.x} ${currentCoordNode.value.y}\n`
            );

            // eslint-disable-next-line no-else-return
          } else if (statementNode.name === 'circle') {
            const diameter = Math.sqrt(width ** 2 + height ** 2);
            const radius = diameter / 2;
            return (
              `A ${radius} ${radius}\n` +
              `  0\n` +
              `  0 ${sweepFlag}\n` +
              `  ${coordNode.value.x} ${coordNode.value.y}\n` +
              `A ${radius} ${radius}\n` +
              `  0\n` +
              `  0 ${sweepFlag}\n` +
              `  ${currentCoordNode.value.x} ${currentCoordNode.value.y}\n`
            );
          }
        }
      }
      return '';
    })
    .join('')
    .replace(/^\n+|\n+$/, '');

  return {
    nodeName: 'path',
    attributes: attrs,
    children: [],
  };
}
