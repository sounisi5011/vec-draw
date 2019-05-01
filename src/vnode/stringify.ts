import VNode from './vnode';

/**
 * @param {VNode} vnode
 * @return {string}
 */
export default function vnodeStringify({
    tagName,
    properties,
    children,
}: VNode): string {
    const propStr = Object.entries(properties).reduce((acc, [attr, value]) => {
        let str = acc;

        str += /[\r\n]/.test(str)
            ? `\n${' '.repeat(`<${tagName} `.length)}`
            : ' ';

        if (/[\r\n]/.test(value)) {
            const indent = ' '.repeat(`<${tagName} ${attr}="`.length);
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
            .map(vnodeStringify)
            .join('')
            .replace(/^(?=[^\r\n]+$)/gm, '  ');
        return `<${tagName}${propStr}>\n${childrenStr}</${tagName}>\n`;
    }

    return `<${tagName}${propStr}/>\n`;
}
