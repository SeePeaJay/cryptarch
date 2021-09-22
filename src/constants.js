const PATTERNS = {
	unorderedList: /^. (.|\n(?!\t*\n)(?!\t*$))*$/,
	orderedList: /^\d{1,9}. (.|\n(?!\t*\n)(?!\t*$))*$/,

	rootBlockSeparator: /\n(?:\s|\t)*\n/, // still need non-capturing group to split properly
	listItemSeparator: /\n[^\S\n]*(?=(?:\d{1,9})?\. )/
		/*
			This specific pattern only works when matched against a list.
			There is a lookbehind solution: /(?<!\n)\n[^\S\n]*(?=(\d{1,9})?\. )/. However, lookbehind is not supported in all browsers.
			Closest attempt with lookahead: /((?!\n).|^)\n[^\S\n]*(?=(\d{1,9})?\. )/
		*/

};

module.exports = PATTERNS;
