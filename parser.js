const { MARKERS, RULES } = require('./constants');

function getRegex(type) {
	let allRules;
	if (type === 'block') {
		allRules = [
			RULES.block.engramLink, // 1
			RULES.block.image, // 2
			RULES.block.title, // 3
			RULES.block.heading1, // 4
			RULES.block.heading2, // 5
			RULES.block.heading3, // 6
			RULES.block.unorderedList, // 7
			RULES.block.orderedList, // 8
			RULES.block.horizontalRule, // 9
		];
	} else {
		allRules = [
			RULES.inline.engramLink, // 1
			RULES.inline.autolink, // 2
			RULES.inline.image, // 3
			RULES.inline.alias, // 4
			RULES.inline.bold, // 5
			RULES.inline.italic, // 6
			RULES.inline.underlined, // 7
			RULES.inline.highlighted, // 8
			RULES.inline.strikethrough, // 9
			RULES.inline.code, // 10
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
	const splitEngramLink = engramLink.split(MARKERS.engramLink2);
	const engramLinkTitle = splitEngramLink[0].replace(MARKERS.engramLink1, '');
	const engramLinkMetadataCore = splitEngramLink[1].replace(MARKERS.engramLink3, '');
	const blockIdMatch = engramLinkMetadataCore.match(RULES.engramLinkBlockId);

	let to = engramLinkTitle;
	if (blockIdMatch) {
		to += blockIdMatch[0];
	}

	if (type === 'block') {
		return `<p><engram-link to="${to}>${to}</engram-link></p>`;
	}

	return `<engram-link to="${to}" >${to}</engram-link>`;
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
		return `<p><img src="${image.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}"></p>`;
	}

	return `<img src="${image.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}">`;
}

function aliasToHtml(alias) {
	const splitAlias = alias.split(MARKERS.alias2);
	const aliasTitle = splitAlias[0].replace(MARKERS.alias1, '');
	const aliasUrl = splitAlias[1].replace(MARKERS.alias3, '');

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

		if (match[1]) { // inline engram link
			html += engramLinkToHtml(match[0], 'inline');
		} else if (match[2]) { // autolink
			html += autolinkToHtml(match[0]);
		} else if (match[3]) { // inline image
			html += imageToHtml(match[0], 'inline');
		} else if (match[4]) { // alias
			html += aliasToHtml(match[0]);
		} else if (match[5]) { // bold
			html += `<strong>${blockCoreToHtml(match[0].replace(MARKERS.bold, '').replace(MARKERS.bold, ''), 0)}</strong>`;
		} else if (match[6]) { // italic
			html += `<em>${blockCoreToHtml(match[0].replace(MARKERS.italic, '').replace(MARKERS.italic, ''), 0)}</em>`;
		} else if (match[7]) { // underlined
			html += `<u>${blockCoreToHtml(match[0].replace(MARKERS.underlined, '').replace(MARKERS.underlined, ''), 0)}</u>`;
		} else if (match[8]) { // highlighted
			html += `<mark>${blockCoreToHtml(match[0].replace(MARKERS.highlighted, '').replace(MARKERS.highlighted, ''), 0)}</mark>`;
		} else if (match[9]) { // strikethrough
			html += `<del>${blockCoreToHtml(match[0].replace(MARKERS.strikethrough, '').replace(MARKERS.strikethrough, ''), 0)}</del>`;
		} else { // code
			html += `<code>${blockCoreToHtml(match[0].replace(MARKERS.code1, '').replace(MARKERS.code2, ''), 0)}</code>`;
		}

		updatedCursor += match[0].length;
	});

	html += blockCore.slice(updatedCursor);

	return html;
}

// function listItemsToHtml(listItems) {
// 	const tree = [];
// 	const html = '';
// 	const listItemsAndSeparators = listItems.split(new RegExp(`(${RULES.separator.listItem.source})`));
// 	const prevItemIndentLevel = 0;

// 	for(let i = 2; i < listItemsAndSeparators.length; i += 2) {
// 		const currItemSeparator = listItemsAndSeparators[i - 1];
// 		const currItemIndentLevel = currItemSeparator.replace(MARKERS.listItemSeparator, '').length;

// 		if (currItemIndentLevel > prevItemIndentLevel) {
// 			html += `<li><><></li>`;
// 		} else {

// 		}
// 	}
// }

// function listTree(list) {
// 	const tree = [];

// 	let prevItemIndentLevel = 0;
// 	const listItemsAndSeparators = list.split(new RegExp(`(${RULES.separator.listItem.source})`)).map((e) => {
// 		if (e.startsWith(MARKERS.listItemSeparator)) {
// 			let currItemIndentLevel = e.replace(MARKERS.listItemSeparator, '').length;

// 			if (currItemIndentLevel > prevItemIndentLevel) {
// 				currItemIndentLevel = prevItemIndentLevel + 1;
// 				prevItemIndentLevel = currItemIndentLevel;

// 				return `${MARKERS.listItemSeparator}${' '.repeat(currItemIndentLevel)}`;
// 			}

// 			prevItemIndentLevel = currItemIndentLevel;
// 		}

// 		return e;
// 	});

// 	const listItemsAndIndentLevels = listItemsAndSeparators.
// }

