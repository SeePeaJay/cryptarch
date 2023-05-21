const { MARKERS, MARKERS_IN_REGEX, RULES, escapeRegExp } = require('./constants');
const { parse } = require('./parser');
const {
  getBlockBody,
  getBlockMetadata,
  getBlockCore,
  getFormattedBlockMetadata,
  getMergedBlockMetadata,
  getBlockMetadataCore,
  getBlockId,
  getBlockIdCore,
  getEngramTitleFromLink,
  getBlockIdCoreFromLink,
  getMetadataWithIdOnly,
} = require('./multi-tool');

function decrypt(engram) {
  return parse(engram);
}

module.exports = {
  MARKERS,
  MARKERS_IN_REGEX,
  RULES,
  escapeRegExp,

  getBlockBody,
  getBlockMetadata,
  getBlockCore,
  getFormattedBlockMetadata,
  getMergedBlockMetadata,
  getBlockMetadataCore,
  getBlockId,
  getBlockIdCore,
  getEngramTitleFromLink,
  getBlockIdCoreFromLink,
  getMetadataWithIdOnly,

  decrypt,
};
