/**
 * @example
 * // returns "  line1\n  line2\n  line3"
 * indent("line1\nline2\nline3")
 *
 * @example
 * // returns "  line1\r\r  line2\r\n\r\n\r\n  line3\n\n\n\n"
 * indent("line1\r\rline2\r\n\r\n\r\nline3\n\n\n\n")
 *
 * @example
 * // returns "    line1\n    line2\n    line3\n"
 * indent("line1\nline2\nline3\n", 4)
 *
 * @example
 * // "\tline1\n\n\tline2\n\tline3\n\n"
 * indent("line1\n\nline2\nline3\n\n", "\t")
 *
 * @param {string} str
 * @param {number|string} indentCountOrIndentStr
 * @return {string}
 */
function indent(str, indentCountOrIndentStr = 2) {
  const indentStr =
    typeof indentCountOrIndentStr === 'number'
      ? ' '.repeat(indentCountOrIndentStr)
      : String(indentCountOrIndentStr);
  return String(str).replace(/^(?!$)/gm, () => indentStr);
}

module.exports = indent;
