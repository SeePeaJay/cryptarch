const PATTERNS = require('./constants')

class Lexer {
	constructor() {
		this.blocksAndBlockSeparators = [];
        // this.cursor = [0, 0];
		// this.tokenQueue = [];
		// this.ignoredPatterns = new Map();
    }

	splitToBlocksAndBlockSeparators(engram) {
		const rootBlocksAndRootBlockSeparators = engram.split(
			new RegExp(`(${PATTERNS.rootBlockSeparator.source})`, 'g') // parentheses to include delimiter in result
		);
		this.blocksAndBlockSeparators.push(...rootBlocksAndRootBlockSeparators);
	}
}

module.exports = Lexer;
