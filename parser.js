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
	const blockId = engramLinkMetadataCore.split(MARKERS.engramLinkMetadataSeparator).map((item) => item.trim()).filter((item) => item.startsWith(MARKERS.engramLinkBlockId))[0];

	let to = engramLinkTitle;
	if (blockId) {
		to += blockId;
	}

	if (type === 'block') {
		return `<p><engram-link to="${to}>${engramLinkTitle}</engram-link></p>`;
	}

	return `<engram-link to="${to}" >${engramLinkTitle}</engram-link>`;
}

function imageToHtml(image, type) {
	if (type === 'block') {
		return `<p><img src="${image.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}"></p>`;
	}

	return `<img src="${image.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}">`;
}

function blockCoreToHtml(blockCore) {
	const regex = getRegex('inline');

	const result = [...blockCore.matchAll(regex)];

	if (result.length === 0) {
		return blockCore.replace('<', '&lt;').replace('>', '&gt;');
	}

	if (result[0][1]) { // inline engram link
		return engramLinkToHtml(result[0][0], 'inline');
	}

	if (result[0][2]) { // autolink
		return `...`;
	}

	if (result[0][3]) { // inline image
		return imageToHtml(result[0][0], 'inline');
	}

	if (result[0][4]) { // alias
		return '...';
	}

	if (result[0][5]) { // bold
		return `<strong>${blockCoreToHtml(result[0][0].replace(MARKERS.bold, '').replace(MARKERS.bold, ''))}</strong>`;
	}

	if (result[0][6]) { // italic
		return `<em>${blockCoreToHtml(result[0][0].replace(MARKERS.italic, '').replace(MARKERS.italic, ''))}</em>`;
	}

	if (result[0][7]) { // underlined
		return `<u>${blockCoreToHtml(result[0][0].replace(MARKERS.underlined, '').replace(MARKERS.underlined, ''))}</u>`;
	}

	if (result[0][8]) { // highlighted
		return `<mark>${blockCoreToHtml(result[0][0].replace(MARKERS.highlighted, '').replace(MARKERS.highlighted, ''))}</mark>`;
	}

	if (result[0][9]) { // strikethrough
		return `<del>${blockCoreToHtml(result[0][0].replace(MARKERS.strikethrough, '').replace(MARKERS.strikethrough, ''))}</del>`;
	}
	
	// code
	return `<code>${blockCoreToHtml(result[0][0].replace(MARKERS.code1, '').replace(MARKERS.code2, ''))}</code>`;
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

// function listToHtml(list, type) {
// 	if (type === 'unordered') {
// 		return `<ul>${listItemsToHtml(list)}</ul>`;
// 	}

// 	return `<ol>${listItemsToHtml(list)}</ol>`;
// }

function rootBlockToHtml(rootBlock) {
	const regex = getRegex('block');

	const result = [...rootBlock.matchAll(regex)];

	if (result.length === 0) {
		return `<p>${blockCoreToHtml(rootBlock)}</p>`;
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
		return `<h1>${blockCoreToHtml(result[0][0].replace(MARKERS.title, ''))}</h1>`;
	}

	if (result[0][4]) { // h1 block
		return `<h2>${blockCoreToHtml(result[0][0].replace(MARKERS.heading1, ''))}</h2>`;
	}

	if (result[0][5]) { // h2 block
		return `<h3>${blockCoreToHtml(result[0][0].replace(MARKERS.heading2, ''))}</h3>`;
	}

	if (result[0][6]) { // h3 block
		return `<h4>${blockCoreToHtml(result[0][0].replace(MARKERS.heading3, ''))}</h4>`;
	}

	if (result[0][7] || result[0][8]) { // list block
		return '';
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

// console.log(parse('A paragraph with @@bold@@, //italic//'));

console.log(parse('A paragraph with @@bold@@, //italic//, __underlined__, ==highlighted==, and --strikethrough-- text.'));
// console.log(parse('. Unordered list item a\n. Unordered list item b\n. Unordered list item c'));
// console.log(parse('1. Ordered list item 1\n2. Ordered list item 2\n3. Ordered list item 3'));
// console.log(parse('A paragraph with nested styles: @@bold, //italic, __underlined, ==highlighted, and --strikethrough--==__//@@ text.'));
// console.log(parse('A paragraph with two types of links: autolink ( www.google.com ), and __link alias__(www.google.com).'));

// console.log(parse('*doggo{asdf, crabby doog ::48gh29}'));
// console.log(parse('. doggo\n . doggo'));

// console.log(parse('* Title'));
// console.log(parse('*_1 Level 1 subtitle'));
// console.log(parse('*_2 Level 2 subtitle'));
// console.log(parse('*_3 Level 3 subtitle'));
// console.log(parse('---'));
// console.log(parse('$http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}'));
// console.log(parse('A paragraph'));
// console.log(parse('A paragraph with inline code: </console.log(\'hello world!\')>.'));
// console.log(parse('A paragraph with an inline image: $http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}.'));

module.exports = { parse };
