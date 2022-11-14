const MARKERS = {
	title: '* ',
	h1: '*_1 ', // https://www.quora.com/What-is-the-difference-between-Title-and-Heading-1-styles-in-a-word-processor
	h2: '*_2 ',
	h3: '*_3 ',
	ul: '. ',
	ol: '\\d{1,9}\\. ', // 
	hr: '---',

	img1: '$',
	img2: '{}',
	engramLink1: '*',
	engramLink2: '{',
	engramLink3: '}',

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

	blockSeparator: '\n\n',
};

const RULES = {
	/*
		Block rules are designed to match against a block.
		As of this writing, tabs should not count as indent, so they are excluded from the rules for now.
	*/
	block: {
		title: new RegExp(`^${escapeRegExp(MARKERS.title)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		h1: new RegExp(`^${escapeRegExp(MARKERS.h1)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		h2: new RegExp(`^${escapeRegExp(MARKERS.h2)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		h3: new RegExp(`^${escapeRegExp(MARKERS.h3)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		ul: new RegExp(`^${escapeRegExp(MARKERS.ul)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		ol: new RegExp(`^${MARKERS.ol}(?:.|\\n(?! *\\n)(?! *$))+$`),
		hr: new RegExp(`^${escapeRegExp(MARKERS.hr)}[^\\S\\n]*$`),

		img: new RegExp(`^${escapeRegExp(MARKERS.img1)}[^{}\\s]+?${escapeRegExp(MARKERS.img2)}$`),
	},

	/*
		Inline rules are designed to match against text; tabs and spaces may count as text for now.
	*/
	inline: {
		bold: new RegExp(`${escapeRegExp(MARKERS.bold)}.+?${escapeRegExp(MARKERS.bold)}`),
		italic: new RegExp(`${escapeRegExp(MARKERS.italic)}.+?${escapeRegExp(MARKERS.italic)}`),
		underlined: new RegExp(`${escapeRegExp(MARKERS.underlined)}.+?${escapeRegExp(MARKERS.underlined)}`),
		highlighted: new RegExp(`${escapeRegExp(MARKERS.highlighted)}.+?${escapeRegExp(MARKERS.highlighted)}`),
		strikethrough: new RegExp(`${escapeRegExp(MARKERS.strikethrough)}.+?${escapeRegExp(MARKERS.strikethrough)}`),
		code: new RegExp(`${escapeRegExp(MARKERS.code1)}.+?${escapeRegExp(MARKERS.code2)}`),
		alias: new RegExp(`${escapeRegExp(MARKERS.alias1)}.+?${escapeRegExp(MARKERS.alias2)}.+?${escapeRegExp(MARKERS.alias3)}`),
		autolink: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,

		img: new RegExp(`${escapeRegExp(MARKERS.img1)}[^{}\\s]+?${escapeRegExp(MARKERS.img2)}`),
	},

	/*
		This specific pattern is designed to match against a list only.
		Translation: match newline w/ n spaces, as long as a proper list item follows.
	*/
	listItemSeparator: /\n *(?=(?:\d{1,9})?\. (?! *\n| *$))/,

	/*
		This specific pattern is designed to match against the whole engram.
		Prob not useful rn?
	*/
	// rootBlockSeparator: /\n(?: |\t)*\n/,
};

function escapeRegExp(string) { // https://stackoverflow.com/a/6969486
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

for (const key of Object.keys(RULES.block)) {
	console.log(key, RULES.block[key]);
}

console.log(new RegExp(`^${escapeRegExp(MARKERS.title)}(?:.|\n(?! *\n)(?! *$))+$`));
console.log(new RegExp(`^${escapeRegExp(MARKERS.title)}(?:.|\\n(?! *\\n)(?! *$))+$`));
console.log(new RegExp(escapeRegExp(`^${MARKERS.title}(?:.|\n(?! *\n)(?! *$))+$`)));