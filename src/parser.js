const Lexer = require('./lexer')

class Parser {
	constructor() {
		this.lexer = new Lexer();
    }
}

module.exports = Parser;
