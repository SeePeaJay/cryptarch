const { PATTERNS, TOKENS } = require('./constants')

class Lexer {
	constructor() {
		this.blocksAndBlockSeparators = [];
		this.cursor = 0;
		this.tokenQueue = [];
	}

	scan(engram) {
		const trimmedEngram = engram.trim();
		const rootBlocks = trimmedEngram.split(PATTERNS.rootBlockSeparator);
		this.blocksAndBlockSeparators.push(...this.getBlocksAndBlockSeparators(rootBlocks));
		this.removeUnnecessaryWhitespaceInBlocks();
	}

	getBlocksAndBlockSeparators(rootBlocks) {
		let blocksAndBlockSeparators = [...rootBlocks];

		for(let i = 0; i < 2 * (rootBlocks.length - 1); i += 2) { // insert root block separators
			blocksAndBlockSeparators.splice(i + 1, 0, '\n\n');
		}

		const listPattern = new RegExp(`(${PATTERNS.unorderedList.source})|(${PATTERNS.orderedList.source})`, 'g');
		for (let i = 0; i < blocksAndBlockSeparators.length; i += 2) { // insert list-related stuff
			if (blocksAndBlockSeparators[i].match(listPattern)) {
				blocksAndBlockSeparators.splice(
					i, 1, ...this.getListItemsAndListItemSeparators(blocksAndBlockSeparators[i])
				);
			}
		}
		
		return blocksAndBlockSeparators;
	}

