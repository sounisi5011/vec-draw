import unified from 'unified';
import vfile from 'vfile';

export function canToStringVFileCompatible(
    value: unified.VFileCompatible,
): value is vfile.VFile | vfile.VFileContents {
    return typeof value.toString === 'function';
}

export function VFileCompatible2text(file: unified.VFileCompatible): string {
    if (canToStringVFileCompatible(file)) {
        return file.toString('utf8');
    }
    const { contents } = file;
    return contents ? contents.toString('utf8') : '';
}
