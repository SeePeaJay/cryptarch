function getMappedObject(obj, func) { // https://stackoverflow.com/a/38829074
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => 
      [k, v === Object(v) ? getMappedObject(v, func) : func(v)]
    )
  );
	// TODO: do sth about ordered list regex if it's needed in the future?
}

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
			ordered: '\\d{1,9}\\. ', // TODO: only include the dot or equivalent in the future; the number should remain the same
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

// In case a marker is needed in its regex form.
const MARKER_REGEX = getMappedObject(MARKERS, (x) => new RegExp(escapeRegExp(x)));

// Checks if a given (part of an) engram is one of the following elements.
const RULES = {
	// This pattern is designed to match against the whole engram.
	rootBlockDelimiter: new RegExp(`${escapeRegExp(MARKERS.rootBlockDelimiter[0])}(?: |\\t)*${escapeRegExp(MARKERS.rootBlockDelimiter[1])}`),

	// Block patterns are designed to match against a block.
	// As of this writing, tabs should not count as indent, so they are excluded from the patterns for now.
	block: {
		title: new RegExp(`^${MARKER_REGEX.block.title.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
		subtitle: {
			level1: new RegExp(`^${MARKER_REGEX.block.subtitle.level1.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
			level2: new RegExp(`^${MARKER_REGEX.block.subtitle.level2.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
			level3: new RegExp(`^${MARKER_REGEX.block.subtitle.level3.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
		},
		list: {
			unordered: new RegExp(`^${MARKER_REGEX.block.list.unordered.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
			ordered: new RegExp(`^${MARKERS.block.list.ordered}(?:.|\\n(?! *\\n)(?! *$))+$`),
			
			// This specific pattern is designed to match against a list only.
			// Translation: match newline w/ n spaces, as long as a proper list item follows.
			itemDelimiter: new RegExp(`${MARKER_REGEX.block.list.itemDelimiter.source} *(?=(?:\\d{1,9})?\\. (?! *${MARKER_REGEX.block.list.itemDelimiter.source}| *$))`),
		},
		horizontalRule: new RegExp(`^${MARKER_REGEX.block.horizontalRule.source}[^\\S\\n]*$`),
	},

	// Inline patterns are designed to match against text; tabs and spaces may count as text for now.
	inline: {
		alias: new RegExp(`${MARKER_REGEX.inline.alias[1].source}.+?${MARKER_REGEX.inline.alias[2].source}.+?${MARKER_REGEX.inline.alias[3].source}`),
		bold: new RegExp(`${MARKER_REGEX.inline.bold.source}.+?${MARKER_REGEX.inline.bold.source}`),
		italic: new RegExp(`${MARKER_REGEX.inline.italic.source}.+?${MARKER_REGEX.inline.italic.source}`),
		underlined: new RegExp(`${MARKER_REGEX.inline.underlined.source}.+?${MARKER_REGEX.inline.underlined.source}`),
		highlighted: new RegExp(`${MARKER_REGEX.inline.highlighted.source}.+?${MARKER_REGEX.inline.highlighted.source}`),
		strikethrough: new RegExp(`${MARKER_REGEX.inline.strikethrough.source}.+?${MARKER_REGEX.inline.strikethrough.source}`),
		code: new RegExp(`${MARKER_REGEX.inline.code[1].source}.+?${MARKER_REGEX.inline.code[2].source}`),

		autolink: /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, // added non-capturing group
	},

	hybrid: {
		engramLink: {
			block: new RegExp(
				`^${MARKER_REGEX.hybrid.engramLink.default.source}.+?${MARKER_REGEX.metadata.container[1].source}[^\\n]*?${MARKER_REGEX.metadata.container[2].source}$`
			),
			inline: new RegExp(
				`(?:${MARKER_REGEX.hybrid.engramLink.default.source}|${MARKER_REGEX.hybrid.engramLink.tag.source})[^#*\n]+?${MARKER_REGEX.metadata.container[1].source}.*?${MARKER_REGEX.metadata.container[2].source}`
			), // for the time being, [^#*\n] prevents detecting normal usage of * and #, which may actually be ok (if using files as storage, special characters need to be avoided anyway)
		},
		image: {
			block: new RegExp(
				`^${MARKER_REGEX.hybrid.image.source}[^\\s]+?${MARKER_REGEX.metadata.container[1].source}${MARKER_REGEX.metadata.container[2].source}$`
			),
			inline: new RegExp(
				`${MARKER_REGEX.hybrid.image.source}[^\\s]+?${MARKER_REGEX.metadata.container[1].source}${MARKER_REGEX.metadata.container[2].source}`
			),
		},
	},
	
	metadata: {
		block: new RegExp(
			`\\n${MARKER_REGEX.metadata.container[1].source}[\\S\\s]*${MARKER_REGEX.metadata.container[2].source}`
		),

		// This pattern is designed to match against engram link metadata.
		blockId: new RegExp(`${MARKER_REGEX.metadata.blockId.source}[A-Za-z0-9_-]{6}`), // https://github.com/ai/nanoid#api
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

module.exports = { MARKERS, MARKER_REGEX, RULES, escapeRegExp, getAllRules };
