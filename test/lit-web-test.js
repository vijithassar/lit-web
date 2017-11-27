import { compile } from '../source/compile.js';
import * as assert from 'assert';

describe('lit-web', () => {
    it('parses Markdown', () => {
        const markdown = "# Heading\ndescription\n```js\nconsole.log('hello world');\n```\ndescription"
        const expected = "(() => {\n// # Heading\n// description\n// ```js\nconsole.log('hello world');\n// ```\n// description\n})();"
        assert.equal(compile(markdown), expected);
    });
});