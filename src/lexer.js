const PATTERNS = require('./constants')

class Lexer {
	constructor() {
		this.blocksAndBlockSeparators = [];
        // this.cursor = [0, 0];
		// this.tokenQueue = [];
		// this.ignoredPatterns = new Map();
    }

	scan(engram) { // splitToBlocksAndBlockSeparators
		const trimmedEngram = engram.trim();
		const rootBlocks = trimmedEngram.split(PATTERNS.rootBlockSeparator); // is capturing group fine now?
		this.blocksAndBlockSeparators.push(...this.getBlocksAndBlockSeparators(rootBlocks));
		// splitListsToListItemsAndListItemSeparators
		// this.blocksAndBlockSeparators = getBlocksAndBlockSeparators(rootBlocks);
		// removeUnecessaryWhitespaceFromBlock(blocksAndSeparators)??
	}

	getBlocksAndBlockSeparators(rootBlocks) {
		let blocksAndBlockSeparators = [...rootBlocks];

		for(let i = 0; i < 2 * (rootBlocks.length - 1); i += 2) { // insert root block separators
			blocksAndBlockSeparators.splice(i + 1, 0, '\n\n');
		}

		const listPattern = new RegExp(`(${PATTERNS.unorderedList.source})|${PATTERNS.orderedList.source}`, 'g');
		for (let i = 0; i < blocksAndBlockSeparators.length; i += 2) {
			if (blocksAndBlockSeparators[i].match(listPattern)) {
				// console.log(blocksAndBlockSeparators[i]);
				blocksAndBlockSeparators.splice(i, 1, ...this.getListItemsAndListItemSeparators(list));
			}
		}
		
		return blocksAndBlockSeparators;
	}

	getListItemsAndListItemSeparators(list) { // should be able to clean up SAfterListItemSeparatorAndBeforeList
		// maxIndentLevel = 1;
		// const listItemsAndListItemSeparators = list.split();
		// for each list item separator (skip by 2 again)
			// get number of \t
			// if number of \t > maxIndentLevel
				// trim
				// maxIndentLevel ++;
			// else if number of \t = maxIndentLevel
				// maxIndentLevel ++;
			// else \t < maxIndentLevel
				// maxIndentLevel = number of \ts + 1
		return [];
	}

	// scan(engram) {
	//  remove unnecessary whitespace at the beginning and end; truncate engram
	// 	rootBlocks -> maybe at this point get \n\n already, split then insert?
	//  blocksAndBlockSeparators -> spread operator stuff
	// 	remove whitespace from blocks
	//	// for each blocksAndSeparators
	// 	// remove tabs in evens and odds
	// 	// for list items, check with counter
	// }
}

module.exports = Lexer;
