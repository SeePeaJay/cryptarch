const PATTERNS = {
	unorderedList: /^. (.|\n(?!\t*\n)(?!\t*$))*$/,
	orderedList: /^\d{1,9}. (.|\n(?!\t*\n)(?!\t*$))*$/,

	rootBlockSeparator: /\n(?:\s|\t)*\n/,
	listItemSeparator: /(?!\n\n$)\n(?:\s|\t)*(?=(\d{1,9})?. (.|\n(?!\t*\n)(?!\t*$))*)/ // best attempt; you want a lookbehind with \n
};

module.exports = PATTERNS;
