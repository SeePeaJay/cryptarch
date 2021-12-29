const { RULES, TOKENS } = require('./constants');

class Lexer {
	constructor() {
		this.blocksAndBlockSeparators = [];
		this.cursor = 0;
		this.tokenQueue = [];
	}

	scan(engram) {
		const trimmedEngram = engram.trim();
		const rootBlocks = trimmedEngram.split(RULES.rootBlockSeparator);
		this.blocksAndBlockSeparators.push(...this.getBlocksAndBlockSeparators(rootBlocks));
		this.removeUnnecessaryWhitespaceInBlocks();
	}

	getBlocksAndBlockSeparators(rootBlocks) {
		const blocksAndBlockSeparators = [...rootBlocks];

		for (let i = 0; i < 2 * (rootBlocks.length - 1); i += 2) { // insert root block separators
			blocksAndBlockSeparators.splice(i + 1, 0, '\n\n');
		}

		const listPattern = new RegExp(`(${RULES.block.unorderedList.source})|(${RULES.block.orderedList.source})`);
		for (let i = 0; i < blocksAndBlockSeparators.length; i += 2) { // insert list-related stuff
			if (blocksAndBlockSeparators[i].match(listPattern)) {
				blocksAndBlockSeparators.splice(
					i, 1, ...this.getListItemsAndListItemSeparators(blocksAndBlockSeparators[i]),
				);
			}
		}

		return blocksAndBlockSeparators;
	}

	getListItemsAndListItemSeparators(list) { // should be able to clean up SAfterListItemSeparatorAndBeforeList
		const listItemsAndListItemSeparators = list.split(
			new RegExp(`(${RULES.listItemSeparator.source})`, 'g'), // parentheses to include delimiter in result
		);

		let maxIndentLevel = 1; // can only be 1 by the moment the first list separator is reached
		for (let i = 1; i < listItemsAndListItemSeparators.length; i += 2) {
			const tabCount = listItemsAndListItemSeparators[i].substring(1).length; // substring excludes \n

			listItemsAndListItemSeparators[i] = `\n${'\t'.repeat(Math.min(tabCount, maxIndentLevel))}`;

			if (tabCount > maxIndentLevel) {
				maxIndentLevel ++;
			} else if (tabCount === maxIndentLevel) {
				maxIndentLevel ++;
			} else {
				maxIndentLevel = tabCount + 1;
			}
		}

		return listItemsAndListItemSeparators;
	}

	removeUnnecessaryWhitespaceInBlocks() {
		for (let i = 0; i < this.blocksAndBlockSeparators.length; i += 2) {
			this.blocksAndBlockSeparators[i] = this.blocksAndBlockSeparators[i].trim().replace(/\t/g, '');
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
		return (this.blocksAndBlockSeparators.length === 1 && this.blocksAndBlockSeparators[0] === '')
		|| (this.cursor >= this.blocksAndBlockSeparators.length && this.tokenQueue.length === 0);
	}

	getTokensFromCurrentCursor() {
		if (this.cursor % 2) { // cursor is odd
			const currentSeparator = this.blocksAndBlockSeparators[this.cursor];

			if ((currentSeparator.match(/\n/g) || []).length > 1) { // more than 1 \n character
				return [TOKENS.rootBlockSeparator]; // must be root block separator
			}

			return [ // must be list item separator
				{
					type: TOKENS.listItemSeparator.type,
					value: this.blocksAndBlockSeparators[this.cursor],
				},
			];
		}

		// cursor must be even
		return this.getTokensFromCurrentBlock();
	}

	getTokensFromCurrentBlock() {
		const currentBlock = this.blocksAndBlockSeparators[this.cursor];

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
		if (currentBlock.match(RULES.block.orderedList)) { // same idea as right above
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
		const imagePath = image.replace(RULES.marker.leftImageMarker, '').replace(RULES.marker.rightImageMarker, 		'');

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
			} else if (inlineElement.match(new RegExp(`^${RULES.inline.linkAlias.source}$`))) { // need to be before underlined text to prevent underlined segment for now
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
			} else { // inlineElement must be an autolink at this point
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
		];

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
