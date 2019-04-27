export default interface VNode {
    nodeName: string;
    attributes: { [key: string]: string };
    children: VNode[];
}

export function isVNode(value: unknown): value is VNode {
    if (typeof value === 'object' && value !== null) {
        const obj: { [key: string]: unknown } = value;
        if (
            typeof obj.nodeName === 'string' &&
            typeof obj.attributes === 'object' &&
            obj.attributes &&
            Array.isArray(obj.children)
        ) {
            return true;
        }
    }
    return false;
}
