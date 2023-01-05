const { MARKERS, RULES, getAllRules } = require('./constants');

function getUrlWithProtocol(url) {
	const httpPattern = /^((http|https|ftp):\/\/)/;

	let validHref = url;
	if (!httpPattern.test(url)) {
		validHref = `//${url}`;
	}

	return validHref;
}

function aliasToHtml(alias) {
	const splitAlias = alias.split(MARKERS.inline.alias[2]);
	const aliasTitle = splitAlias[0].replace(MARKERS.inline.alias[1], '');
	const aliasUrl = splitAlias[1].replace(MARKERS.inline.alias[3], '');

	return `<a href="${getUrlWithProtocol(aliasUrl)}" target="_blank">${aliasTitle}</a>`;
}

function autolinkToHtml(autolink) {
	return `<a href="${getUrlWithProtocol(autolink)}" target="_blank">${autolink}</a>`;
}

function engramLinkToHtml(engramLink, type) {
	if (type && engramLink.startsWith(MARKERS.hybrid.engramLink.default)) {
		const splitEngramLink = engramLink.split(MARKERS.metadata.container[1]);
		const engramLinkTitle = splitEngramLink[0].replace(MARKERS.hybrid.engramLink.default, '');
		const engramLinkMetadataCore = splitEngramLink[1].replace(MARKERS.metadata.container[2], '');
		const blockIdMatch = engramLinkMetadataCore.match(RULES.metadata.blockId);

		let to = engramLinkTitle;
		if (blockIdMatch) {
			to += blockIdMatch[0];
		}

		if (type === 'block') {
			return `<p><engram-link to="${to}">${to}</engram-link></p>`;
		}

		return `<engram-link to="${to}">${to}</engram-link>`;
	}

	const tagTitle = engramLink.replace(MARKERS.hybrid.engramLink.tag, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '');

	return `<engram-link to="${tagTitle}" isTag>${tagTitle}</engram-link>`;
}

function imageToHtml(image, type) {
	if (type === 'block') {
		return `<p><img src="${image.replace(MARKERS.hybrid.image, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '')}"></p>`;
	}

	return `<img src="${image.replace(MARKERS.hybrid.image, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '')}">`;
}

function blockCoreToHtml(blockCore) {
	const regex = getAllRules('inline');
	const result = [...blockCore.matchAll(regex)];

	if (result.length === 0) {
		return blockCore.replace('<', '&lt;').replace('>', '&gt;');
	}

	let html = '';
	let cursor = 0;

	result.forEach((match) => {
		html += blockCore.slice(cursor, match.index).replace('<', '&lt;').replace('>', '&gt;');
		cursor = match.index;

		if (match[1]) { // alias
			html += aliasToHtml(match[0]);
		} else if (match[2]) { // bold
			html += `<strong>${blockCoreToHtml(match[0].replace(MARKERS.inline.bold, '').replace(MARKERS.inline.bold, ''))}</strong>`;
		} else if (match[3]) { // italic
			html += `<em>${blockCoreToHtml(match[0].replace(MARKERS.inline.italic, '').replace(MARKERS.inline.italic, ''))}</em>`;
		} else if (match[4]) { // underlined
			html += `<u>${blockCoreToHtml(match[0].replace(MARKERS.inline.underlined, '').replace(MARKERS.inline.underlined, ''))}</u>`;
		} else if (match[5]) { // highlighted
			html += `<mark>${blockCoreToHtml(match[0].replace(MARKERS.inline.highlighted, '').replace(MARKERS.inline.highlighted, ''))}</mark>`;
		} else if (match[6]) { // strikethrough
			html += `<del>${blockCoreToHtml(match[0].replace(MARKERS.inline.strikethrough, '').replace(MARKERS.inline.strikethrough, ''))}</del>`;
		} else if (match[7]) { // code
			html += `<code>${blockCoreToHtml(match[0].replace(MARKERS.inline.code[1], '').replace(MARKERS.inline.code[2], ''))}</code>`;
		} else if (match[8]) { // autolink
			html += autolinkToHtml(match[0]);
		} else if (match[9]) { // inline engram link
			html += engramLinkToHtml(match[0], 'inline');
		} else { // inline image
			html += imageToHtml(match[0], 'inline');
		}

		cursor += match[0].length;
	});

	html += blockCore.slice(cursor);

	return html;
}

