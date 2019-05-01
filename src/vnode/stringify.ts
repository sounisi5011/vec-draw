import VNode from './vnode';

/**
 * @param {VNode} vnode
 * @return {string}
 */
export default function vnode2str({
    nodeName,
    attributes,
    children,
}: VNode): string {
    const attrsStr = Object.entries(attributes).reduce((acc, [attr, value]) => {
        let str = acc;

        str += /[\r\n]/.test(str)
            ? `\n${' '.repeat(`<${nodeName} `.length)}`
            : ' ';

        if (/[\r\n]/.test(value)) {
            const indent = ' '.repeat(`<${nodeName} ${attr}="`.length);
            const indentedValue = value.replace(
                /\r\n?|\n/g,
                m => `${m}${indent}`,
            );
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
