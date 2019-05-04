import * as Hast from './hast';

export default interface VNode extends Hast.Element {
    children: VNode[];
}

export function isVNode(value: unknown): value is VNode {
    if (typeof value === 'object' && value !== null) {
        const obj: { [key: string]: unknown } = value;
        if (
            obj.type === 'element' &&
            typeof obj.tagName === 'string' &&
            ((typeof obj.properties === 'object' && obj.properties) ||
                typeof obj.properties === 'undefined') &&
            Array.isArray(obj.children)
        ) {
            return true;
        }
    }
    return false;
}
