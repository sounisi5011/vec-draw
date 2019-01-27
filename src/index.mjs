/**
 * @param {string} text 変換するvec-draw DSLの文字列
 * @return {string} 生成したSVG
 */
export function compile(text) {
  if (text === '') {
    return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  }
};
