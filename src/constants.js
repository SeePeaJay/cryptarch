const PATTERNS = {
	title: /^* (.|\n(?!\t*\n)(?!\t*$))*$/,
	level1Subtitle: /^=1= (.|\n(?!\t*\n)(?!\t*$))*$/,
	level2Subtitle: /^=2= (.|\n(?!\t*\n)(?!\t*$))*$/,
	level3Subtitle: /^=3= (.|\n(?!\t*\n)(?!\t*$))*$/,
	unorderedList: /^. (.|\n(?!\t*\n)(?!\t*$))*$/,
	orderedList: /^\d{1,9}. (.|\n(?!\t*\n)(?!\t*$))*$/,
	horizontalRule: /^---[^\S\n]*$/,

	rootBlockSeparator: /\n(?:\s|\t)*\n/, // still need non-capturing group to split properly
	listItemSeparator: /\n[^\S\n]*(?=(?:\d{1,9})?\. )/
		/*
			This specific pattern only works when matched against a list.
			There is a lookbehind solution: /(?<!\n)\n[^\S\n]*(?=(\d{1,9})?\. )/. However, lookbehind is not supported in all browsers.
			Closest attempt with lookahead: /((?!\n).|^)\n[^\S\n]*(?=(\d{1,9})?\. )/
		*/

};

const TOKENS = {
	rootBlockSeparator: {
		name: 'ROOT BLOCK SEPARATOR',
	},
	listItemSeparator: {
		name: 'LIST ITEM SEPARATOR',
	}
}

module.exports = PATTERNS, TOKENS;
