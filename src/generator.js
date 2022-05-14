const Lexer = require('./lexer');
const { TREE_NODE_TYPES } = require('./constants');

class Generator {
	constructor() {
		this.lexer = new Lexer();
	}

	toHtml(tree) {
		let html = '';

		tree.rootBlockNodes.forEach((rootBlockNode) => {
			switch (rootBlockNode.type) {
				case TREE_NODE_TYPES.title:
					html += this.getHtmlFromTitleNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.level1Subtitle:
					html += this.getHtmlFromLevel1SubtitleNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.level2Subtitle:
					html += this.getHtmlFromLevel2SubtitleNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.level3Subtitle:
					html += this.getHtmlFromLevel3SubtitleNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.unorderedList:
					html += this.getHtmlFromUnorderedListNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.orderedList:
					html += this.getHtmlFromOrderedListNode(rootBlockNode);
					break;
				case TREE_NODE_TYPES.horizontalRule:
					html += this.getHtmlFromHorizontalRuleNode();
					break;
				case TREE_NODE_TYPES.image:
					html += this.getHtmlFromImageNode(rootBlockNode);
					break;
				default:
					html += this.getHtmlFromParagraphNode(rootBlockNode);
			}
		});

		return html;
	}

	getHtmlFromTitleNode(titleNode) {
		return `<h1>${this.getHtmlFromTextNodes(titleNode.textNodes)}</h1>`;
	}

	getHtmlFromLevel1SubtitleNode(level1SubtitleNode) {
		return `<h2>${this.getHtmlFromTextNodes(level1SubtitleNode.textNodes)}</h2>`;
	}

	getHtmlFromLevel2SubtitleNode(level2SubtitleNode) {
		return `<h3>${this.getHtmlFromTextNodes(level2SubtitleNode.textNodes)}</h3>`;
	}

	getHtmlFromLevel3SubtitleNode(level3SubtitleNode) {
		return `<h4>${this.getHtmlFromTextNodes(level3SubtitleNode.textNodes)}</h4>`;
	}

	getHtmlFromUnorderedListNode(unorderedListNode) {
		return `<ul>${this.getHtmlFromUnorderedListItemNodes(unorderedListNode.listItemNodes)}</ul>`;
	}

	getHtmlFromUnorderedListItemNodes(unorderedListItemNodes) {
		let html = '';

		unorderedListItemNodes.forEach((listItemNode) => {
			if ('listNode' in listItemNode && listItemNode.listNode.type === TREE_NODE_TYPES.unorderedList) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}${this.getHtmlFromUnorderedListNode(listItemNode.listNode)}</li>`;
			} else if ('listNode' in listItemNode && listItemNode.listNode.type === TREE_NODE_TYPES.orderedList) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}${this.getHtmlFromOrderedListNode(listItemNode.listNode)}</li>`;
			} else {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}</li>`;
			}
		});

		return html;
	}

	getHtmlFromOrderedListNode(orderedListNode) {
		return `<ol>${this.getHtmlFromOrderedListItemNodes(orderedListNode.listItemNodes)}</ol>`;
	}

	getHtmlFromOrderedListItemNodes(orderedListItemNodes) {
		let html = '';

		orderedListItemNodes.forEach((listItemNode) => {
			if ('listNode' in listItemNode && listItemNode.listNode.type === TREE_NODE_TYPES.orderedList) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}${this.getHtmlFromOrderedListNode(listItemNode.listNode)}</li>`;
			} else if ('listNode' in listItemNode && listItemNode.listNode.type === TREE_NODE_TYPES.unorderedList) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}${this.getHtmlFromUnorderedListNode(listItemNode.listNode)}</li>`;
			} else {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.textNodes)}</li>`;
			}
		});

		return html;
	}

	getHtmlFromHorizontalRuleNode() {
		return '<hr>';
	}

	getHtmlFromParagraphNode(paragraphNode) {
		return `<p>${this.getHtmlFromTextNodes(paragraphNode.textNodes)}</p>`;
	}

	getHtmlFromImageNode(imageNode) {
		return `<img src="${this.getUrlWithProtocol(imageNode.path)}">`;
	}

	getHtmlFromTextNodes(textNodes) {
		let html = '';

		textNodes.forEach((textNode) => {
			switch (textNode.type) {
				case TREE_NODE_TYPES.boldText:
					html += this.getHtmlFromBoldTextNode(textNode);
					break;
				case TREE_NODE_TYPES.italicText:
					html += this.getHtmlFromItalicTextNode(textNode);
					break;
				case TREE_NODE_TYPES.underlinedText:
					html += this.getHtmlFromUnderlinedTextNode(textNode);
					break;
				case TREE_NODE_TYPES.highlightedText:
					html += this.getHtmlFromHighlightedTextNode(textNode);
					break;
				case TREE_NODE_TYPES.strikethroughText:
					html += this.getHtmlFromStrikethroughTextNode(textNode);
					break;
				case TREE_NODE_TYPES.linkAlias:
					html += this.getHtmlFromLinkAliasNode(textNode);
					break;
				case TREE_NODE_TYPES.autolink:
					html += this.getHtmlFromAutolinkNode(textNode);
					break;
				case TREE_NODE_TYPES.image:
					html += this.getHtmlFromImageNode(textNode);
					break;
				default:
					html += textNode.text;
			}
		});

		return html;
	}

	getHtmlFromBoldTextNode(boldTextNode) {
		return `<strong>${this.getHtmlFromTextNodes(boldTextNode.textNodes)}</strong>`;
	}

	getHtmlFromItalicTextNode(italicTextNode) {
		return `<em>${this.getHtmlFromTextNodes(italicTextNode.textNodes)}</em>`;
	}

	getHtmlFromUnderlinedTextNode(underlinedTextNode) {
		return `<u>${this.getHtmlFromTextNodes(underlinedTextNode.textNodes)}</u>`;
	}

	getHtmlFromHighlightedTextNode(underlinedTextNode) {
		return `<mark>${this.getHtmlFromTextNodes(underlinedTextNode.textNodes)}</mark>`;
	}

	getHtmlFromStrikethroughTextNode(strikethroughTextNode) {
		return `<del>${this.getHtmlFromTextNodes(strikethroughTextNode.textNodes)}</del>`;
	}

	getHtmlFromLinkAliasNode(linkAliasNode) {
		return `<a href="${this.getUrlWithProtocol(linkAliasNode.url)}" target="_blank">${linkAliasNode.title}</a>`;
	}

	getHtmlFromAutolinkNode(autolinkNode) {
		return `<a href="${this.getUrlWithProtocol(autolinkNode.url)}" target="_blank">${autolinkNode.url}</a>`;
	}

	getUrlWithProtocol(url) {
		const httpPattern = /^((http|https|ftp):\/\/)/;

		let validHref = url;
		if (!httpPattern.test(url)) {
			validHref = `//${url}`;
		}

		return validHref;
	}
}

module.exports = Generator;
