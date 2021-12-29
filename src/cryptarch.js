const Parser = require('./parser');
const Generator = require('./generator');

class Cryptarch {
	constructor() {
		this.parser = new Parser();
		this.generator = new Generator();
	}

	decrypt(engram) {
		const tree = this.parser.parse(engram);
		return this.generator.toHtml(tree);
	}
}

module.exports = Cryptarch;
