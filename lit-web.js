(() => {
    'use strict';
    // test whether the line starts with backticks
    const is_backticks = line => line.slice(0, 3) === '```';
    // test whether the line starts with javascript language specifier after the backticks
    const is_javascript = line => line.slice(0, 5) === '```js' || line.slice(0, 13) === '```javascript';
    // count backtick fences to make sure they are balanced
    const balanced_backticks = code => code.split('```').length % 2 !== 0;
    // extract JavaScript code blocks from a Markdown string
    const compile = (markdown) => {
        // bail if backticks aren't balanced
        if (! balanced_backticks(markdown)) {
            return;
        }
        // split into lines
        const lines = markdown.split("\n");
        // count backticks
        let chunks = 0;
        // comment out Markdown
        const code = lines
            .map(line => {
                const backticks = is_backticks(line);
                if (backticks) {
                    chunks += 1;
                }
                const even = chunks % 2 === 0;
                const is_markdown = even || backticks;
                if (is_markdown) {
                    return "// " + line;
                } else {
                    return line;
                }
            });
        // output a string representing an async function
        const wrapped = "(() => {\n" + code.join("\n") + "\n})();";
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
                const wrapper = new Function(code + '//# sourceURL=' + script.src);
                wrapper();
            }
        });
    });
})();