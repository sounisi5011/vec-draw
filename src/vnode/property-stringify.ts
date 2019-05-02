import * as Hast from './hast';

export default function propertyStringify(
    name: Hast.PropertyName,
    value: Hast.PropertyValue,
): string {
    const attrPrefix = `${name}="`;

    if (value === undefined || value === null || value === false) {
        return '';
    }
    if (value === true || value === '') {
        return `${attrPrefix}${name}"`;
    }
    if (typeof value === 'string') {
        if (/[\r\n]/.test(value)) {
            const indent = ' '.repeat(attrPrefix.length);
            const indentedValue = value.replace(/\r\n?|\n/g, `$&${indent}`);
            return `${attrPrefix}${indentedValue}"`;
        }
        return `${attrPrefix}${value}"`;
    }
    return propertyStringify(name, String(value));
}
