const { parse } = require('./parser');

describe('Block Element Tests', () => {
	test('Title', () => {
		expect(parse('* Title')).toBe('<h1>Title</h1>');
	});
	
	test('Level 1 Subtitle', () => {
		expect(parse('*_1 Level 1 Subtitle')).toBe('<h2>Level 1 Subtitle</h2>');
	});
	
	test('Level 2 Subtitle', () => {
		expect(parse('*_2 Level 2 Subtitle')).toBe('<h3>Level 2 Subtitle</h3>');
	});
	
	test('Level 3 Subtitle', () => {
		expect(parse('*_3 Level 3 Subtitle')).toBe('<h4>Level 3 Subtitle</h4>');
	});
	
	test('Unordered List', () => {
		expect(parse('. Unordered list item a\n. Unordered list item b\n. Unordered list item c')).toBe('<ul><li>Unordered list item a</li><li>Unordered list item b</li><li>Unordered list item c</li></ul>');
	});
	
	test('Ordered List', () => {
		expect(parse('1. Ordered list item 1\n2. Ordered list item 2\n3. Ordered list item 3')).toBe('<ol><li>Ordered list item 1</li><li>Ordered list item 2</li><li>Ordered list item 3</li></ol>');
	});

	test('List with Nested Items', () => {
		expect(parse('. doggo\n . doggo')).toBe('<ul><li>doggo<ul><li>doggo</li></ul></li></ul>');
	});

	test('List with Ugly Delimiters', () => {
		expect(parse('. Unordered list item a\n     . Unordered list item b\n            . Unordered list item c')).toBe('<ul><li>Unordered list item a<ul><li>Unordered list item b<ul><li>Unordered list item c</li></ul></li></ul></li></ul>');
	});
	
	test('Horizontal Rule', () => {
		expect(parse('---')).toBe('<hr>');
	});
	
	test('Paragraph', () => {
		expect(parse('A paragraph.')).toBe('<p>A paragraph.</p>');
	});	
});

describe('Inline Element Tests', () => {
	test('Engram Link with Block Id', () => {
		expect(parse('*doggo{::48gh29}')).toBe('<p><engram-link to="doggo::48gh29">doggo::48gh29</engram-link></p>');
	});
	
	test('Engram Link with Block Id and Other Metadata', () => {
		expect(parse('*doggo{asdf, crabby doog ::48gh29}')).toBe('<p><engram-link to="doggo::48gh29">doggo::48gh29</engram-link></p>');
	});

	test('Tag', () => {
		expect(parse('A paragraph with a tag: #test1{}.')).toBe('<p>A paragraph with a tag: <engram-link to="test1" isTag>test1</engram-link>.</p>');
	});

	test('Block Image', () => {
		expect(parse('$http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}')).toBe('<p><img src="http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513"></p>');
	});

	test('Inline Image', () => {
		expect(parse('A paragraph with an inline image: $http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}.')).toBe('<p>A paragraph with an inline image: <img src="http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513">.</p>');
	});
});

describe('Inline Element Tests', () => {
	test('External Links', () => {
		expect(parse('A paragraph with two types of links: autolink ( www.google.com ), and __link alias__(www.google.com).')).toBe('<p>A paragraph with two types of links: autolink ( <a href="//www.google.com" target="_blank">www.google.com</a> ), and <a href="//www.google.com" target="_blank">link alias</a>.</p>');
	});
	
	test('Consecutive Inline Styles', () => {
		expect(parse('A paragraph with @@bold@@, //italic//, __underlined__, ==highlighted==, and --strikethrough-- text.')).toBe('<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <mark>highlighted</mark>, and <del>strikethrough</del> text.</p>');
	});

	test('Nested Inline Styles', () => {
		expect(parse('A paragraph with nested styles: @@bold, //italic, __underlined, ==highlighted, and --strikethrough--==__//@@ text.')).toBe('<p>A paragraph with nested styles: <strong>bold, <em>italic, <u>underlined, <mark>highlighted, and <del>strikethrough</del></mark></u></em></strong> text.</p>');
	});

	test('Inline Code', () => {
		expect(parse('A paragraph with inline code: </console.log(\'hello world!\')>.')).toBe('<p>A paragraph with inline code: <code>console.log(\'hello world!\')</code>.</p>');
	});
});

test('Multiple Blocks', () => {
	expect(parse('Paragraph A\n\nParagraph B\n\nParagraph C')).toBe('<p>Paragraph A</p><p>Paragraph B</p><p>Paragraph C</p>');
});

