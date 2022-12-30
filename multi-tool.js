function getBlockBody(blockContents) { // includes both the block marker and the body/text
	const blockMetadata = getBlockMetadata(blockContents);

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

function getMergedBlockMetadata(metadata1, metadata2) {
	const mergedMetadataCore = `${getBlockMetadataCore(metadata1)}${getBlockMetadataCore(metadata2)}`;

	if (mergedMetadataCore) {
		return `\n{ ${mergedMetadataCore} }`;
	}

	return '\n{}';
}

function getBlockMetadataCore(blockContents) { // exclude `\n{ ` and ` }` if contents within
	if (!getBlockMetadata(blockContents)) {
		return '';
	}

	return getBlockMetadata(blockContents).slice(3, -2); // TODO: ref magic num
}

function getBlockId(blockContents) { // TODO: check if this is needed
	const matchedBlockId = getBlockMetadataCore(blockContents).match(/::.{6}(?=\s|$)/); // TODO: ref

	if (!matchedBlockId) {
		return ''; // empty string is easier to work with
	}

	return matchedBlockId[0];
}

function getBlockIdCore(blockContents) { // TODO: check if this is needed
	return getBlockId(blockContents).slice(2); // get rid of block id marker (::)
}

function getTitleBlockCore(titleBlockContents) { // TODO: check compatability
	return getBlockBody(titleBlockContents).slice(2); // get rid of title marker; have not renamed yet at this line in time
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

module.exports = {
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
};
