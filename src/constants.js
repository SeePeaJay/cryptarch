const RULES = {
	block: { // used to match against a block
		title: /^\* (.|\n(?!\t*\n)(?!\t*$))*$/,
		level1Subtitle: /^=1= (.|\n(?!\t*\n)(?!\t*$))*$/,
		level2Subtitle: /^=2= (.|\n(?!\t*\n)(?!\t*$))*$/,
		level3Subtitle: /^=3= (.|\n(?!\t*\n)(?!\t*$))*$/,
		unorderedList: /^\. (.|\n(?!\t*\n)(?!\t*$))*$/,
		orderedList: /^\d{1,9}\. (.|\n(?!\t*\n)(?!\t*$))*$/,
		horizontalRule: /^---[^\S\n]*$/,

		image: /^\$(?!\n{})(.|\n(?!\t*\n)(?!\t*$))+?{}$/,
	},
	inline: { // used to match against text
		boldText: /`@(?!\n@`)(?:.|\n(?!\t*\n)(?!\t*$))+?@`/,
		italicText: /`\/(?!\n\/`)(?:.|\n(?!\t*\n)(?!\t*$))+?\/`/,
		underlinedText: /`_(?!\n_`)(?:.|\n(?!\t*\n)(?!\t*$))+?_`/,
		highlightedText: /`=(?!\n=`)(?:.|\n(?!\t*\n)(?!\t*$))+?=`/,
		strikethroughText: /`-(?!\n-`)(?:.|\n(?!\t*\n)(?!\t*$))+?-`/,
		linkAlias: /`_(?!\n_\()(?:.|\n(?!\t*\n)(?!\t*$))+?_\((?!\n\)`)(?:.|\n(?!\t*\n)(?!\t*$))+?\)`/,
		autolink: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,

		image: /\$(?!\n{})(.|\n(?!\t*\n)(?!\t*$))+?{}/,
	},
	marker: { // used to match against each respective element
		titleMarker: /^\* /,
		level1SubtitleMarker: /^=1= /,
		level2SubtitleMarker: /^=2= /,
		level3SubtitleMarker: /^=3= /,
		unorderedListMarker: /^. /,
		orderedListMarker: /^\d{1,9}. /,

		leftImageMarker: /^\$/,
		rightImageMarker: /{}$/,

		leftBoldTextMarker: /^`@/,
		rightBoldTextMarker: /@`$/,
		leftItalicTextMarker: /^`\//,
		rightItalicTextMarker: /\/`$/,
		leftUnderlinedTextMarker: /^`_/,
		rightUnderlinedTextMarker: /_`$/,
		leftHighlightedTextMarker: /^`=/,
		rightHighlightedTextMarker: /=`$/,
		leftStrikethroughTextMarker: /^`-/,
		rightStirkethroughTextMarker: /-`$/,
		linkAliasMarker1: /^`_/,
		linkAliasMarker2: /_\(/,
		linkAliasMarker3: /\)`/,
	},
	rootBlockSeparator: /\n(?:\s|\t)*\n/, 
		/* 
			used to match against the whole engram
			still need non-capturing group to split properly
		*/
	listItemSeparator: /\n[^\S\n]*(?=(?:\d{1,9})?\. )/
		/*
			This specific pattern only works when matched against a list.
			There is a lookbehind solution: /(?<!\n)\n[^\S\n]*(?=(\d{1,9})?\. )/. However, lookbehind is not supported in all browsers.
			Closest attempt with lookahead: /((?!\n).|^)\n[^\S\n]*(?=(\d{1,9})?\. )/
		*/
};

const TOKENS = { // perhaps split into TOKEN_TYPES and TOKEN_VALUES? TOKEN_TEMPLATES?
	titleMarker: {
		type: 'TITLE MARKER',
	},
	level1SubtitleMarker: {
		type: 'LEVEL 1 SUBTITLE MARKER',
	},
	level2SubtitleMarker: {
		type: 'LEVEL 2 SUBTITLE MARKER',
	},
	level3SubtitleMarker: {
		type: 'LEVEL 3 SUBTITLE MARKER',
	},
	unorderedListMarker: {
		type: 'UNORDERED LIST MARKER',
	},
	orderedListMarker: {
		type: 'ORDERED LIST MARKER',
	},
	horizontalRule: {
		type: 'HORIZONTAL RULE',
	},

	leftImageMarker: {
		type: 'LEFT IMAGE MARKER',
	},
	imagePath: {
		type: 'IMAGE PATH',
	},
	rightImageMarker: {
		type: 'RIGHT IMAGE MARKER',
	},

	leftBoldTextMarker: {
		type: 'LEFT BOLD TEXT MARKER',
	},
	rightBoldTextMarker: {
		type: 'RIGHT BOLD TEXT MARKER',
	},
	leftItalicTextMarker: {
		type: 'LEFT ITALIC TEXT MARKER',
	},
	rightItalicTextMarker: {
		type: 'RIGHT ITALIC TEXT MARKER',
	},
	leftUnderlinedTextMarker: {
		type: 'LEFT UNDERLINED TEXT MARKER',
	},
	rightUnderlinedTextMarker: {
		type: 'RIGHT UNDERLINED TEXT MARKER',
	},
	leftHighlightedTextMarker: {
		type: 'LEFT HIGHLIGHTED TEXT MARKER',
	},
	rightHighlightedTextMarker: {
		type: 'RIGHT HIGHLIGHTED TEXT MARKER',
	},
	leftStrikethroughTextMarker: {
		type: 'LEFT STRIKETHROUGH TEXT MARKER',
	},
	rightStrikethroughTextMarker: {
		type: 'RIGHT STRIKETHROUGH TEXT MARKER',
	},
	linkAliasMarker1: {
		type: 'LINK ALIAS MARKER 1',
	},
	linkAliasTitle: {
		type: 'LINK ALIAS TITLE',
	},
	linkAliasMarker2: {
		type: 'LINK ALIAS MARKER 2',
	},
	linkAliasUrl: {
		type: 'LINK ALIAS URL',
	},
	linkAliasMarker3: {
		type: 'LINK ALIAS MARKER 3',
	},
	autolink: {
		type: 'AUTOLINK',
	},

	unmarkedText: {
		type: 'UNMARKED TEXT'
	},

	rootBlockSeparator: {
		type: 'ROOT BLOCK SEPARATOR',
	},
	listItemSeparator: {
		type: 'LIST ITEM SEPARATOR',
	}
}
// I guess we can create a Token type in the future? And we could create custom token templates here.

const TREE_NODE_TYPES = {
	engram: 'engram',

	title: 'title',
	level1Subtitle: 'level 1 subtitle',
	level2Subtitle: 'level 2 subtitle',
	level3Subtitle: 'level 3 subtitle',
	unorderedList: 'unordered list',
	orderedList: 'ordered list',
	listItem: 'list item',
	horizontalRule: 'horizontal rule',
	paragraph: 'paragraph',

	image: 'image',

	boldText: 'bold text',
	italicText: 'italic text',
	underlinedText: 'underlined text',
	highlightedText: 'highlighted text',
	strikethroughText: 'strikethrough text',
	linkAlias: 'link alias',
	autolink: 'autolink',
	unmarkedText: 'unmarked text',
};

module.exports = { RULES, TOKENS, TREE_NODE_TYPES };
