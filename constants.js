const MARKERS = {
	title: '* ',
	h1: '*_1 ', // https://www.quora.com/What-is-the-difference-between-Title-and-Heading-1-styles-in-a-word-processor
	h2: '*_2 ',
	h3: '*_3 ',
	ol: '. ',
	ul: /\d{1,9}\. /,

	img1: '$',
	img2: '{}',
	engram1: '*',
	engram2: '{',
	engram3: '}',

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
		title: new RegExp(`^${escapeRegExp(MARKERS.title)}(?:.|\n(?! *\n)(?! *$))+$`),
	}

	/*
		This specific pattern is designed to match against the whole engram.
		Prob not useful rn?
	*/
	// rootBlockSeparator: /\n(?: |\t)*\n/,
};

function escapeRegExp(string) { // https://stackoverflow.com/a/6969486
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

console.log(RULES.block.title);