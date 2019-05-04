import test from 'ava';
import unified from 'unified';
import { vnodeStringify, unifiedVnodeStringify } from '../../src';
import VNode from '../../src/vnode';

test('unifiedで使用するVNode文字列化関数の出力確認', t => {
    const vnodeTree: VNode = {
        type: 'element',
        tagName: 'svg',
        properties: {
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg',
        },
        children: [
            {
                type: 'element',
                tagName: 'rect',
                children: [],
            },
            {
                type: 'element',
                tagName: 'rect',
                properties: {
                    x: 50,
                    y: 60,
                },
                children: [],
            },
            {
                type: 'element',
                tagName: 'rect',
                properties: {
                    x: 100,
                    y: 0,
                    transform: 'translate(30)\nrotate(45 50 50)',
                    style: 'stroke: #000;\nfill: #0086B2;',
                },
                children: [],
            },
        ],
    };

    const defaultXML = vnodeStringify(vnodeTree);
    const unifiedXML = unified()
        .use(unifiedVnodeStringify)
        .stringify(vnodeTree);
    t.deepEqual(defaultXML, unifiedXML);
});
