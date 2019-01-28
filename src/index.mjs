import { parse } from './parser';

/**
 * @typedef {{nodeName: string, attributes: Object<string, string>, children: Array<VNode>}} VNode
 */

/**
 * @param {VNode} vnode
 * @return {string}
 */
function vnode2str({ nodeName, attributes, children }) {
  const attrsStr = Object.entries(attributes).reduce((acc, [attr, value]) => {
    let str = acc;

    str += /[\r\n]/.test(str) ? `\n${' '.repeat(`<${nodeName} `.length)}` : ' ';

    if (/[\r\n]/.test(value)) {
      const indent = ' '.repeat(`<${nodeName} ${attr}="`.length);
      const indentedValue = value.replace(/\r\n?|\n/g, m => `${m}${indent}`);
      str += `${attr}="${indentedValue}"`;
    } else {
      str += `${attr}="${value}"`;
    }

    return str;
  }, '');

  if (children.length > 0) {
    const childrenStr = children
      .map(vnode2str)
      .join('')
      .replace(/^(?=[^\r\n]+$)/gm, '  ');
    return `<${nodeName}${attrsStr}>\n${childrenStr}</${nodeName}>\n`;
  }

  return `<${nodeName}${attrsStr}/>\n`;
}

/**
 * @param {string} text 変換するvec-draw DSLの文字列
 * @return {string} 生成したSVG
 */
export function compile(text) {
  const rootElem = {
    nodeName: 'svg',
    attributes: {
      version: '1.1',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [],
  };

  /*
   * vec-draw DSLを解析し、定義文ごとに処理を行う
   */
  const ast = parse(text);

  // eslint-disable-next-line no-shadow
  rootElem.children = (function getChildren(ast) {
    return ast
      .filter(node => node.type === 'statement')
      .map(statementNode => {
        if (statementNode.name === 'rect') {
          /*
           * rect要素を追加する
           */
          const rectElem = {
            nodeName: 'rect',
            attributes: {},
            children: [],
          };

          const coordNode = statementNode.value.find(
            node => node.type === 'coord',
          );
          if (coordNode) {
            ({
              x: rectElem.attributes.x,
              y: rectElem.attributes.y,
            } = coordNode.value);
          }

          const sizeNode = statementNode.value.find(
            node => node.type === 'size',
          );
          if (sizeNode) {
            ({
              width: rectElem.attributes.width,
              height: rectElem.attributes.height,
            } = sizeNode.value);
          }

          return rectElem;

          // eslint-disable-next-line no-else-return
        } else if (statementNode.name === 'path') {
          /*
           * path要素を追加する
           */
          const pathElem = {
            nodeName: 'path',
            attributes: {},
            children: [],
          };

          pathElem.attributes.d = statementNode.value
            .map((node, index, childNodeList) => {
              const prevNode = childNodeList[index - 1];
              if (node.type === 'coord') {
                if (
                  !prevNode ||
                  (prevNode.type === 'statement' &&
                    /^(?:close|circle|ellipse)$/.test(prevNode.name))
                ) {
                  return `M ${node.value.x} ${node.value.y}\n`;
                }
                return ` ${node.value.x} ${node.value.y}\n`;

                // eslint-disable-next-line no-else-return
              } else if (node.type === 'statement') {
                if (node.name === 'line') {
                  return 'L';

                  // eslint-disable-next-line no-else-return
                } else if (node.name === 'close') {
                  return 'Z\n';
                } else if (node.name === 'bezCurve') {
                  const coordList = node.value
                    // eslint-disable-next-line no-shadow
                    .filter(node => node.type === 'coord')
                    // eslint-disable-next-line no-shadow
                    .map(node => `${node.value.x} ${node.value.y}`);
                  if (coordList.length === 1) {
                    return `Q ${coordList[0]}`;

                    // eslint-disable-next-line no-else-return
                  } else if (coordList.length === 2) {
                    return `C ${coordList[0]} ${coordList[1]}`;
                  } else {
                    return `C ${coordList[0]} ${coordList[1]}`;
                  }
                } else if (node.name === 'arc') {
                  const sizeNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'size',
                  );
                  const angleNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'angle',
                  );
                  const sizeAttrNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'attr' && node.name === 'size',
                  );
                  const dirAttrNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'attr' && node.name === 'dir',
                  );
                  const sizeAttrValueNode = sizeAttrNode
                    ? sizeAttrNode.value
                    : null;
                  const dirAttrValueNode = dirAttrNode
                    ? dirAttrNode.value
                    : null;

                  const [rx, ry] = [
                    sizeNode.value.width / 2,
                    sizeNode.value.height / 2,
                  ];
                  const xAxisRotation = angleNode ? angleNode.value : 0;
                  const largeArcFlag =
                    sizeAttrValueNode && sizeAttrValueNode.value === 'large'
                      ? 1
                      : 0;
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
                } else if (/^(?:circle|ellipse)$/.test(node.name)) {
                  const currentCoordNode = prevNode;
                  const coordNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'coord',
                  );
                  const sizeNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'size',
                  );
                  const pathRotateAttrNode = node.value.find(
                    // eslint-disable-next-line no-shadow
                    node => node.type === 'attr' && node.name === 'path-rotate',
                  );
                  const pathRotateAttrValueNode = pathRotateAttrNode
                    ? pathRotateAttrNode.value
                    : null;

                  const width = Math.abs(
                    coordNode.value.x - currentCoordNode.value.x,
                  );
                  const height = Math.abs(
                    coordNode.value.y - currentCoordNode.value.y,
                  );
                  const sweepFlag =
                    pathRotateAttrValueNode &&
                    /^(?:turn-left|clockwise)$/.test(
                      pathRotateAttrValueNode.value,
                    )
                      ? 1
                      : 0;
                  if (node.name === 'ellipse') {
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
                      `  ${currentCoordNode.value.x} ${
                        currentCoordNode.value.y
                      }\n`
                    );

                    // eslint-disable-next-line no-else-return
                  } else if (node.name === 'circle') {
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
                      `  ${currentCoordNode.value.x} ${
                        currentCoordNode.value.y
                      }\n`
                    );
                  }
                }
              }
              return '';
            })
            .join('')
            .replace(/^\n+|\n+$/, '');

          return pathElem;
        }

        return null;
      })
      .filter(node => node);
  })(ast);

  return vnode2str(rootElem);
}
