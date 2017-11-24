(() => {
    'use strict';
    // test whether a chunk of code specifies javascript as the language
    const language_regex = /^(js|javascript)\s*\n/;
    const backticks_regex = /^```/gm
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
                if (even || backticks) {
                    output = "\n// " + line;
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