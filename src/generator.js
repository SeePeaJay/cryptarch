const Lexer = require('./lexer');
const { TREE_NODE_TYPES } = require('./constants');

class Generator {
	constructor() {
		this.lexer = new Lexer();
	}

	toHtml(tree) {
		let html = '';

		tree.blocks.forEach((rootBlockNode) => {
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
		return `<h1>${this.getHtmlFromTextNodes(titleNode.text)}</h1>`;
	}

	getHtmlFromLevel1SubtitleNode(level1SubtitleNode) {
		return `<h2>${this.getHtmlFromTextNodes(level1SubtitleNode.text)}</h2>`;
	}

	getHtmlFromLevel2SubtitleNode(level2SubtitleNode) {
		return `<h3>${this.getHtmlFromTextNodes(level2SubtitleNode.text)}</h3>`;
	}

	getHtmlFromLevel3SubtitleNode(level3SubtitleNode) {
		return `<h4>${this.getHtmlFromTextNodes(level3SubtitleNode.text)}</h4>`;
	}

	getHtmlFromUnorderedListNode(unorderedListNode) {
		return `<ul>${this.getHtmlFromUnorderedListItemNodes(unorderedListNode.items)}</ul>`;
	}

	getHtmlFromUnorderedListItemNodes(unorderedListItemNodes) {
		let html = '';

		unorderedListItemNodes.forEach((listItemNode) => {
			if ('list' in listItemNode) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.text)}${this.getHtmlFromUnorderedListNode(listItemNode.list)}</li>`;
			} else {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.text)}</li>`;
			}
		});

		return html;
	}

	getHtmlFromOrderedListNode(orderedListNode) {
		return `<ol>${this.getHtmlFromOrderedListItemNodes(orderedListNode.items)}</ol>`;
	}

	getHtmlFromOrderedListItemNodes(orderedListItemNodes) {
		let html = '';

		orderedListItemNodes.forEach((listItemNode) => {
			if (listItemNode.list) {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.text)}${this.getHtmlFromOrderedListNode(listItemNode.list)}</li>`;
			} else {
				html += `<li>${this.getHtmlFromTextNodes(listItemNode.text)}</li>`;
			}
		});

		return html;
	}

	getHtmlFromHorizontalRuleNode() {
		return '<hr>';
	}

	getHtmlFromParagraphNode(paragraphNode) {
		return `<p>${this.getHtmlFromTextNodes(paragraphNode.text)}</p>`;
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
					html += textNode.value;
			}
		});

		return html;
	}

	getHtmlFromBoldTextNode(boldTextNode) {
		return `<strong>${this.getHtmlFromTextNodes(boldTextNode.text)}</strong>`;
	}

	getHtmlFromItalicTextNode(italicTextNode) {
		return `<em>${this.getHtmlFromTextNodes(italicTextNode.text)}</em>`;
	}

	getHtmlFromUnderlinedTextNode(underlinedTextNode) {
		return `<u>${this.getHtmlFromTextNodes(underlinedTextNode.text)}</u>`;
	}

	getHtmlFromHighlightedTextNode(underlinedTextNode) {
		return `<mark>${this.getHtmlFromTextNodes(underlinedTextNode.text)}</mark>`;
	}

	getHtmlFromStrikethroughTextNode(strikethroughTextNode) {
		return `<del>${this.getHtmlFromTextNodes(strikethroughTextNode.text)}</del>`;
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
