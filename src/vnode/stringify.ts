import VNode from './vnode';
import propertiesStringify from './properties-stringify';

/**
 * @param {VNode} vnode
 * @return {string}
 */
export default function vnodeStringify({
    tagName,
    properties,
    children,
}: VNode): string {
    const elemPrefix = `<${tagName}`;
    const propStr = propertiesStringify(properties);
    const propIndent = ' '.repeat(elemPrefix.length);
    const indentedPropStr = /[\r\n]/.test(propStr)
        ? propStr.replace(/\r\n?|\n/g, `$&${propIndent}`)
        : propStr;

    if (children.length > 0) {
        const childrenStr = children
            .map(vnodeStringify)
            .join('')
            .replace(/^(?=[^\r\n]+$)/gm, '  ');
        return `${elemPrefix}${indentedPropStr}>\n${childrenStr}</${tagName}>\n`;
    }

    return `${elemPrefix}${indentedPropStr}/>\n`;
}