function getListTree(list) {
	// "beautify" list item delimiters
	let prevItemLevel = 0;
	const listItemsAndDelimiters = list.split(new RegExp(`(${RULES.delimiter.listItem.source})`)).map((e) => {
		if (e.startsWith(MARKERS.delimiter.containerItem)) {
			let currItemLevel = e.replace(MARKERS.delimiter.containerItem, '').length;

			if (currItemLevel > prevItemLevel) {
				currItemLevel = prevItemLevel + 1;
				prevItemLevel = currItemLevel;

				return `${MARKERS.delimiter.containerItem}${' '.repeat(currItemLevel)}`;
			}

			prevItemLevel = currItemLevel;
		}

		return e;
	});

	// create flattenedListTree for actual listTree below
	const flattenedListTree = [{ listItem: listItemsAndDelimiters[0], level: 0, id: '1', parentId: '0' }];
	for (let i = 2; i < listItemsAndDelimiters.length; i += 2) {
		const currItemLevel = listItemsAndDelimiters[i - 1].replace(MARKERS.delimiter.containerItem, '').length;
		const lowerLevelElements = flattenedListTree.filter((e) => e.level === currItemLevel - 1);

		flattenedListTree.push({
			listItem: listItemsAndDelimiters[i],
			level: currItemLevel,
			id: ((i / 2) + 1).toString(),
			parentId: (lowerLevelElements.length ? lowerLevelElements[lowerLevelElements.length - 1].id : '0'),
		});
	}
	flattenedListTree.sort((a, b) => a.level - b.level);

	// create actual listTree, as per https://stackoverflow.com/a/18018037
	const map = {};
	let node;
	const roots = [];
  
  for (let i = 0; i < flattenedListTree.length; i += 1) {
    map[flattenedListTree[i].id] = i; // initialize the map
    flattenedListTree[i].children = []; // initialize the children
  }
  
  for (let j = 0; j < flattenedListTree.length; j += 1) {
    node = flattenedListTree[j];
    if (node.parentId !== "0") {
      // if you have dangling branches check that map[node.parentId] exists
      flattenedListTree[map[node.parentId]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function treeNodeToHtml(treeNode) {
	let html = '';

	treeNode.forEach((node) => {
		const nodeIsUnordered = node.listItem.startsWith(MARKERS.block.unorderedList);
		const nodeHasChildren = node.children.length > 0;

		const blockCore = node.listItem.replace(new RegExp((nodeIsUnordered ? MARKERS.block.unorderedList : MARKERS.block.orderedList)), '');

		html += `<li>${blockCoreToHtml(blockCore)}${(nodeHasChildren ? treeToHtml(node.children) : '')}</li>`;
	});

	return html;
}

function treeToHtml(tree) {
	if (tree[0].listItem.startsWith(MARKERS.block.unorderedList)) {
		return `<ul>${treeNodeToHtml(tree)}</ul>`;
	}

	return `<ol>${treeNodeToHtml(tree)}</ol>`;
}

function listToHtml(list) {
	const listTree = getListTree(list);
	return treeToHtml(listTree);
}

function rootBlockToHtml(rootBlock) {
	const regex = getAllRules('block');

	const result = [...rootBlock.matchAll(regex)];

	if (result.length === 0) {
		return `<p>${blockCoreToHtml(rootBlock)}</p>`;
	}

	if (result[0][1]) { // title block
		return `<h1>${blockCoreToHtml(result[0][0].replace(MARKERS.block.title, ''))}</h1>`;
	}

	if (result[0][2]) { // h1 block
		return `<h2>${blockCoreToHtml(result[0][0].replace(MARKERS.block.level1Subtitle, ''))}</h2>`;
	}

	if (result[0][3]) { // h2 block
		return `<h3>${blockCoreToHtml(result[0][0].replace(MARKERS.block.level2Subtitle, ''))}</h3>`;
	}

	if (result[0][4]) { // h3 block
		return `<h4>${blockCoreToHtml(result[0][0].replace(MARKERS.block.level3Subtitle, ''))}</h4>`;
	}

	if (result[0][5] || result[0][6]) { // list block
		return listToHtml(result[0][0]);
	}

	if (result[0][7]) { // hr block
		return '<hr>';
	}

	if (result[0][8]) { // block engram link
		return engramLinkToHtml(result[0][0], 'block');
	}

	// block image
	return imageToHtml(result[0][0], 'block');
}

function rootBlocksToHtml(rootBlocks) {
	let html = '';

	rootBlocks.forEach((rootBlock) => {
		html += rootBlockToHtml(rootBlock);
	});

	return html;
}

function parse(engram) {
	const rootBlocks = engram.split(RULES.delimiter.rootBlock);

	return rootBlocksToHtml(rootBlocks);
}

module.exports = { parse };
