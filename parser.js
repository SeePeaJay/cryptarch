const { MARKERS, RULES } = require('./constants');

function getRegex(type) {
	let allRules;
	if (type === 'block') {
		allRules = [
			RULES.block.title, // 1
			RULES.block.heading1, // 2
			RULES.block.heading2, // 3
			RULES.block.heading3, // 4
			RULES.block.unorderedList, // 5
			RULES.block.orderedList, // 6
			RULES.block.horizontalRule, // 7
			RULES.block.image, // 8
		];
	} else {
		allRules = [
			RULES.inline.alias, // 1
			RULES.inline.autolink, // 2
			RULES.inline.bold, // 3
			RULES.inline.italic, // 4
			RULES.inline.underlined, // 5
			RULES.inline.highlighted, // 6
			RULES.inline.strikethrough, // 7
			RULES.inline.code, // 8
			RULES.inline.image, // 9
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

	if (result[0][1]) { // alias
		return `...`;
	}

	if (result[0][2]) { // autolink
		return `...`;
	}

	if (result[0][3]) { // bold
		return `<strong>${blockCoreToHtml(result[0][0].replace(MARKERS.bold, '').replace(MARKERS.bold, ''))}</strong>`;
	}

	if (result[0][4]) { // italic
		return `<em>${blockCoreToHtml(result[0][0].replace(MARKERS.italic, '').replace(MARKERS.italic, ''))}</em>`;
	}

	if (result[0][5]) { // underlined
		return `<u>${blockCoreToHtml(result[0][0].replace(MARKERS.underlined, '').replace(MARKERS.underlined, ''))}</u>`;
	}

	if (result[0][6]) { // highlighted
		return `<mark>${blockCoreToHtml(result[0][0].replace(MARKERS.highlighted, '').replace(MARKERS.highlighted, ''))}</mark>`;
	}

	if (result[0][7]) { // strikethrough
		return `<del>${blockCoreToHtml(result[0][0].replace(MARKERS.strikethrough, '').replace(MARKERS.strikethrough, ''))}</del>`;
	}

	if (result[0][8]) { // code
		return `<code>${blockCoreToHtml(result[0][0].replace(MARKERS.code1, '').replace(MARKERS.code2, ''))}</code>`;
	}

	return inlineImageToHtml(result[0][0]); // image
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

	if (result[0][1]) { // title block
		return `<h1>${blockCoreToHtml(result[0][0].replace(MARKERS.title, ''))}</h1>`;
	}

	if (result[0][2]) { // h1 block
		return `<h2>${blockCoreToHtml(result[0][0].replace(MARKERS.heading1, ''))}</h2>`;
	}

	if (result[0][3]) { // h2 block
		return `<h3>${blockCoreToHtml(result[0][0].replace(MARKERS.heading2, ''))}</h3>`;
	}

	if (result[0][4]) { // h3 block
		return `<h4>${blockCoreToHtml(result[0][0].replace(MARKERS.heading3, ''))}</h4>`;
	}

	if (result[0][5] || result[0][6]) { // list block
		return 'list';
	}

	if (result[0][7]) { // hr block
		return '<hr>';
	}

	return blockImageToHtml(result[0][0]); // image block
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

module.exports = { parse };
