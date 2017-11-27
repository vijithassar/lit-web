import { compile } from '../source/compile.js';
import * as assert from 'assert';

const wrapper = fnstring => '(() => {\n' + fnstring + '\n})();';

describe('parser', () => {
    it('parses Markdown', () => {
        const markdown = "# Heading\ndescription\n```js\nconsole.log('hello world');\n```\ndescription";
        const expected = "// # Heading\n// description\n// ```js\nconsole.log('hello world');\n// ```\n// description";
        assert.equal(compile(markdown), wrapper(expected));
    });
    it('ignores inputs with unbalanced fences', () => {
        const markdown = "# Heading\ndescription\n```js\nconsole.log('hello world');";
        assert.equal(typeof compile(markdown), 'undefined');
    });
    it('compiles js code blocks', () => {
        const markdown = "```js\nconsole.log('hello world');\n```";
        const expected = "// ```js\nconsole.log('hello world');\n// ```";
        assert.equal(compile(markdown), wrapper(expected));
    });
    it('compiles javascript code blocks', () => {
        const markdown = "```javascript\nconsole.log('hello world');\n```";
        const expected = "// ```javascript\nconsole.log('hello world');\n// ```";
        assert.equal(compile(markdown), wrapper(expected));
    });
    it('ignores code blocks with other languages', () => {
        const markdown = "```sh\nconsole.log('hello world');\n```";
        const expected = "// ```sh\n// console.log('hello world');\n// ```";
        assert.equal(compile(markdown), wrapper(expected));
    });
    it('ignores code blocks with unspecified language', () => {
        const markdown = "```\nconsole.log('hello world');\n```";
        const expected = "// ```\n// console.log('hello world');\n// ```";
        assert.equal(compile(markdown), wrapper(expected));
    });
});