const { MARKERS, RULES } = require('./constants');

function getRegex(type) {
	let allRules;
	if (type === 'block') {
		allRules = [
			RULES.block.title, // 1
			RULES.block.subtitle.level1, // 2
			RULES.block.subtitle.level2, // 3
			RULES.block.subtitle.level3, // 4
			RULES.block.list.unordered, // 5
			RULES.block.list.ordered, // 6
			RULES.block.horizontalRule, // 7
			RULES.hybrid.engramLink.block, // 8
			RULES.hybrid.image.block, // 9
		];
	} else {
		allRules = [
			RULES.inline.alias, // 1
			RULES.inline.bold, // 2
			RULES.inline.italic, // 3
			RULES.inline.underlined, // 4
			RULES.inline.highlighted, // 5
			RULES.inline.strikethrough, // 6
			RULES.inline.code, // 7
			RULES.inline.autolink, // 8
			RULES.hybrid.engramLink.inline, // 9
			RULES.hybrid.image.inline, // 10
		];
	}

	let patternString = '';
	allRules.forEach((rule) => {
		patternString += `(${rule.source})|`; // add capture group here
	});
	patternString = patternString.slice(0, -1);

	return new RegExp(patternString, 'g');
}

function engramLinkToHtml(engramLink, type) {
	if (type && engramLink.startsWith(MARKERS.hybrid.engramLink.engramLink)) {
		const splitEngramLink = engramLink.split(MARKERS.metadata.container[1]);
		const engramLinkTitle = splitEngramLink[0].replace(MARKERS.hybrid.engramLink.engramLink, '');
		const engramLinkMetadataCore = splitEngramLink[1].replace(MARKERS.metadata.container[2], '');
		const blockIdMatch = engramLinkMetadataCore.match(RULES.metadata.blockId);

		let to = engramLinkTitle;
		if (blockIdMatch) {
			to += blockIdMatch[0];
		}

		if (type === 'block') {
			return `<p><engram-link to="${to}>${to}</engram-link></p>`;
		}

		return `<engram-link to="${to}">${to}</engram-link>`;
	} else {
		const tagTitle = engramLink.replace(MARKERS.hybrid.engramLink.tag, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '');

		return `<engram-link to="${tagTitle}" isTag>${tagTitle}</engram-link>`;
	}
}

function getUrlWithProtocol(url) {
	const httpPattern = /^((http|https|ftp):\/\/)/;

	let validHref = url;
	if (!httpPattern.test(url)) {
		validHref = `//${url}`;
	}

	return validHref;
}

function autolinkToHtml(autolink) {
	return `<a href="${getUrlWithProtocol(autolink)}" target="_blank">${autolink}</a>`;
}

function imageToHtml(image, type) {
	if (type === 'block') {
		return `<p><img src="${image.replace(MARKERS.hybrid.image, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '')}"></p>`;
	}

	return `<img src="${image.replace(MARKERS.hybrid.image, '').replace(MARKERS.metadata.container[1], '').replace(MARKERS.metadata.container[2], '')}">`;
}

function aliasToHtml(alias) {
	const splitAlias = alias.split(MARKERS.inline.alias[2]);
	const aliasTitle = splitAlias[0].replace(MARKERS.inline.alias[1], '');
	const aliasUrl = splitAlias[1].replace(MARKERS.inline.alias[3], '');

	return `<a href="${getUrlWithProtocol(aliasUrl)}" target="_blank">${aliasTitle}</a>`;
}

