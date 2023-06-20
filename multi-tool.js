const { MARKERS, MARKERS_IN_REGEX, RULES } = require('./constants');

const blockMetadataCoreStartIndex = MARKERS.delimiter.containerItem.length + MARKERS.metadata.container[1].length + 1;
const blockMetadataCoreEndIndex = -(MARKERS.metadata.container[2].length + 1);

function getBlockBody(blockContents) { // includes both the block marker and the body/text
  const blockMetadata = getBlockMetadata(blockContents);

  if (blockMetadata) {
    return blockContents.slice(0, blockContents.indexOf(blockMetadata));
  }

  return blockContents;
}

function getBlockMetadata(blockContents) { // both \n and brackets {} are included
  const indexOfBlockMetadata = blockContents.search(RULES.metadata.block);

  if (indexOfBlockMetadata >= 0) {
    return blockContents.slice(indexOfBlockMetadata);
  }

  return '';
}

function getBlockCore(blockContents) {
  const blockBody = getBlockBody(blockContents);
  const blockRegex = new RegExp(
    `(?:${MARKERS_IN_REGEX.block.title.source}|${MARKERS_IN_REGEX.block.level1Subtitle.source}|${MARKERS_IN_REGEX.block.level2Subtitle.source}|${MARKERS_IN_REGEX.block.level3Subtitle.source}|${MARKERS_IN_REGEX.block.unorderedList.source}|${MARKERS_IN_REGEX.block.orderedList.source})`,
  );
  const blockMarker = blockBody.match(blockRegex) ? blockBody.match(blockRegex)[0] : undefined;

  if (blockMarker) {
    return blockBody.replace(blockMarker, '');
  }

  return blockBody;
}

function getFormattedBlockMetadata(blockMetadata) {
  const trimmedMetadataCore = blockMetadata.slice(blockMetadataCoreStartIndex, blockMetadataCoreEndIndex).trim(); // get rid of `\n{ ` and ` }`

  if (trimmedMetadataCore === '') {
    return `${MARKERS.delimiter.containerItem}${MARKERS.metadata.container[1]}${MARKERS.metadata.container[2]}`;
  }

  return `${MARKERS.delimiter.containerItem}${MARKERS.metadata.container[1]} ${trimmedMetadataCore.split(/\s+/).sort(
    (a, b) => (
      b === `${MARKERS.hybrid.engramLink.tag}Starred${MARKERS.metadata.container[1]}${MARKERS.metadata.container[2]}`) - (a === `${MARKERS.hybrid.engramLink.tag}Starred${MARKERS.metadata.container[1]}${MARKERS.metadata.container[2]}`
    ),
  ).join(' ')} ${MARKERS.metadata.container[2]}`; // place Starred in front; should be stable given Node > v12.0.0
}

function getBlockMetadataCore(blockContents) { // exclude `\n{ ` and ` }` if contents within
  if (!getBlockMetadata(blockContents)) {
    return '';
  }

  return getBlockMetadata(blockContents).slice(blockMetadataCoreStartIndex, blockMetadataCoreEndIndex)
    .replace(new RegExp(`\\s*${RULES.metadata.blockId.source}\\s*`), '');
}

function getBlockId(blockContents) {
  const matchedBlockId = getBlockMetadataCore(blockContents).match(RULES.metadata.blockId);

  if (!matchedBlockId) {
    return ''; // empty string is easier to work with
  }

  return matchedBlockId[0];
}

function getBlockIdCore(blockContents) {
  return getBlockId(blockContents).slice(MARKERS.metadata.blockId.length); // get rid of block id marker (::)
}

function getEngramTitleFromLink(engramLink) {
  if (engramLink.startsWith(MARKERS.hybrid.engramLink.default)) { // get rid of * and metadata
    return engramLink.slice(
      MARKERS.hybrid.engramLink.default.length,
      new RegExp(`${MARKERS_IN_REGEX.metadata.container[1].source}.*?${MARKERS_IN_REGEX.metadata.container[2].source}`).exec(engramLink).index,
    );
  }

  return engramLink.slice(MARKERS.hybrid.engramLink.default.length, -(MARKERS.metadata.container[1].length + MARKERS.metadata.container[2].length)); // works because tags don't have metadata atm
}

function getBlockIdCoreFromLink(engramLink) {
  if (engramLink.startsWith(MARKERS.hybrid.engramLink.default)) {
    const linkMetadata = engramLink.match(new RegExp(`${MARKERS.metadata.container[1]}.*${MARKERS.metadata.container[2]}$`))[0];
    const matchedBlockId = linkMetadata.slice(MARKERS.metadata.container[1].length, -(MARKERS.metadata.container[2].length)).match(RULES.metadata.blockId);

    if (matchedBlockId) {
      return matchedBlockId[0].slice(MARKERS.metadata.blockId.length); // get rid of ::
    }
  }

  return ''; // if tag, return nothing
}

function getMetadataWithIdOnly(id) {
  return `${MARKERS.delimiter.containerItem}${MARKERS.metadata.container[1]} ${MARKERS.metadata.blockId}${id} ${MARKERS.metadata.container[2]}`;
}

module.exports = {
  getBlockBody,
  getBlockMetadata,
  getBlockCore,
  getFormattedBlockMetadata,
  getBlockMetadataCore,
  getBlockId,
  getBlockIdCore,
  getEngramTitleFromLink,
  getBlockIdCoreFromLink,
  getMetadataWithIdOnly,
};
