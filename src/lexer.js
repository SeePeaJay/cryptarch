const { RULES, TOKENS } = require('./constants');

class Lexer {
	constructor() {
		this.blocksAndSeparators = [];
		this.cursor = 0;
		this.tokenQueue = [];
	}

	scan(engram) {
		const rootBlocks = engram.split(RULES.rootBlockSeparator);
		this.blocksAndSeparators.push(...this.getBlocksAndSeparators(rootBlocks)); // "flatten" lists into the array

		// console.log([...this.blocksAndSeparators]);
	}

	getBlocksAndSeparators(rootBlocks) {
		const blocksAndSeparators = [...rootBlocks];

		for (let i = 0; i < 2 * (rootBlocks.length - 1); i += 2) { // insert root block separators
			blocksAndSeparators.splice(i + 1, 0, '\n\n');
		}

		const listPattern = new RegExp(`(${RULES.block.unorderedList.source})|(${RULES.block.orderedList.source})`);
		for (let i = 0; i < blocksAndSeparators.length; i += 2) { // insert list items and list item separators
			if (blocksAndSeparators[i].match(listPattern)) {
				blocksAndSeparators.splice(
					i, 1, ...this.getListItemsAndSeparators(blocksAndSeparators[i]),
				);
			}
		}

		return blocksAndSeparators;
	}

	getListItemsAndSeparators(list) { // should be able to clean up SAfterListItemSeparatorAndBeforeList
		const listItemsAndSeparators = list.split(new RegExp(`(${RULES.listItemSeparator.source})`, 'g')); // for the time being, need to make sure all items at the same level within a list are homogeneous

		let maxIndentLevel = 1; // can only be 1 by the moment the first list separator is reached
		for (let i = 1; i < listItemsAndSeparators.length; i += 2) {
			const tabCount = listItemsAndSeparators[i].substring(1).length; // substring excludes \n

			listItemsAndSeparators[i] = `\n${' '.repeat(Math.min(tabCount, maxIndentLevel))}`; // space only for now, but will definitely include tabs in the future, so variable names don't need to be touched

			if (tabCount > maxIndentLevel) {
				maxIndentLevel ++;
			} else if (tabCount === maxIndentLevel) {
				maxIndentLevel ++;
			} else {
				maxIndentLevel = tabCount + 1;
			}
		}

		this.makeListItemsMatch(listItemsAndSeparators); // make sure that all list items are homogeneous

		return listItemsAndSeparators;
	}

	makeListItemsMatch(listItemsAndSeparators) {
		const latestListItemTable = {
			0: listItemsAndSeparators[0],
		};

		for (let i = 2; i < listItemsAndSeparators.length; i += 2) { // skip first list item
			const currentIndentLevel = listItemsAndSeparators[i - 1].substring(1).length;

			if ((currentIndentLevel in latestListItemTable && latestListItemTable[currentIndentLevel].startsWith('. ') && !listItemsAndSeparators[i].startsWith('. '))) {
				listItemsAndSeparators[i] = listItemsAndSeparators[i].replace(RULES.marker.orderedListMarker, '. ');
			} else if ((currentIndentLevel in latestListItemTable && !latestListItemTable[currentIndentLevel].startsWith('. ') && listItemsAndSeparators[i].startsWith('. '))) {
				const latestOrderedListMarkerNumber = parseInt(latestListItemTable[currentIndentLevel].match(RULES.marker.orderedListMarker)[0].match(/\d+/)[0], 10);
				const updatedMarker = `${latestOrderedListMarkerNumber + 1}. `;

				listItemsAndSeparators[i] = listItemsAndSeparators[i].replace(RULES.marker.unorderedListMarker, updatedMarker);
			}

			latestListItemTable[currentIndentLevel] = listItemsAndSeparators[i];
		}
	}

