const Generator = require('./generator');

class Cryptarch {
	constructor() {
		this.generator = new Generator();
	}

	decrypt(engram) {
		return this.generator.toHtml(engram);
	}
}

module.exports = Cryptarch;
