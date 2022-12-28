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
const { MARKERS, RULES } = require('./constants');

function decrypt(engram) {
	return parse(engram);
}

module.exports = {
	decrypt,
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
	MARKERS,
	RULES,
};