function getListTree(list) {
	// 
	let prevItemLevel = 0;
	const listItemsAndSeparators = list.split(new RegExp(`(${RULES.separator.listItem.source})`)).map((e) => {
		if (e.startsWith(MARKERS.listItemSeparator)) {
			let currItemLevel = e.replace(MARKERS.listItemSeparator, '').length;

			if (currItemLevel > prevItemLevel) {
				currItemLevel = prevItemLevel + 1;
				prevItemLevel = currItemLevel;

				return `${MARKERS.listItemSeparator}${' '.repeat(currItemLevel)}`;
			}

			prevItemLevel = currItemLevel;
		}

		return e;
	});

	// create flattenedListTree for actual listTree below
	const flattenedListTree = [{ listItem: listItemsAndSeparators[0], level: 0, id: '1', parentId: '0' }];
	for (let i = 2; i < listItemsAndSeparators.length; i += 2) {
		const currItemLevel = listItemsAndSeparators[i - 1].replace(MARKERS.listItemSeparator, '').length;
		const lowerLevelElements = flattenedListTree.filter((e) => e.level === currItemLevel - 1);

		flattenedListTree.push({
			listItem: listItemsAndSeparators[i],
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
		const nodeIsUnordered = node.listItem.startsWith(MARKERS.unorderedList);
		const nodeHasChildren = node.children.length > 0;

		html += `<li>${node.listItem.replace(new RegExp((nodeIsUnordered ? MARKERS.unorderedList : MARKERS.orderedList)), '')}${(nodeHasChildren ? treeToHtml(node.children) : '')}</li>`;
	});

	return html;
}

function treeToHtml(tree) {
	if (tree[0].listItem.startsWith(MARKERS.unorderedList)) {
		return `<ul>${treeNodeToHtml(tree)}</ul>`;
	}

	return `<ol>${treeNodeToHtml(tree)}</ol>`;
}

function listToHtml(list) {
	const listTree = getListTree(list);
	console.log(listTree);
	console.log(treeToHtml(listTree));

	return '';
}

function rootBlockToHtml(rootBlock) {
	const regex = getRegex('block');

	const result = [...rootBlock.matchAll(regex)];

	if (result.length === 0) {
		return `<p>${blockCoreToHtml(rootBlock, 0)}</p>`;
	}

	// let blockMarker = ''; // may be handy for ordered list handling
	// result[0].forEach((captureGroup) => { // works even if first capture group is not block marker
	// 	if (captureGroup) {
	// 		blockMarker = captureGroup;
	// 	}
	// })

	if (result[0][1]) { // block engram link
		return engramLinkToHtml(result[0][0], 'block');
	}

	if (result[0][2]) { // block image
		return imageToHtml(result[0][0], 'block');
	}

	if (result[0][3]) { // title block
		return `<h1>${blockCoreToHtml(result[0][0].replace(MARKERS.title, ''), 0)}</h1>`;
	}

	if (result[0][4]) { // h1 block
		return `<h2>${blockCoreToHtml(result[0][0].replace(MARKERS.heading1, ''), 0)}</h2>`;
	}

	if (result[0][5]) { // h2 block
		return `<h3>${blockCoreToHtml(result[0][0].replace(MARKERS.heading2, ''), 0)}</h3>`;
	}

	if (result[0][6]) { // h3 block
		return `<h4>${blockCoreToHtml(result[0][0].replace(MARKERS.heading3, ''), 0)}</h4>`;
	}

	if (result[0][7] || result[0][8]) { // list block
		return listToHtml(result[0][0]);
	}

	// hr block
	return '<hr>';
}

function rootBlocksToHtml(rootBlocks) {
	let html = '';

	rootBlocks.forEach((rootBlock) => {
		html += rootBlockToHtml(rootBlock);
	});

	return html;
}

function parse(engram) {
	const rootBlocks = engram.split(RULES.separator.rootBlock);

	return rootBlocksToHtml(rootBlocks);
}

// console.log(parse('A paragraph with @@bold@@, //italic//')); (y)
// console.log(parse('A paragraph with @@bold@@, //italic//, __underlined__, ==highlighted==, and --strikethrough-- text.')); (y)
// console.log(parse('A paragraph with nested styles: @@bold, //italic, __underlined, ==highlighted, and --strikethrough--==__//@@ text.')); (y)


// console.log(JSON.stringify(parse('. Unordered list item a\n     . Unordered list item b\n            . Unordered list item c'), null, 2));
// console.log(parse('. Ordered list item 1\n. Ordered list item 2\n. Ordered list item 3'));
console.log(parse('1. Ordered list item 1\n2. Ordered list item 2\n3. Ordered list item 3'));

// console.log(parse('A paragraph with two types of links: autolink ( www.google.com ), and __link alias__(www.google.com).')); (y)

// console.log(parse('*doggo{::48gh29}')); (y)
// console.log(parse('*doggo{asdf, crabby doog ::48gh29}')); (y)

// console.log(parse('. doggo\n . doggo'));

// console.log(parse('* Title')); (y)
// console.log(parse('*_1 Level 1 subtitle')); (y)
// console.log(parse('*_2 Level 2 subtitle')); (y)
// console.log(parse('*_3 Level 3 subtitle')); (y)
// console.log(parse('---')); (y)
// console.log(parse('$http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}')); (y)
// console.log(parse('A paragraph')); (y)
// console.log(parse('A paragraph with inline code: </console.log(\'hello world!\')>.')); (y)
// console.log(parse('A paragraph with an inline image: $http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}.')); (y)

module.exports = { parse };
