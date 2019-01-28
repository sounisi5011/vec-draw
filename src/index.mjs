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
  return vnode2str(rootElem);
}
