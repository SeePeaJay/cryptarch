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
			}
			// ...
		}
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
		this.eat(TOKENS.level2SubtitleMarker);
		return {
			type: 'level 3 subtitle',
			text: this.getTextNodes(),
		}
	}

	getUnorderedListNode() {
		this.eat(TOKENS.unorderedListMarker);
		return {
			type: 'unordered list',
			text: this.getTextNodes(),
		}
	}

	getOrderedListNode() {
		this.eat(TOKENS.unorderedListMarker);
		return {
			type: 'ordered list',
			text: this.getTextNodes(),
		}
	}

	getHorizontalRuleNode() {
		this.eat(TOKENS.horizontalRule);
		return {
			type: 'horizontal rule',
			text: this.getTextNodes(),
		}
	}

	getImageNode() {
		this.eat(TOKENS.leftImageMarker)
		const imageNode = {
			type: 'image',
			path: this.eat(TOKENS.imagePath),
		}
		this.eat(TOKENS.rightImageMarker);

		return imageNode;
	}

	getTextNodes() {
		const textNodes = [];

		while (this.lookahead !== TOKENS.rootBlockSeparator.type) {
			switch (this.lookahead.type) {
				case TOKENS.leftBoldTextMarker:
					textNodes.push(this.getBoldTextNode());
					break;
				case TOKENS.leftItalicTextMarker:
					textNodes.push(this.getItalicTextNode());
					break;
				case TOKENS.leftUnderlinedTextMarker:
					textNodes.push(this.getUnderlinedTextNode());
					break;
				case TOKENS.leftHighlightedTextMarker:
					textNodes.push(this.getHighlightedTextNode());
					break;
				case TOKENS.leftStrikethroughTextMarker:
					textNodes.push(this.getStrikethroughTextNode());
					break;
				case TOKENS.linkAliasMarker1:
					textNodes.push(this.getLinkAliasNode());
					break;
				case TOKENS.autoLink:
					textNodes.push(this.getAutoLinkNode());
					break;
				case TOKENS.leftImageMarker:
					textNodes.push(this.getImageNode());
					break;
				default:
					textNodes.push({
						type: 'unmarked text',
						value: this.eat(TOKENS.unmarkedText),
					});
			}
		}

		return textNodes;
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
		linkAliasNode.title = this.eat(TOKENS.linkAliasTitle);
		this.eat(TOKENS.linkAliasMarker2);
		linkAliasNode.url = this.eat(TOKENS.linkAliasUrl);
		this.eat(TOKENS.linkAliasMarker3);
		
		return linkAliasNode;
	}

	getAutoLinkNode() {
		return {
			type: 'auto link',
			url: this.eat(TOKENS.autoLink)
		}
	}

	eat(token) {
		const currentLookahead = this.lookahead

		if (currentLookahead == null) {
			throw new SyntaxError(
				`Unexpected end of input, expected "${token.type}"`
			);
		} 

		if (currentLookahead.type !== token.type) {
			throw new SyntaxError(
				`Unexpected token: "${currentLookahead.type}", expected; "${token.type}"`
			)
		}

		this.lookahead = this.lexer.getNextToken();

		return currentLookahead;
	}
}

module.exports = Parser;
