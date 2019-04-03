import * as statementNode2vnodeMap from './ast-to-vnode/statements';

function astChildren2vnodeList(children) {
  return children
    .filter(node => node.type === 'statement')
    .map(statementNode => {
      const statementNode2vnode = statementNode2vnodeMap[statementNode.name];
      if (statementNode2vnode) {
        return statementNode2vnode(statementNode);
      }
      return null;
    })
    .filter(node => node);
}

export default function ast2vnode(ast) {
  const rootElem = {
    nodeName: 'svg',
    attributes: {
      version: '1.1',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [],
  };

  rootElem.children = astChildren2vnodeList(ast);

  return rootElem;
}
