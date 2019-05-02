import * as Hast from './hast';
import propertyStringify from './property-stringify';

export default function propertiesStringify(
    properties: Hast.Properties,
): string {
    const attrStrList = Object.entries(properties)
        .map(([attr, value]) => propertyStringify(attr, value))
        .filter(attrStr => attrStr !== '');
    const isIncludedLineBreak = attrStrList.some(attrStr =>
        /[\r\n]/.test(attrStr),
    );
    return attrStrList
        .map(attrStr => attrStr.replace(/^|\r\n?|\n/g, '$& '))
        .join(isIncludedLineBreak ? '\n' : '');
}
