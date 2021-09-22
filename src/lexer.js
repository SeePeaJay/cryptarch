const PATTERNS = require('./constants')

class Lexer {
	constructor() {
		this.blocksAndBlockSeparators = [];
        // this.cursor = [0, 0];
		// this.tokenQueue = [];
		// this.ignoredPatterns = new Map();
    }

	scan(engram) {
		const trimmedEngram = engram.trim();
		const rootBlocks = trimmedEngram.split(PATTERNS.rootBlockSeparator);
		this.blocksAndBlockSeparators.push(...this.getBlocksAndBlockSeparators(rootBlocks));
		this.removeUnnecessaryWhitespaceInBlocks();
	}

	getBlocksAndBlockSeparators(rootBlocks) {
		let blocksAndBlockSeparators = [...rootBlocks];

		for(let i = 0; i < 2 * (rootBlocks.length - 1); i += 2) { // insert root block separators
			blocksAndBlockSeparators.splice(i + 1, 0, '\n\n');
		}

		const listPattern = new RegExp(`(${PATTERNS.unorderedList.source})|${PATTERNS.orderedList.source}`, 'g');
		for (let i = 0; i < blocksAndBlockSeparators.length; i += 2) { // insert list-related stuff
			if (blocksAndBlockSeparators[i].match(listPattern)) {
				blocksAndBlockSeparators.splice(
					i, 1, ...this.getListItemsAndListItemSeparators(blocksAndBlockSeparators[i])
				);
			}
		}
		
		return blocksAndBlockSeparators;
	}

	getListItemsAndListItemSeparators(list) { // should be able to clean up SAfterListItemSeparatorAndBeforeList
		const listItemsAndListItemSeparators = list.split(
			new RegExp(`(${PATTERNS.listItemSeparator.source})`, 'g') // parentheses to include delimiter in result
		); 

		let maxIndentLevel = 0;
		for (let i = 1; i < listItemsAndListItemSeparators.length; i += 2) {
			const tabCount = listItemsAndListItemSeparators[i].substring(1).length; // substring excludes \n
			if (tabCount > maxIndentLevel) {
				listItemsAndListItemSeparators[i] = `\n${'\t'.repeat(maxIndentLevel)}`;
				maxIndentLevel ++;
			} else if (tabCount == maxIndentLevel) {
				maxIndentLevel ++;
			} else {
				maxIndentLevel = tabCount + 1;
			}
		}

		return listItemsAndListItemSeparators;
	}

	removeUnnecessaryWhitespaceInBlocks() {
		for (let i = 0; i < this.blocksAndBlockSeparators.length; i += 2) {
			this.blocksAndBlockSeparators[i] = this.blocksAndBlockSeparators[i].trim().replace(/\t/g, '');
		}
	}
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
