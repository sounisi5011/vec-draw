import { parse } from './parser';
import ast2vnode from './compiler/ast-to-vnode';

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
  /*
   * vec-draw DSLを解析し、定義文ごとに処理を行う
   */
  const ast = parse(text);

  const vnode = ast2vnode(ast);

  return vnode2str(vnode);
}

export * from './error';
