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
		patternString += `${rule.source}|`;
	});
	patternString = patternString.slice(0, -1);

	return new RegExp(patternString, 'g');
}

function inlineImageToHtml(inlineImage) {
	return `<img src="${inlineImage.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}">`;
}

function blockCoreToHtml(blockCore) {
	const regex = getRegex('inline');

	const result = [...blockCore.matchAll(regex)];

	if (result.length === 0) {
		return blockCore.replace('<', '&lt;').replace('>', '&gt;');
	}

	if (result[0][1]) { // inline engram link
		return `...`;
	}

	if (result[0][2]) { // autolink
		return `...`;
	}

	if (result[0][3]) { // inline image
		return inlineImageToHtml(result[0][0]);
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

function blockImageToHtml(imageBlock) {
	return `<p><img src="${imageBlock.replace(MARKERS.image1, '').replace(MARKERS.image2, '')}"></p>`;
}

// function listToHtml() {

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
		return '...';
	}

	if (result[0][2]) { // block image
		return blockImageToHtml(result[0][0]);
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
		return 'list';
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
	const rootBlocks = engram.split(RULES.rootBlockSeparator);

	return rootBlocksToHtml(rootBlocks);
}

console.log(parse('$doggo.img{}'));
console.log(parse('*doggo{}'));

module.exports = { parse };
