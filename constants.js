function getMappedObject(obj, func) { // https://stackoverflow.com/a/38829074
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => 
      [k, v === Object(v) ? getMappedObject(v, func) : func(v)]
    )
  );
  // TODO: do sth about ordered list regex if it's needed in the future?
}

const MARKERS = {
  block: {
    title: '* ',
    level1Subtitle: '*_1 ',// https://www.quora.com/What-is-the-difference-between-Title-and-Heading-1-styles-in-a-word-processor
    level2Subtitle: '*_2 ',
    level3Subtitle: '*_3 ',
    unorderedList: '. ',
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
    blockId: '::',
  },

  delimiter: {
    rootBlock: '\n\n',
    containerItem: '\n', // item - an item within a list, or more generally a block within a root/container block, or metadata within a block
  }
};

// In case a marker is needed in its regex form.
const mappedObject = getMappedObject(MARKERS, (x) => new RegExp(escapeRegExp(x)));
mappedObject.block.orderedList = /\d{1,9}\. /; // TODO: only include the dot or equivalent in the future; the number should remain the same
const MARKERS_IN_REGEX = mappedObject;

// Checks if a given (part of an) engram is one of the following elements.
const RULES = {
  // Block patterns are designed to match against a block.
  // As of this writing, tabs should not count as indent, so they are excluded from the patterns for now.
  block: {
    title: new RegExp(`^${MARKERS_IN_REGEX.block.title.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    level1Subtitle: new RegExp(`^${MARKERS_IN_REGEX.block.level1Subtitle.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    level2Subtitle: new RegExp(`^${MARKERS_IN_REGEX.block.level2Subtitle.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    level3Subtitle: new RegExp(`^${MARKERS_IN_REGEX.block.level3Subtitle.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    unorderedList: new RegExp(`^${MARKERS_IN_REGEX.block.unorderedList.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    orderedList: new RegExp(`^${MARKERS_IN_REGEX.block.orderedList.source}(?:.|\\n(?! *\\n)(?! *$))+$`),
    horizontalRule: new RegExp(`^${MARKERS_IN_REGEX.block.horizontalRule.source}[^\\S\\n]*$`),
  },

  // Inline patterns are designed to match against text; tabs and spaces may count as text for now.
  inline: {
    alias: new RegExp(`${MARKERS_IN_REGEX.inline.alias[1].source}.+?${MARKERS_IN_REGEX.inline.alias[2].source}.+?${MARKERS_IN_REGEX.inline.alias[3].source}`),
    bold: new RegExp(`${MARKERS_IN_REGEX.inline.bold.source}.+?${MARKERS_IN_REGEX.inline.bold.source}`),
    italic: new RegExp(`${MARKERS_IN_REGEX.inline.italic.source}.+?${MARKERS_IN_REGEX.inline.italic.source}`),
    underlined: new RegExp(`${MARKERS_IN_REGEX.inline.underlined.source}.+?${MARKERS_IN_REGEX.inline.underlined.source}`),
    highlighted: new RegExp(`${MARKERS_IN_REGEX.inline.highlighted.source}.+?${MARKERS_IN_REGEX.inline.highlighted.source}`),
    strikethrough: new RegExp(`${MARKERS_IN_REGEX.inline.strikethrough.source}.+?${MARKERS_IN_REGEX.inline.strikethrough.source}`),
    code: new RegExp(`${MARKERS_IN_REGEX.inline.code[1].source}.+?${MARKERS_IN_REGEX.inline.code[2].source}`),

    autolink: /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, // added non-capturing group
  },

  hybrid: { // use the likes of [^]* instead of .*? as otherwise `*Testing:a{} and *Testing:b{}` is considered a block link: https://stackoverflow.com/a/2503441
    engramLink: {
      block: new RegExp(
        `^${MARKERS_IN_REGEX.hybrid.engramLink.default.source}[^${MARKERS_IN_REGEX.metadata.container[1].source}]+${MARKERS_IN_REGEX.metadata.container[1].source}[^${MARKERS_IN_REGEX.metadata.container[2].source}\\n]*${MARKERS_IN_REGEX.metadata.container[2].source}$`
      ), // TODO: should block version also restrict * and # in title?
      inline: new RegExp(
        `(?:${MARKERS_IN_REGEX.hybrid.engramLink.default.source}|${MARKERS_IN_REGEX.hybrid.engramLink.tag.source})[^${MARKERS_IN_REGEX.metadata.container[1].source}#*\\n]+${MARKERS_IN_REGEX.metadata.container[1].source}[^${MARKERS_IN_REGEX.metadata.container[2].source}\\n]*${MARKERS_IN_REGEX.metadata.container[2].source}`
      ), // for the time being, [^#*\n] prevents detecting normal usage of * and #, which may actually be ok (if using files as storage, special characters need to be avoided anyway)
    },
    image: {
      block: new RegExp(
        `^${MARKERS_IN_REGEX.hybrid.image.source}[^${MARKERS_IN_REGEX.metadata.container[1].source}\\s]+${MARKERS_IN_REGEX.metadata.container[1].source}${MARKERS_IN_REGEX.metadata.container[2].source}$`
      ),
      inline: new RegExp(
        `${MARKERS_IN_REGEX.hybrid.image.source}[^${MARKERS_IN_REGEX.metadata.container[1].source}\\s]+${MARKERS_IN_REGEX.metadata.container[1].source}${MARKERS_IN_REGEX.metadata.container[2].source}`
      ),
    },
  },
  
  metadata: {
    block: new RegExp(
      `\\n${MARKERS_IN_REGEX.metadata.container[1].source}[\\S\\s]*${MARKERS_IN_REGEX.metadata.container[2].source}`
    ),

    // This pattern is designed to match against engram link metadata.
    blockId: new RegExp(`${MARKERS_IN_REGEX.metadata.blockId.source}[A-Za-z0-9_-]{6}(?=\\s|$)`), // https://github.com/ai/nanoid#api
  },

  delimiter: {
    rootBlock: new RegExp(`${escapeRegExp(MARKERS.delimiter.rootBlock[0])}(?: |\\t)*${escapeRegExp(MARKERS.delimiter.rootBlock[1])}`), // This pattern is designed to match against the whole engram.

    // This specific pattern is designed to match against a list only.
    // Translation: match newline w/ n spaces, as long as a proper list item follows.
    listItem: new RegExp(`${MARKERS_IN_REGEX.delimiter.containerItem.source} *(?=(?:\\d{1,9})?\\. (?! *${MARKERS_IN_REGEX.delimiter.containerItem.source}| *$))`),
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
      RULES.block.level1Subtitle, // 2
      RULES.block.level2Subtitle, // 3
      RULES.block.level3Subtitle, // 4
      RULES.block.unorderedList, // 5
      RULES.block.orderedList, // 6
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

module.exports = { MARKERS, MARKERS_IN_REGEX, RULES, escapeRegExp, getAllRules };
