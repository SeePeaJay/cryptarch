function getBlockBody(blockContents) { // includes both the block marker and the body/text
	const blockMetadata = this.getBlockMetadata(blockContents);

	if (blockMetadata) {
		return blockContents.slice(0, blockContents.indexOf(blockMetadata));
	}

	return blockContents;
}

function getBlockMetadata(blockContents) { // both \n and brackets {} are included
	const indexOfBlockMetadata = blockContents.search(/\n{[\S\s]*}/);

	if (indexOfBlockMetadata >= 0) {
		return blockContents.slice(indexOfBlockMetadata);
	}

	return '';
}

function getFormattedBlockMetadata(blockMetadata) {
	const trimmedMetadataCore = blockMetadata.slice(3, -2).trim();
		// get rid of `\n{ ` and ` }`
		// TODO: ref magic num

	if (trimmedMetadataCore === '') {
		return '\n{}';
	}

	return `\n{ ${trimmedMetadataCore.split(/\s+/).sort(
		(a, b) => (b === '#Starred{}') - (a === '#Starred{}'),
	).join(' ')} }`; // place Starred in front; should be stable given Node > v12.0.0
}

function getBlockMetadataCore(blockContents) { // exclude `\n{ ` and ` }` if contents within
	if (!this.getBlockMetadata(blockContents)) {
		return '';
	}

	return this.getBlockMetadata(blockContents).slice(3, -2); // TODO: ref magic num
}

function getBlockId(blockContents) {
	const matchedBlockId = this.getBlockMetadataCore(blockContents).match(/::.{6}(?=\s|$)/); // TODO: ref

	if (!matchedBlockId) {
		return ''; // empty string is easier to work with
	}

	return matchedBlockId[0];
}

function getBlockIdCore(blockContents) {
	return this.getBlockId(blockContents).slice(2); // get rid of block id marker (::)
}

function getTitleBlockCore(titleBlockContents) {
	return this.getBlockBody(titleBlockContents).slice(2); // get rid of title marker; have not renamed yet at this line in time
}

function getEngramTitleFromLink(engramLink) {
	if (engramLink.startsWith('*')) { // get rid of * and metadata
		return engramLink.slice(1, /{.*?}/.exec(engramLink).index); // TODO: ref magic num
	}

	return engramLink.slice(1, -2); // works because tags don't have metadata atm
}

function getBlockIdCoreFromLink(engramLink) {
	if (engramLink.startsWith('*')) {
		const linkMetadata = engramLink.match(/{.*}$/)[0];
		const matchedBlockId = linkMetadata.slice(1, -1).match(/::.{6}(?=\s|$)/);

		if (matchedBlockId) {
			return matchedBlockId[0].slice(2); // get rid of ::
		}
	}

	return ''; // if tag, return nothing
}

function getMergedBlockMetadata(metadata1, metadata2) {
	const mergedMetadataCore = `${this.getBlockMetadataCore(metadata1)}${this.getBlockMetadataCore(metadata2)}`;

	if (mergedMetadataCore) {
		return `\n{ ${mergedMetadataCore} }`;
	}

	return '\n{}';
}

module.exports = {
	getBlockBody,
	getBlockMetadata,
	getFormattedBlockMetadata,
	getBlockMetadataCore,
	getBlockId,
	getBlockIdCore,
	getTitleBlockCore,
	getEngramTitleFromLink,
	getBlockIdCoreFromLink,
	getMergedBlockMetadata,
};