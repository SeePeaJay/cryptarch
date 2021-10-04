const { TOKENS } = require('./constants');
const Lexer = require('./lexer')

class Parser {
	constructor() {
		this.lexer = new Lexer();
		this.lookahead;
    }

	parse(engram) {
		this.lexer.scan(engram) // or this.lexer.scan(engram)
		this.lookahead = this.lexer.getNextToken();
		const tree = this.getEngramNode();
		return tree;
	}

	getEngramNode() {
		return {
			type: 'engram',
			blocks: this.getBlockNodes(),
		}
	}

	getBlockNodes() {
		const blockNodes = [];

		while (this.lookahead) {
			switch (this.lookahead.type) {
				case TOKENS.titleMarker.type:
					blockNodes.push(this.getTitleNode());
					break;
				case TOKENS.level1SubtitleMarker.type:
					blockNodes.push(this.getLevel1SubtitleNode());
					break;
				case TOKENS.level2SubtitleMarker.type:
					blockNodes.push(this.getLevel2SubtitleNode());
					break;
				case TOKENS.level3SubtitleMarker.type:
					blockNodes.push(this.getLevel3SubtitleNode());
					break;
				case TOKENS.unorderedListMarker.type:
					blockNodes.push(this.getUnorderedListNode());
					break;
				case TOKENS.orderedListMarker.type:
					blockNodes.push(this.getOrderedListNode());
					break;
				case TOKENS.horizontalRule.type:
					blockNodes.push(this.getHorizontalRuleNode());
					break;
				case TOKENS.leftImageMarker.type:
					blockNodes.push(this.getImageNode());
					break;
				case TOKENS.rootBlockSeparator.type:
					this.eat(TOKENS.rootBlockSeparator);
					break;
				default: // should be a paragraph at this point
					rootBlockNodes.push(this.getParagraphNode());
			}
			// ...
		}

		return rootBlockNodes;
	}

	getTitleNode() {
		this.eat(TOKENS.titleMarker);
		return {
			type: 'title',
			text: this.getTextNodes(),
		}
	}

	getLevel1SubtitleNode() {
		this.eat(TOKENS.level1SubtitleMarker);
		return {
			type: 'level 1 subtitle',
			text: this.getTextNodes(),
		}
	}

	getLevel1SubtitleNode() {
		this.eat(TOKENS.level2SubtitleMarker);
		return {
			type: 'level 2 subtitle',
			text: this.getTextNodes(),
		}
	}

	getLevel3SubtitleNode() {
		this.eat(TOKENS.level3SubtitleMarker);
		return {
			type: 'level 3 subtitle',
			text: this.getTextNodes(),
		}
	}

	getUnorderedListNode(currentIndentLevel) {
		return {
			type: TREE_NODE_TYPES.unorderedList,
			items: this.getUnorderedListItemNodes(currentIndentLevel),
		}
	}

