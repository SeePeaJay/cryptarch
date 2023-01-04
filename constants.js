const MARKERS = {
	rootBlockDelimiter: '\n\n',

	block: {
		title: '* ',
		subtitle: {
			level1: '*_1 ', // https://www.quora.com/What-is-the-difference-between-Title-and-Heading-1-styles-in-a-word-processor
			level2: '*_2 ',
			level3: '*_3 ',
		},
		list: {
			unordered: '. ',
			ordered: '\\d{1,9}\\. ', // need to escape backslash character; TODO: convert to regex?
			itemDelimiter: '\n',
		},
		horizontalRule: '---',
	},

	inline: {
		alias: {
			1: '__',
			2: '__(',
			3: ')',
		},
		bold: '@@',
		italic: '//',
		underlined: '__',
		highlighted: '==',
		strikethrough: '--',
		code: {
			1: '</',
			2: '>',
		},
	},

	hybrid: {
		engramLink: {
			default: '*',
			tag: '#',
		},
		image: '$',
	},

	metadata: {
		container: {
			1: '{',
			2: '}',
		},
		delimiter: {
			item: ',',
			container: '\n',
		},
		blockId: '::',
	},
};

const RULES = {
	/*
		This pattern is designed to match against the whole engram.
	*/
	rootBlockDelimiter: new RegExp(`${escapeRegExp(MARKERS.rootBlockDelimiter[0])}(?: |\\t)*${escapeRegExp(MARKERS.rootBlockDelimiter[1])}`),

	/*
		Block rules are designed to match against a block.
		As of this writing, tabs should not count as indent, so they are excluded from the rules for now.
	*/
	block: {
		title: new RegExp(`^${escapeRegExp(MARKERS.block.title)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		subtitle: {
			level1: new RegExp(`^${escapeRegExp(MARKERS.block.subtitle.level1)}(?:.|\\n(?! *\\n)(?! *$))+$`),
			level2: new RegExp(`^${escapeRegExp(MARKERS.block.subtitle.level2)}(?:.|\\n(?! *\\n)(?! *$))+$`),
			level3: new RegExp(`^${escapeRegExp(MARKERS.block.subtitle.level3)}(?:.|\\n(?! *\\n)(?! *$))+$`),
		},
		list: {
			unordered: new RegExp(`^${escapeRegExp(MARKERS.block.list.unordered)}(?:.|\\n(?! *\\n)(?! *$))+$`),
			ordered: new RegExp(`^${MARKERS.block.list.ordered}(?:.|\\n(?! *\\n)(?! *$))+$`),

			/*
				This specific pattern is designed to match against a list only.
				Translation: match newline w/ n spaces, as long as a proper list item follows.
			*/
			itemDelimiter: new RegExp(`${escapeRegExp(MARKERS.block.list.itemDelimiter)} *(?=(?:\\d{1,9})?\\. (?! *${escapeRegExp(MARKERS.block.list.itemDelimiter)}| *$))`)
		},
		horizontalRule: new RegExp(`^${escapeRegExp(MARKERS.block.horizontalRule)}[^\\S\\n]*$`),
	},

	/*
		Inline rules are designed to match against text; tabs and spaces may count as text for now.
	*/
	inline: {
		alias: new RegExp(`${escapeRegExp(MARKERS.inline.alias[1])}.+?${escapeRegExp(MARKERS.inline.alias[2])}.+?${escapeRegExp(MARKERS.inline.alias[3])}`),
		bold: new RegExp(`${escapeRegExp(MARKERS.inline.bold)}.+?${escapeRegExp(MARKERS.inline.bold)}`),
		italic: new RegExp(`${escapeRegExp(MARKERS.inline.italic)}.+?${escapeRegExp(MARKERS.inline.italic)}`),
		underlined: new RegExp(`${escapeRegExp(MARKERS.inline.underlined)}.+?${escapeRegExp(MARKERS.inline.underlined)}`),
		highlighted: new RegExp(`${escapeRegExp(MARKERS.inline.highlighted)}.+?${escapeRegExp(MARKERS.inline.highlighted)}`),
		strikethrough: new RegExp(`${escapeRegExp(MARKERS.inline.strikethrough)}.+?${escapeRegExp(MARKERS.inline.strikethrough)}`),
		code: new RegExp(`${escapeRegExp(MARKERS.inline.code[1])}.+?${escapeRegExp(MARKERS.inline.code[2])}`),

		autolink: /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, // added non-capturing group
	},

	hybrid: {
		engramLink: {
			block: new RegExp(`^${escapeRegExp(MARKERS.hybrid.engramLink.default)}.+?${escapeRegExp(MARKERS.metadata.container[1])}[^\\n]*?${escapeRegExp(MARKERS.metadata.container[2])}$`),
			inline: new RegExp(`(?:${escapeRegExp(MARKERS.hybrid.engramLink.default)}|${escapeRegExp(MARKERS.hybrid.engramLink.tag)})[^#*\n]+?${escapeRegExp(MARKERS.metadata.container[1])}.*?${escapeRegExp(MARKERS.metadata.container[2])}`), // for the time being, [^#*\n] prevents detecting normal usage of * and #, which may actually be ok (if using files as storage, special characters need to be avoided anyway)
		},
		image: {
			block: new RegExp(`^${escapeRegExp(MARKERS.hybrid.image)}[^\\s]+?${escapeRegExp(MARKERS.metadata.container[1])}${escapeRegExp(MARKERS.metadata.container[2])}$`),
			inline: new RegExp(`${escapeRegExp(MARKERS.hybrid.image)}[^\\s]+?${escapeRegExp(MARKERS.metadata.container[1])}${escapeRegExp(MARKERS.metadata.container[2])}`),
		},
	},
	
	metadata: {
		block: new RegExp(`\\n${escapeRegExp(MARKERS.metadata.container[1])}[\\S\\s]*${escapeRegExp(MARKERS.metadata.container[2])}`),

		/*
			This pattern is designed to match against engram link metadata.
		*/
		blockId: new RegExp(`${MARKERS.metadata.blockId}[A-Za-z0-9_-]{6}`), // https://github.com/ai/nanoid#api
	}
};

function escapeRegExp(string) { // https://stackoverflow.com/a/6969486
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getAllRules(type) {
	let allRules;
	if (type === 'block') {
		allRules = [
			RULES.block.title, // 1
			RULES.block.subtitle.level1, // 2
			RULES.block.subtitle.level2, // 3
			RULES.block.subtitle.level3, // 4
			RULES.block.list.unordered, // 5
			RULES.block.list.ordered, // 6
			RULES.block.horizontalRule, // 7
			RULES.hybrid.engramLink.block, // 8
			RULES.hybrid.image.block, // 9
		];
	} else {
		allRules = [
			RULES.inline.alias, // 1
			RULES.inline.bold, // 2
			RULES.inline.italic, // 3
			RULES.inline.underlined, // 4
			RULES.inline.highlighted, // 5
			RULES.inline.strikethrough, // 6
			RULES.inline.code, // 7
			RULES.inline.autolink, // 8
			RULES.hybrid.engramLink.inline, // 9
			RULES.hybrid.image.inline, // 10
		];
	}

	let patternSource = '';
	allRules.forEach((rule) => {
		patternSource += `(${rule.source})|`; // add capture group here
	});
	patternSource = patternSource.slice(0, -1);

	return new RegExp(patternSource, 'g');
}

module.exports = { MARKERS, RULES, escapeRegExp, getAllRules };
