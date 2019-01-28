/**
 * @typedef {{nodeName: string, attributes: Object<string, string>, children: Array<VNode>}} VNode
 */

/**
 * @param {VNode} vnode
 * @return {string}
 */
function vnode2str({ nodeName, attributes, children }) {
  const attrsStr = Object.entries(attributes)
    .map(([attr, value]) => ` ${attr}="${value}"`)
    .join('');

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
  const pattern = /(?:^|[\r\n])([a-zA-Z_][a-zA-Z0-9_-]*)((?: +[^\r\n]*)?(?:(?:\r\n?|\n)(?: +[^\r\n]*)?)*)(?=[\r\n]|$)/g;
  let match = null;
  while ((match = pattern.exec(text))) {
    const [, nodeName, contents] = match;
    if (nodeName === 'rect') {
      /*
       * rect要素を追加する
       */

      const rectElem = {
        nodeName: 'rect',
        attributes: {},
        children: [],
      };

      const coordMatch = /\(([0-9]+) *, *([0-9]+)\)/.exec(contents);
      if (coordMatch) {
        rectElem.attributes.x = coordMatch[1];
        rectElem.attributes.y = coordMatch[2];
      }

      const sizeMatch = /\(([0-9]+) *x *([0-9]+)\)/.exec(contents);
      if (sizeMatch) {
        rectElem.attributes.width = sizeMatch[1];
        rectElem.attributes.height = sizeMatch[2];
      }

      rootElem.children.push(rectElem);
    }
  }

  return vnode2str(rootElem);
}
