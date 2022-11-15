const { parse } = require('./parser');
const {
	getBlockCore,
	getBlockBody,
	getBlockMetadata,
	getFormattedBlockMetadata,
	getBlockMetadataBody,
	getEngramTitleFromLink
} = require('./multi-tool');

function decrypt(engram) {
	return parse(engram);
}

console.log(decrypt('doggo\n\ncatto'));

module.exports = {
	decrypt,
	getBlockCore,
	getBlockBody,
	getBlockMetadata,
	getFormattedBlockMetadata,
	getBlockMetadataBody,
	getEngramTitleFromLink
};
