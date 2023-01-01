const { parse } = require('./parser');
const {
	getBlockBody,
	getBlockMetadata,
	getFormattedBlockMetadata,
	getMergedBlockMetadata,
	getBlockMetadataCore,
	getBlockId,
	getBlockIdCore,
	getTitleBlockCore,
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
	getFormattedBlockMetadata,
	getMergedBlockMetadata,
	getBlockMetadataCore,
	getBlockId,
	getBlockIdCore,
	getTitleBlockCore,
	getEngramTitleFromLink,
	getBlockIdCoreFromLink,

	decrypt,
};
