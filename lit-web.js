(() => {
    'use strict';
    // test whether the line starts with backticks
    const is_backticks = line => line.slice(0, 3) === '```';
    // test whether the line starts with javascript language specifier after the backticks
    const is_javascript = line => line.slice(0, 5) === '```js' || line.slice(0, 13) === '```javascript';
    // count backtick fences to make sure they are balanced
    const even_backticks = code => code.split('```').length % 2 !== 0;
    // extract JavaScript code blocks from a Markdown string
    const compile = (markdown) => {
        // bail if backticks aren't balanced
        if (! even_backticks(markdown)) {
            return;
        }
        const lines = markdown.split("\n")
        // split along backtick fences
        let chunks = 0
        // filter down to only code blocks
        const code = lines
            .map((line, i) => {
                const backticks = backticks_regex.test(line);
                if (backticks) {
                    chunks += 1
                }
                const even = chunks % 2 === 0;
                let output;
                const is_markdown = even || backticks;
                if (is_markdown) {
                    const line_break = i === 0 ? '' : "\n"
                    output = line_break + "// " + line;
                } else {
                    output = "\n" + line;
                }
                if (backticks && chunks % 2 === 0) {
                    output += "\n"    
                }
                return output;
            });
        // output a string representing an async function
        const wrapped = '(async () => {' + code.join('') + '})();';
        return wrapped;
    };
    document.addEventListener('DOMContentLoaded', () => {
        // select all literate scripts in the DOM
        const literate_scripts = Array.from(document.querySelectorAll('script[type="text/literate-javascript"]'));
        // compile and execute literate scripts
        literate_scripts.forEach(async function(script) {
            const url = script.getAttribute('src');
            if (url) {
                // fetch script content
                const markdown = await fetch(url).then(response => response.text());
                // compile script content
                const code = compile(markdown);
                // execute code blocks
                const wrapper = new Function(code + '//@ sourceURL=' + script.src);
                wrapper();
            }
        });
    });
})();