	getListItemsAndListItemSeparators(list) { // should be able to clean up SAfterListItemSeparatorAndBeforeList
		const listItemsAndListItemSeparators = list.split(
			new RegExp(`(${PATTERNS.listItemSeparator.source})`, 'g') // parentheses to include delimiter in result
		); 

		let maxIndentLevel = 0;
		for (let i = 1; i < listItemsAndListItemSeparators.length; i += 2) {
			const tabCount = listItemsAndListItemSeparators[i].substring(1).length; // substring excludes \n
			if (tabCount > maxIndentLevel) {
				listItemsAndListItemSeparators[i] = `\n${'\t'.repeat(maxIndentLevel)}`;
				maxIndentLevel ++;
			} else if (tabCount == maxIndentLevel) {
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
		this.cursor ++;
		return this.tokenQueue.shift();
	}

	cursorCannotAdvance() {
		return (this.blocksAndBlockSeparators.length == 1 && this.blocksAndBlockSeparators[0] == '') ||
			this.cursor >= this.blocksAndBlockSeparators.length;
	}

	getTokensFromCurrentCursor() {
		if (this.cursor % 2) { // cursor is odd
			const currentSeparator = this.blocksAndBlockSeparators[this.cursor];

			if ((currentSeparator.match(/\n/g) || []).length > 1) { // more than 1 \n character
				return [TOKENS.rootBlockSeparator]; // must be root block separator
			}

			return [{ // must be list item separator
				type: TOKENS.listItemSeparator.type,
				value: this.blocksAndBlockSeparators[this.cursor],
			}]; 
		}
		
		// cursor must be even
		return this.getTokensFromCurrentBlock();
	}

	getTokensFromCurrentBlock() {
		const currentBlock = this.blocksAndBlockSeparators[this.cursor];

		if (currentBlock.match(PATTERNS.title)) {
			const text = currentBlock.split(PATTERNS.titleMarker)[1];
			return [TOKENS.titleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.level1Subtitle)) {
			const text = currentBlock.split(PATTERNS.level1SubtitleMarker)[1];
			return [TOKENS.level1SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.level2Subtitle)) {
			const text = currentBlock.split(PATTERNS.level2SubtitleMarker)[1];
			return [TOKENS.level2SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.level3Subtitle)) {
			const text = currentBlock.split(PATTERNS.level3SubtitleMarker)[1];
			return [TOKENS.level3SubtitleMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.unorderedList)) { // is this ok? list item matching the whole list?
			const text = currentBlock.split(PATTERNS.unorderedListMarker)[1];
			return [TOKENS.unorderedListMarker, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.orderedList)) { // same idea - list item matching the whole list?
			const text = currentBlock.split(PATTERNS.orderedListMarker)[1];
			return [{
				type: TOKENS.unorderedListMarker.type,
				value: currentBlock.match(PATTERNS.orderedListMarker)[0]
			}, ...this.getTokensFromText(text)];
		}
		if (currentBlock.match(PATTERNS.horizontalRule)) {
			return [TOKENS.horizontalRule];
		}
		if (currentBlock.match(PATTERNS.image)) {
			return this.getTokensFromImage(currentBlock);
		}

		// must be a paragraph block at this point
		return this.getTokensFromText(currentBlock);
	}

	getTokensFromImage(image) {
		const imagePath = image.replace(PATTERNS.leftImageMarker, '').replace(PATTERNS.rightImageMarker, '');

		return [
			TOKENS.leftImageMarker, 
			{
				type: TOKENS.imagePath,
				value: imagePath
			}, 
			TOKENS.rightImageMarker
		];
	}

	getTokensFromText(text, ignoredInlinePatterns = []) {
		const tokens = [];
		const inlinePatternMatch = text.match(this.getInlinePattern(ignoredInlinePatterns));

		if (!inlinePatternMatch) {
			tokens.push({
				type: TOKENS.unmarkedText.type,
				value: text,
			});
		} else {
			const inlineElement = inlinePatternMatch[0];
			const unmarkedTexts = text.split(inlineElement);

			if (unmarkedTexts[0]) { // unmarked text before inline element
				tokens.push({
					type: TOKENS.unmarkedText,
					value: unmarkedTexts[0],
				});
			}

			if (inlineElement.startsWith(TOKENS.leftBoldTextMarker.value)) {
				const unprocessedText = text.replace(PATTERNS.leftBoldTextMarker, '').replace(PATTERNS.
					rightBoldTextMarker, '');
				this.updateIgnoredInlinePatterns(ignoredInlinePatterns, PATTERNS.boldText);
				tokens.push(
					TOKENS.leftBoldTextMarker, 
					this.getTokensFromText(unprocessedText), 
					TOKENS.rightBoldTextMarker,
				);		
			} else if (inlineElement.startsWith(TOKENS.leftItalicTextMarker.value)) {
				const unprocessedText = text.replace(PATTERNS.leftItalicTextMarker, '').replace(PATTERNS.
					rightItalicTextMarker, '');
				this.updateIgnoredInlinePatterns(ignoredInlinePatterns, PATTERNS.italicText);
				tokens.push(
					TOKENS.leftItalicTextMarker, 
					this.getTokensFromText(unprocessedText), 
					TOKENS.rightItalicTextMarker,
				);
			} else if (inlineElement.startsWith(TOKENS.leftUnderlinedTextMarker.value)) {
				const unprocessedText = text.replace(PATTERNS.leftUnderlinedTextMarker, '').replace(PATTERNS.
					rightUnderlinedTextMarker, '');
				this.updateIgnoredInlinePatterns(ignoredInlinePatterns, PATTERNS.underlinedText);
				tokens.push(
					TOKENS.leftUnderlinedTextMarker, 
					this.getTokensFromText(unprocessedText), 
					TOKENS.rightUnderlinedTextMarker,
				);
			} else if (inlineElement.startsWith(TOKENS.leftHighlightedTextMarker.value)) {
				const unprocessedText = text.replace(PATTERNS.leftHighlightedTextMarker, '').replace(PATTERNS.
					rightHighlightedTextMarker, '');
				this.updateIgnoredInlinePatterns(ignoredInlinePatterns, PATTERNS.highlightedText);
				tokens.push(
					TOKENS.leftHighlightedTextMarker, 
					this.getTokensFromText(unprocessedText), 
					TOKENS.rightHighlightedTextMarker,
				);
			} else if (inlineElement.startsWith(TOKENS.leftStrikethroughTextMarker.value)) {
				const unprocessedText = text.replace(PATTERNS.leftStrikethroughTextMarker, '').replace(PATTERNS.
					rightStirkethroughTextMarker, '');
				this.updateIgnoredInlinePatterns(ignoredInlinePatterns, PATTERNS.strikethroughText);
				tokens.push(
					TOKENS.leftStrikethroughTextMarker, 
					this.getTokensFromText(unprocessedText), 
					TOKENS.rightStrikethroughTextMarker,
				);
			} else if (inlineElement.startsWith(TOKENS.linkAliasMarker1.value)) {
				tokens.push(...this.getTokensFromLinkAlias(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.leftImageMarker)) {
				tokens.push(...this.getTokensFromImage(inlineElement));
			} else { // inlineElement must be an autoLink at this point
				tokens.push({
					type: TOKENS.autoLink.type,
					value: inlineElement
				});
			}

			if (unmarkedTexts[1]) { // unmarked text after inline element
				tokens.push({
					type: TOKENS.unmarkedText,
					value: unmarkedTexts[1],
				});
			}
		}

		return tokens;
	}

	updateIgnoredInlinePatterns(ignoredInlinePatterns, inlinePattern) {
		if (!ignoredInlinePatterns.includes(inlinePattern)) {
			ignoredInlinePatterns.push(inlinePattern);
		}
	}

	getInlinePattern(ignoredInlinePatterns) {
		const allInlinePatterns = [PATTERNS.boldText, PATTERNS.italicText, PATTERNS.underlinedText, PATTERNS.
			highlightedText, PATTERNS.strikethroughText, PATTERNS.linkAlias, PATTERNS.autoLink];
		const filteredInlinePatterns = allInlinePatterns.filter(
			inlinePattern => !ignoredInlinePatterns.includes(inlinePattern)
		);

		let inlinePatternString = '';
		for (const inlinePattern of filteredInlinePatterns) {
			inlinePatternString += `(${inlinePattern.source})|`
		}
		inlinePatternString = inlinePatternString.slice(0, -1); 

		return new RegExp(inlinePatternString);
	}

	getTokensFromLinkAlias(linkAlias) {
		const linkAliasTitleAndUrl = linkAlias.replace(PATTERNS.linkAliasMarker1, '').replace(PATTERNS.linkAliasMarker3)
			.split(PATTERNS.linkAliasMarker2);
		const linkAliasTitle = linkAliasTitleAndUrl[0];
		const linkAliasUrl = linkAliasTitleAndUrl[1];
		
		return [
			TOKENS.linkAliasMarker1, 
			{
				type: TOKENS.linkAliasTitle,
				value: linkAliasTitle,
			},
			TOKENS.linkAliasMarker2, 
			{
				type: TOKENS.linkAliasUrl,
				value: linkAliasUrl,
			},
			TOKENS.linkAliasMarker3
		];
	}
}

module.exports = Lexer;
