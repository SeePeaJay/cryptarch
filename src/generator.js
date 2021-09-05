const Lexer = require('./lexer');

class Generator {
	constructor() {
		this.lexer = new Lexer();
	}

	toHtml(engram) {
		return 'Hello World';
	}
}

module.exports = Generator;
