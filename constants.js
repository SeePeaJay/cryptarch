function escapeRegExp(string) { // https://stackoverflow.com/a/6969486
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const MARKERS = {
	rootBlockSeparator: '\n\n',

	title: '* ',
	heading1: '*_1 ', // https://www.quora.com/What-is-the-difference-between-Title-and-Heading-1-styles-in-a-word-processor
	heading2: '*_2 ',
	heading3: '*_3 ',
	unorderedList: '. ',
	orderedList: '\\d{1,9}\\. ', // need to escape backslash character; TODO conver to regex?
	listItemSeparator: '\n',
	horizontalRule: '---',

	engramLink1: '*',
	engramLink2: '{',
	engramLink3: '}',
	engramLinkBlockId: '::',
	engramLinkMetadataSeparator: ',',
	image1: '$',
	image2: '{}',
	

	bold: '@@',
	italic: '//',
	underlined: '__',
	highlighted: '==',
	strikethrough: '--',
	code1: '</',
	code2: '>',
	alias1: '__',
	alias2: '__(',
	alias3: ')',
	tag1: '#',
	tag2: '{}',
};

const RULES = {
	/*
		Block rules are designed to match against a block.
		As of this writing, tabs should not count as indent, so they are excluded from the rules for now.
	*/
	block: {
		engramLink: new RegExp(`^${escapeRegExp(MARKERS.engramLink1)}[^\\s]+?${escapeRegExp(MARKERS.engramLink2)}[^\\n]*?${escapeRegExp(MARKERS.engramLink3)}$`),
		image: new RegExp(`^${escapeRegExp(MARKERS.image1)}[^\\s]+?${escapeRegExp(MARKERS.image2)}$`),

		title: new RegExp(`^${escapeRegExp(MARKERS.title)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		heading1: new RegExp(`^${escapeRegExp(MARKERS.heading1)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		heading2: new RegExp(`^${escapeRegExp(MARKERS.heading2)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		heading3: new RegExp(`^${escapeRegExp(MARKERS.heading3)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		unorderedList: new RegExp(`^${escapeRegExp(MARKERS.unorderedList)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		orderedList: new RegExp(`^${MARKERS.orderedList}(?:.|\\n(?! *\\n)(?! *$))+$`),
		horizontalRule: new RegExp(`^${escapeRegExp(MARKERS.horizontalRule)}[^\\S\\n]*$`),
	},

	/*
		Inline rules are designed to match against text; tabs and spaces may count as text for now.
	*/
	inline: {
		engramLink: new RegExp(`${escapeRegExp(MARKERS.engramLink1)}[^\\s]+?${escapeRegExp(MARKERS.engramLink2)}[^\\n]*?${escapeRegExp(MARKERS.engramLink3)}`),
		autolink: /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, // added non-capturing group
		image: new RegExp(`${escapeRegExp(MARKERS.image1)}[^\\s]+?${escapeRegExp(MARKERS.image2)}`),

		alias: new RegExp(`${escapeRegExp(MARKERS.alias1)}.+?${escapeRegExp(MARKERS.alias2)}.+?${escapeRegExp(MARKERS.alias3)}`),
		bold: new RegExp(`${escapeRegExp(MARKERS.bold)}.+?${escapeRegExp(MARKERS.bold)}`),
		italic: new RegExp(`${escapeRegExp(MARKERS.italic)}.+?${escapeRegExp(MARKERS.italic)}`),
		underlined: new RegExp(`${escapeRegExp(MARKERS.underlined)}.+?${escapeRegExp(MARKERS.underlined)}`),
		highlighted: new RegExp(`${escapeRegExp(MARKERS.highlighted)}.+?${escapeRegExp(MARKERS.highlighted)}`),
		strikethrough: new RegExp(`${escapeRegExp(MARKERS.strikethrough)}.+?${escapeRegExp(MARKERS.strikethrough)}`),
		code: new RegExp(`${escapeRegExp(MARKERS.code1)}.+?${escapeRegExp(MARKERS.code2)}`),
	},

	separator: {
		/*
			This pattern is designed to match against the whole engram.
		*/
		rootBlock: /\n(?: |\t)*\n/,

		/*
			This specific pattern is designed to match against a list only.
			Translation: match newline w/ n spaces, as long as a proper list item follows.
		*/
		listItem: /\n *(?=(?:\d{1,9})?\. (?! *\n| *$))/,
	},

	/*
		This pattern is designed to match against engram link metadata.
	*/
	engramLinkBlockId: new RegExp(`${MARKERS.engramLinkBlockId}[A-Za-z0-9_-]{6}`), // https://github.com/ai/nanoid#api
};

module.exports = { MARKERS, RULES };
