'use strict'

module.exports = function base64Length (source) {
  var sourceLength = source.length
  var paddingLength = (source[sourceLength - 2] === '=' ? 2 : (source[sourceLength - 1] === '=' ? 1 : 0))
  var baseLength = ((sourceLength - paddingLength) & 0xfffffffc) >> 2

  return (baseLength * 3) + (paddingLength >>> 1) + (paddingLength << 1 & 2)
}
