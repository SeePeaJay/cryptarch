const PATTERNS = {
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
	linkAliasMarker2: /_\(/, // use to match against a link alias.
	linkAliasMarker3: /\)`/,
	//
	title: /^\* (.|\n(?!\t*\n)(?!\t*$))*$/,
	level1Subtitle: /^=1= (.|\n(?!\t*\n)(?!\t*$))*$/,
	level2Subtitle: /^=2= (.|\n(?!\t*\n)(?!\t*$))*$/,
	level3Subtitle: /^=3= (.|\n(?!\t*\n)(?!\t*$))*$/,
	unorderedList: /^\. (.|\n(?!\t*\n)(?!\t*$))*$/,
	orderedList: /^\d{1,9}\. (.|\n(?!\t*\n)(?!\t*$))*$/,
	horizontalRule: /^---[^\S\n]*$/,

	image: /^\$(?!\n{})(.|\n(?!\t*\n)(?!\t*$))+{}$/,

	boldText: /^`@(?!\n@`)(.|\n(?!\t*\n)(?!\t*$))+@`$/,
	italicText: /^`\/(?!\n\/`)(.|\n(?!\t*\n)(?!\t*$))+\/`$/,
	underlinedText: /^`_(?!\n_`)(.|\n(?!\t*\n)(?!\t*$))+_`$/,
	highlightedText: /^`=(?!\n=`)(.|\n(?!\t*\n)(?!\t*$))+=`$/,
	strikethroughText: /^`-(?!\n-`)(.|\n(?!\t*\n)(?!\t*$))+-`$/,
	linkAlias: /^`_(?!\n_\()(.|\n(?!\t*\n)(?!\t*$))+_\((?!\n\)`)(.|\n(?!\t*\n)(?!\t*$))+\)`$/,
	autoLink: /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/,

	rootBlockSeparator: /\n(?:\s|\t)*\n/, // still need non-capturing group to split properly
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
		value: '* ',
	},
	level1SubtitleMarker: {
		type: 'LEVEL 1 SUBTITLE MARKER',
		value: '=1= ',
	},
	level2SubtitleMarker: {
		type: 'LEVEL 2 SUBTITLE MARKER',
		value: '=2= ',
	},
	level3SubtitleMarker: {
		type: 'LEVEL 3 SUBTITLE MARKER',
		value: '=3= ',
	},
	unorderedListMarker: {
		type: 'UNORDERED LIST MARKER',
		value: '. ',
	},
	orderedListMarker: {
		type: 'ORDERED LIST MARKER',
	},
	horizontalRule: {
		type: 'HORIZONTAL RULE',
		value: '---',
	},

	leftImageMarker: {
		type: 'LEFT IMAGE MARKER',
		value: '$',
	},
	imagePath: {
		type: 'IMAGE PATH',
	},
	rightImageMarker: {
		type: 'RIGHT IMAGE MARKER',
		value: '{}',
	},

	leftBoldTextMarker: {
		type: 'LEFT BOLD TEXT MARKER',
		value: '`@',
	},
	rightBoldTextMarker: {
		type: 'RIGHT BOLD TEXT MARKER',
		value: '@`'
	},
	leftItalicTextMarker: {
		type: 'LEFT ITALIC TEXT MARKER',
		value: '`/'
	},
	rightItalicTextMarker: {
		type: 'RIGHT ITALIC TEXT MARKER',
		value: '/`'
	},
	leftUnderlinedTextMarker: {
		type: 'LEFT UNDERLINED TEXT MARKER',
		value: '`_'
	},
	rightUnderlinedTextMarker: {
		type: 'RIGHT UNDERLINED TEXT MARKER',
		value: '_`'
	},
	leftHighlightedTextMarker: {
		type: 'LEFT HIGHLIGHTED TEXT MARKER',
		value: '`='
	},
	rightHighlightedTextMarker: {
		type: 'RIGHT HIGHLIGHTED TEXT MARKER',
		value: '=`'
	},
	leftStrikethroughTextMarker: {
		type: 'LEFT STRIKETHROUGH TEXT MARKER',
		value: '`-'
	},
	rightStrikethroughTextMarker: {
		type: 'RIGHT STRIKETHROUGH TEXT MARKER',
		value: '-`'
	},
	linkAliasMarker1: {
		type: 'LINK ALIAS MARKER 1',
		value: '`_',
	},
	linkAliasTitle: {
		type: 'LINK ALIAS TITLE',
	},
	linkAliasMarker2: {
		type: 'LINK ALIAS MARKER 2',
		value: '_(',
	},
	linkAliasUrl: {
		type: 'LINK ALIAS URL',
	},
	linkAliasMarker3: {
		type: 'LINK ALIAS MARKER 3',
		value: ')`',
	},
	autoLink: {
		type: 'AUTO LINK',
	},

	unmarkedText: {
		type: 'UNMARKED TEXT'
	},

	rootBlockSeparator: {
		type: 'ROOT BLOCK SEPARATOR',
		value: '\n\n'
	},
	listItemSeparator: {
		type: 'LIST ITEM SEPARATOR',
	}
}
// I guess we can create a Token type in the future? And we could create custom token templates here.

module.exports = { PATTERNS, TOKENS };
