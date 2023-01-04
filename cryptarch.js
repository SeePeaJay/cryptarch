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
} = require('./multi-tool');
const { MARKERS, RULES, escapeRegExp } = require('./constants');

function decrypt(engram) {
	return parse(engram);
}

module.exports = {
	MARKERS,
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

	decrypt,
};
