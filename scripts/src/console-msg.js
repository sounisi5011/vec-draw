'use strict';

/**
 * @example
 * // returns "output: line1\n        line2\n        line3"
 * consoleMsg("output: ", "line1\nline2\nline3")
 *
 * @example
 * // returns "test: line1\r      line2\n      line3\r\n      line4"
 * consoleMsg("test: ", "line1\rline2\nline3\r\nline4")
 *
 * @example
 * // returns "The answer to life the universe and everything: 42\n\n                                                42\r\r\r                                                42\r\n\r\n\r\n\r\n                                                42\n\n\n\n\n\n"
 * consoleMsg("The answer to life the universe and everything: ", "42\n\n42\r\r\r42\r\n\r\n\r\n\r\n42\n\n\n\n\n\n")
 *
 * @param {string} firstLinePrefix
 * @param {string|Array<string|null>} msg
 * @return {string}
 */
function consoleMsg(firstLinePrefix, msg) {
  const indentStr = ' '.repeat(firstLinePrefix.length);
  const msgStr = (
    Array.isArray(msg) ?
    msg.filter(line => line !== null).join('\n') :
    String(msg)
  );

  return firstLinePrefix + msgStr.replace(/(?:\r\n?|\n)(?![\r\n]|$)/g, match => (match + indentStr));
}

module.exports = consoleMsg;