	getUnorderedListItemNodes(currentIndentLevel) {
		const unorderedListItemNodes = [];

		unorderedListItemNodes.push(this.getUnorderedListItemNode(currentIndentLevel)); // unordered list should have at least one item
		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel == currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				unorderedListItemNodes.push(this.getUnorderedListItemNode(currentIndentLevel));
			} else {
				break;
			}
		}

		return unorderedListItemNodes;
	}

	getUnorderedListItemNode(currentIndentLevel) {
		this.eat(TOKENS.unorderedListMarker);

		const listItemNode = {
			type: TREE_NODE_TYPES.listItem,
			text: this.getTextNodes(),
		};

		if (this.lookahead && this.lookahead.type == TOKENS.listItemSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel > currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				listItemNode.list = this.getUnorderedListNode(nextIndentLevel);
			}
		}

		return listItemNode;
	}

	getNextIndentLevel(listItemSeparatorToken) {
		return listItemSeparatorToken.value.substring(1).length;
	}

	getOrderedListNode(currentIndentLevel) {
		return {
			items: this.getOrderedListItemNodes(currentIndentLevel),
		}
	}

	getOrderedListItemNodes(currentIndentLevel) {
		const orderedListItemNodes = [];

		orderedListItemNodes.push(this.getOrderedListItemNode(currentIndentLevel)); // ordered list should have at least one item
		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel == currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				orderedListItemNodes.push(this.getOrderedListItemNode(currentIndentLevel));	
			} else {
				break;
			}			
		}

		return orderedListItemNodes;
	}

	getOrderedListItemNode(currentIndentLevel) {
		this.eat(TOKENS.orderedListMarker);

		const listItemNode = {
			type: TREE_NODE_TYPES.listItem,
			text: this.getTextNodes(),
		};

		if (this.lookahead && this.lookahead.type == TOKENS.listItemSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel > currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				listItemNode.list = this.getOrderedListNode(nextIndentLevel);
			}
		}

		return listItemNode;
	}

	getHorizontalRuleNode() {
		this.eat(TOKENS.horizontalRule);
		return {
			type: 'horizontal rule',
			text: this.getTextNodes(),
		}
	}

	getParagraphNode() {
		return {
			type: TREE_NODE_TYPES.paragraph,
			text: this.getTextNodes(),
		};
	}

	getImageNode() {
		this.eat(TOKENS.leftImageMarker)
		const imageNode = {
			path: this.eat(TOKENS.imagePath).value,
		}
		this.eat(TOKENS.rightImageMarker);

		return imageNode;
	}

	getTextNodes() {
		const textNodes = [];

		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type && this.lookahead.type !== TOKENS.listItemSeparator.type && !this.isClosingStyledTextMarker(this.lookahead)) {
			switch (this.lookahead.type) {
				case TOKENS.leftBoldTextMarker.type:
					textNodes.push(this.getBoldTextNode());
					break;
				case TOKENS.leftItalicTextMarker.type:
					textNodes.push(this.getItalicTextNode());
					break;
				case TOKENS.leftUnderlinedTextMarker.type:
					textNodes.push(this.getUnderlinedTextNode());
					break;
				case TOKENS.leftHighlightedTextMarker.type:
					textNodes.push(this.getHighlightedTextNode());
					break;
				case TOKENS.leftStrikethroughTextMarker.type:
					textNodes.push(this.getStrikethroughTextNode());
					break;
				case TOKENS.linkAliasMarker1.type:
					textNodes.push(this.getLinkAliasNode());
					break;
				case TOKENS.autoLink.type:
					break;
				case TOKENS.leftImageMarker.type:
					textNodes.push(this.getImageNode());
					break;
				default:
					textNodes.push({
						value: this.eat(TOKENS.unmarkedText).value,
					});
			}
		}

		return textNodes;
	}

	isClosingStyledTextMarker(lookahead) {
		const closingStyledTextMarkers = [TOKENS.rightBoldTextMarker, TOKENS.rightItalicTextMarker, TOKENS.rightUnderlinedTextMarker, TOKENS.rightHighlightedTextMarker, TOKENS.rightStrikethroughTextMarker];

		return closingStyledTextMarkers.find(closingMarker => lookahead.type == closingMarker.type);
	}

	getBoldTextNode() {
		this.eat(TOKENS.leftBoldTextMarker) // eat the left bold text marker
		const boldTextNode = {
			type: 'bold text',
			text: this.getTextNodes(), // add constraints somehow? or has lexer already taken care of it?
		}
		this.eat(TOKENS.rightBoldTextMarker) // eat the right bold text marker?

		return boldTextNode;
	}

	getItalicTextNode() {
		this.eat(TOKENS.leftItalicTextMarker)
		const italicTextNode = {
			type: 'italic text',
			text: this.getTextNodes(),
		}
		this.eat(TOKENS.rightItalicTextMarker)

		return italicTextNode;
	}

	getUnderlinedTextNode() {
		this.eat(TOKENS.leftUnderlinedTextMarker)
		const underlinedTextNode = {
			type: 'underlined text',
			text: this.getTextNodes(),
		}
		this.eat(TOKENS.rightUnderlinedTextMarker)

		return underlinedTextNode;
	}

	getHighlightedTextNode() {
		this.eat(TOKENS.leftHighlightedTextMarker)
		const underlinedTextNode = {
			type: 'highlighted text',
			text: this.getTextNodes(),
		}
		this.eat(TOKENS.rightHighlightedTextMarker)

		return underlinedTextNode;
	}

	getStrikethroughTextNode() {
		this.eat(TOKENS.leftStrikethroughTextMarker)
		const underlinedTextNode = {
			type: 'highlighted text',
			text: this.getTextNodes(),
		}
		this.eat(TOKENS.rightStrikethroughTextMarker)

		return underlinedTextNode;
	}

	getLinkAliasNode() {
		this.eat(TOKENS.linkAliasMarker1);
		linkAliasNode = {
			type: 'link alias'
		}
		linkAliasNode.title = this.eat(TOKENS.linkAliasTitle).value;
		this.eat(TOKENS.linkAliasMarker2);
		linkAliasNode.url = this.eat(TOKENS.linkAliasUrl).value;
		this.eat(TOKENS.linkAliasMarker3);
		
		return linkAliasNode;
	}

	getAutoLinkNode() {
		return {
			url: this.eat(TOKENS.autoLink).value
		}
	}

	eat(token) {
		if (this.lookahead == null) {
			throw new SyntaxError(
				`Unexpected end of input, expected "${token.type}"`
			);
		} 

		if (this.lookahead.type !== token.type) {
			throw new SyntaxError(
				`Unexpected token: "${this.lookahead.type}", expected; "${token.type}"`
			)
		}

		const consumedToken = this.lookahead;
		this.lookahead = this.lexer.getNextToken();

		return consumedToken;
	}
}

module.exports = Parser;
