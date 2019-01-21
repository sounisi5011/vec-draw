'use strict';

const indent = require('./src/indent.js');

console.log();
console.log('↓↓↓↓↓ ↓↓↓↓↓ ↓↓↓↓↓ ↓↓↓↓↓ ↓↓↓↓↓');
console.log('argv:');
console.log(indent(JSON.stringify(process.argv, null, 2)));

console.log('env.HUSKY_GIT_PARAMS:');
console.log(indent(JSON.stringify(process.env.HUSKY_GIT_PARAMS, null, 2)));

console.log('env.HUSKY_GIT_STDIN:');
console.log(indent(JSON.stringify(process.env.HUSKY_GIT_STDIN, null, 2)));
console.log('↑↑↑↑↑ ↑↑↑↑↑ ↑↑↑↑↑ ↑↑↑↑↑ ↑↑↑↑↑');
console.log();
