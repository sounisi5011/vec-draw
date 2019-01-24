/**
 * ある文字列 targetString の中に、文字列 searchString が行単位で含まれているか判定する。
 * String.prototype.includes()と異なり、行が一致しない場合は false を返す。
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line2\nline3")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "ine2\nline3")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "line2\nline")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "line2\r\nline3")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line2\nline3\n")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "\nline2\nline3")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "line")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line2")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line2\n")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "\nline2")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line1")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line1\n")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "\nline1")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4", "line4")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "line4\n")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "\nline4")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4\nline5\n", "line5")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4\nline5\n", "line5\n")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4\nline5\n", "line5\r")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4\nline5\r\n", "line5\r")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4\nline5\n", "\nline5")
 *
 * @example
 * // returns true
 * strIncludesLines("\nline1\nline2\nline3\nline4", "\nline1")
 *
 * @example
 * // returns false
 * strIncludesLines("\rline1\nline2\nline3\nline4", "\nline1")
 *
 * @example
 * // returns false
 * strIncludesLines("\r\nline1\nline2\nline3\nline4", "\nline1")
 *
 * @example
 * // returns false
 * strIncludesLines("line0\nline1\nline2\nline3\nline4", "\nline1")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\nline3\nline4", "")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\nline3\nline4\n", "")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\n\nline3\nline4", "")
 *
 * @example
 * // returns false
 * strIncludesLines("line1\nline2\r\nline3\nline4", "")
 *
 * @example
 * // returns true
 * strIncludesLines("line1\nline2\r\n\r\nline3\nline4", "")
 *
 * @example
 * // returns true
 * strIncludesLines("", "")
 *
 * @param {string} targetString 検索対象の文字列
 * @param {string} searchString targetString内に含まれているか検索する文字列
 * @return {boolean} targetString内にsearchStringが含まれていればtrueを返す
 */
function strIncludesLines(targetString, searchString) {
  let searchStartIndex = 0;
  while (searchStartIndex <= targetString.length) {
    /*
     * 文字列を検索
     */
    const matchIndex = targetString.indexOf(searchString, searchStartIndex);

    /*
     * 文字列が見つからなければ終了
     */
    if (matchIndex < 0) {
      break;
    }

    /** @type {string} マッチした文字列の前の文字 */
    const prevChar = targetString.charAt(matchIndex - 1);
    /** @type {string} マッチした文字列の次の文字 */
    const nextChar = targetString.charAt(matchIndex + searchString.length);
    /** @type {boolean} マッチした文字列が、検索対象文字列内の行頭から始まっていればtrueのフラグ */
    const isLineHeadStart =
      // マッチした文字列の前が、文字列の始まり、またはLFか検証
      /^\n?$/.test(prevChar) ||
      // マッチした文字列の前がCR、かつ、マッチした文字列の先頭がLFではないか検証
      /^\r[^\n]/.test(prevChar + searchString);
    /** @type {boolean} マッチした文字列が、検索対象文字列内の行末で終わっていればtrueのフラグ */
    const isEOLEnd = /[\r\n]$/.test(searchString)
      ? /*
         * マッチした文字列の最後が改行コードの場合、
         * マッチした文字列の最後と次の文字との間でCRLFが存在していないか検証
         */
        !/\r\n$/.test(searchString + nextChar)
      : /*
         * マッチした文字列の最後が改行コードではない場合、
         * マッチした文字列の次に改行コード、または文字列の終わりがくるか検証
         */
        /^[\r\n]?$/.test(nextChar);

    /*
     * マッチした文字列が検索対象文字列内で行頭から開始しており、
     * かつ、検索対象文字列内での行末で終了しているかを判定。
     */
    if (isLineHeadStart && isEOLEnd) {
      return true;
    }

    /*
     * 検索開始インデックスを更新
     */
    searchStartIndex = matchIndex + 1;
  }

  return false;
}

module.exports = strIncludesLines;