	getNextToken() {
		if (this.cursorCannotAdvance()) {
			return null;
		}

		if (this.tokenQueue.length) {
			return this.tokenQueue.shift();
		}

		this.tokenQueue.push(...this.getTokensFromCurrentCursor());
		this.cursor += 1;
		return this.tokenQueue.shift();
	}

	cursorCannotAdvance() {
		return (this.blocksAndSeparators.length === 1 && this.blocksAndSeparators[0] === '')
		|| (this.cursor >= this.blocksAndSeparators.length && this.tokenQueue.length === 0);
	}

	getTokensFromCurrentCursor() {
		if (this.cursor % 2) { // if cursor value is odd; if cursor points to a block separator
			const currentSeparator = this.blocksAndSeparators[this.cursor];

			if ((currentSeparator.match(/\n/g) || []).length > 1) { // more than 1 \n character
				return [TOKENS.rootBlockSeparator]; // must be root block separator
			}

			return [ // must be list item separator
				{
					type: TOKENS.listItemSeparator.type,
					value: this.blocksAndSeparators[this.cursor],
				},
			];
		}

		// cursor value must be even; cursor points to a block
		return this.getTokensFromCurrentBlock();
	}

	getTokensFromCurrentBlock() {
		const currentBlock = this.blocksAndSeparators[this.cursor];

		if (currentBlock.match(RULES.block.title)) {
			const text = currentBlock.split(RULES.marker.titleMarker)[1];
			return [TOKENS.titleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(RULES.block.level1Subtitle)) {
			const text = currentBlock.split(RULES.marker.level1SubtitleMarker)[1];
			return [TOKENS.level1SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(RULES.block.level2Subtitle)) {
			const text = currentBlock.split(RULES.marker.level2SubtitleMarker)[1];
			return [TOKENS.level2SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(RULES.block.level3Subtitle)) {
			const text = currentBlock.split(RULES.marker.level3SubtitleMarker)[1];
			return [TOKENS.level3SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(RULES.block.unorderedList)) { // I think it's ok for list item to match the whole list?
			const text = currentBlock.split(RULES.marker.unorderedListMarker)[1];
			return [TOKENS.unorderedListMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(RULES.block.orderedList)) { // same idea as above
			const text = currentBlock.split(RULES.marker.orderedListMarker)[1];
			return [
				{
					type: TOKENS.orderedListMarker.type,
					value: currentBlock.match(RULES.marker.orderedListMarker)[0],
				},
				...this.getTokensFromText(text),
			];
		}
		if (currentBlock.match(RULES.block.horizontalRule)) {
			return [TOKENS.horizontalRule];
		}
		if (currentBlock.match(RULES.block.image)) {
			return this.getTokensFromImage(currentBlock);
		}

		// must be a paragraph block at this point
		return this.getTokensFromText(currentBlock);
	}

	getTokensFromImage(image) {
		const imagePath = image.replace(RULES.marker.leftImageMarker, '').replace(RULES.marker.rightImageMarker, '');

		return [
			TOKENS.leftImageMarker,
			{
				type: TOKENS.imagePath.type,
				value: imagePath,
			},
			TOKENS.rightImageMarker,
		];
	}

	getTokensFromText(text) {
		const tokens = [];
		const inlinePatternMatchInText = text.match(this.getInlinePattern());

		if (!inlinePatternMatchInText) {
			tokens.push({
				type: TOKENS.unmarkedText.type,
				value: text,
			});
		} else {
			const inlineElement = inlinePatternMatchInText[0];
			const unmarkedText = text.split(inlineElement)[0];
			const remainingText = text.substring(unmarkedText.length + inlineElement.length);

			if (unmarkedText) { // unmarked text before inline element
				tokens.push({
					type: TOKENS.unmarkedText.type,
					value: unmarkedText,
				});
			}

			if (inlineElement.match(new RegExp(`^${RULES.inline.boldText.source}$`))) {
				const textWithinCurrentElement = inlineElement.replace(RULES.marker.leftBoldTextMarker, '').replace(RULES.marker.rightBoldTextMarker, '');

				tokens.push(
					TOKENS.leftBoldTextMarker,
					...this.getTokensFromText(textWithinCurrentElement),
					TOKENS.rightBoldTextMarker,
				);
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.italicText.source}$`))) {
				const textWithinCurrentElement = inlineElement.replace(RULES.marker.leftItalicTextMarker, '').replace(RULES.marker.rightItalicTextMarker, '');

				tokens.push(
					TOKENS.leftItalicTextMarker,
					...this.getTokensFromText(textWithinCurrentElement),
					TOKENS.rightItalicTextMarker,
				);
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.linkAlias.source}$`))) { // link alias need to be before underlined text to prevent matching the underlined segment for now
				tokens.push(...this.getTokensFromLinkAlias(inlineElement));
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.underlinedText.source}$`))) {
				const textWithinCurrentElement = inlineElement.replace(RULES.marker.leftUnderlinedTextMarker, '').replace(RULES.marker.rightUnderlinedTextMarker, '');

				tokens.push(
					TOKENS.leftUnderlinedTextMarker,
					...this.getTokensFromText(textWithinCurrentElement),
					TOKENS.rightUnderlinedTextMarker,
				);
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.highlightedText.source}$`))) {
				const textWithinCurrentElement = inlineElement.replace(RULES.marker.leftHighlightedTextMarker, '').replace(RULES.marker.rightHighlightedTextMarker, '');

				tokens.push(
					TOKENS.leftHighlightedTextMarker,
					...this.getTokensFromText(textWithinCurrentElement),
					TOKENS.rightHighlightedTextMarker,
				);
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.strikethroughText.source}$`))) {
				const textWithinCurrentElement = inlineElement.replace(RULES.marker.leftStrikethroughTextMarker, '').replace(RULES.marker.rightStirkethroughTextMarker, '');

				tokens.push(
					TOKENS.leftStrikethroughTextMarker,
					...this.getTokensFromText(textWithinCurrentElement),
					TOKENS.rightStrikethroughTextMarker,
				);
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.image.source}$`))) {
				tokens.push(...this.getTokensFromImage(inlineElement));
			} else { // inlineElement should be an autolink at this point
				tokens.push({
					type: TOKENS.autolink.type,
					value: inlineElement,
				});
			}

			if (remainingText) { // remaining text after inline element
				tokens.push(...this.getTokensFromText(remainingText));
			}
		}

		return tokens;
	}

	getInlinePattern() {
		const allInlinePatterns = [
			RULES.inline.boldText, RULES.inline.italicText, RULES.inline.linkAlias, RULES.inline.underlinedText, RULES.inline.highlightedText, RULES.inline.strikethroughText, RULES.inline.autolink, RULES.inline.image,
		]; // link alias need to be before underlined text to prevent matching the underlined segment for now

		let inlinePatternString = '';
		allInlinePatterns.forEach((inlinePattern) => {
			inlinePatternString += `(${inlinePattern.source})|`;
		});
		inlinePatternString = inlinePatternString.slice(0, -1);

		return new RegExp(inlinePatternString);
	}

	getTokensFromLinkAlias(linkAlias) {
		const linkAliasTitleAndUrl = linkAlias.replace(RULES.marker.linkAliasMarker1, '').replace(RULES.marker.linkAliasMarker3, '').split(RULES.marker.linkAliasMarker2);
		const linkAliasTitle = linkAliasTitleAndUrl[0];
		const linkAliasUrl = linkAliasTitleAndUrl[1];

		return [
			TOKENS.linkAliasMarker1,
			{
				type: TOKENS.linkAliasTitle.type,
				value: linkAliasTitle,
			},
			TOKENS.linkAliasMarker2,
			{
				type: TOKENS.linkAliasUrl.type,
				value: linkAliasUrl,
			},
			TOKENS.linkAliasMarker3,
		];
	}
}

module.exports = Lexer;