function blockCoreToHtml(blockCore, cursor) {
	const regex = getRegex('inline');
	const result = [...blockCore.matchAll(regex)];

	if (result.length === 0) {
		return blockCore.replace('<', '&lt;').replace('>', '&gt;');
	}

	let html = '';
	let updatedCursor = cursor;

	result.forEach((match) => {
		html += blockCore.slice(updatedCursor, match.index).replace('<', '&lt;').replace('>', '&gt;');
		updatedCursor = match.index;

		if (match[1]) { // alias
			html += aliasToHtml(match[0]);
		} else if (match[2]) { // bold
			html += `<strong>${blockCoreToHtml(match[0].replace(MARKERS.inline.bold, '').replace(MARKERS.inline.bold, ''), 0)}</strong>`;
		} else if (match[3]) { // italic
			html += `<em>${blockCoreToHtml(match[0].replace(MARKERS.inline.italic, '').replace(MARKERS.inline.italic, ''), 0)}</em>`;
		} else if (match[4]) { // underlined
			html += `<u>${blockCoreToHtml(match[0].replace(MARKERS.inline.underlined, '').replace(MARKERS.inline.underlined, ''), 0)}</u>`;
		} else if (match[5]) { // highlighted
			html += `<mark>${blockCoreToHtml(match[0].replace(MARKERS.inline.highlighted, '').replace(MARKERS.inline.highlighted, ''), 0)}</mark>`;
		} else if (match[6]) { // strikethrough
			html += `<del>${blockCoreToHtml(match[0].replace(MARKERS.inline.strikethrough, '').replace(MARKERS.inline.strikethrough, ''), 0)}</del>`;
		} else if (match[7]) { // code
			html += `<code>${blockCoreToHtml(match[0].replace(MARKERS.inline.code[1], '').replace(MARKERS.inline.code[2], ''), 0)}</code>`;
		} else if (match[8]) { // autolink
			html += autolinkToHtml(match[0]);
		} else if (match[9]) { // inline engram link
			html += engramLinkToHtml(match[0], 'inline');
		} else { // inline image
			html += imageToHtml(match[0], 'inline');
		}

		updatedCursor += match[0].length;
	});

	html += blockCore.slice(updatedCursor);

	return html;
}

function getListTree(list) {
	// "beautify" list item delimiters
	let prevItemLevel = 0;
	const listItemsAndDelimiters = list.split(new RegExp(`(${RULES.block.list.itemDelimiter.source})`)).map((e) => {
		if (e.startsWith(MARKERS.block.list.itemDelimiter)) {
			let currItemLevel = e.replace(MARKERS.block.list.itemDelimiter, '').length;

			if (currItemLevel > prevItemLevel) {
				currItemLevel = prevItemLevel + 1;
				prevItemLevel = currItemLevel;

				return `${MARKERS.block.list.itemDelimiter}${' '.repeat(currItemLevel)}`;
			}

			prevItemLevel = currItemLevel;
		}

		return e;
	});

	// create flattenedListTree for actual listTree below
	const flattenedListTree = [{ listItem: listItemsAndDelimiters[0], level: 0, id: '1', parentId: '0' }];
	for (let i = 2; i < listItemsAndDelimiters.length; i += 2) {
		const currItemLevel = listItemsAndDelimiters[i - 1].replace(MARKERS.block.list.itemDelimiter, '').length;
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
		const nodeIsUnordered = node.listItem.startsWith(MARKERS.block.list.unordered);
		const nodeHasChildren = node.children.length > 0;

		html += `<li>${node.listItem.replace(new RegExp((nodeIsUnordered ? MARKERS.block.list.unordered : MARKERS.block.list.ordered)), '')}${(nodeHasChildren ? treeToHtml(node.children) : '')}</li>`;
	});

	return html;
}

function treeToHtml(tree) {
	if (tree[0].listItem.startsWith(MARKERS.block.list.unordered)) {
		return `<ul>${treeNodeToHtml(tree)}</ul>`;
	}

	return `<ol>${treeNodeToHtml(tree)}</ol>`;
}

function listToHtml(list) {
	const listTree = getListTree(list);
	return treeToHtml(listTree);
}

function rootBlockToHtml(rootBlock) {
	const regex = getRegex('block');

	const result = [...rootBlock.matchAll(regex)];

	if (result.length === 0) {
		return `<p>${blockCoreToHtml(rootBlock, 0)}</p>`;
	}

	if (result[0][1]) { // title block
		return `<h1>${blockCoreToHtml(result[0][0].replace(MARKERS.block.title, ''), 0)}</h1>`;
	}

	if (result[0][2]) { // h1 block
		return `<h2>${blockCoreToHtml(result[0][0].replace(MARKERS.block.subtitle.level1, ''), 0)}</h2>`;
	}

	if (result[0][3]) { // h2 block
		return `<h3>${blockCoreToHtml(result[0][0].replace(MARKERS.block.subtitle.level2, ''), 0)}</h3>`;
	}

	if (result[0][4]) { // h3 block
		return `<h4>${blockCoreToHtml(result[0][0].replace(MARKERS.block.subtitle.level3, ''), 0)}</h4>`;
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
	const rootBlocks = engram.split(RULES.rootBlockDelimiter);

	return rootBlocksToHtml(rootBlocks);
}

module.exports = { parse };
