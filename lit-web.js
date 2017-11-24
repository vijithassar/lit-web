(() => {
    'use strict';
    const regex = /^(js|javascript)\s*\n/;
    // test whether a chunk of code specifies javascript as the language
    const is_javascript = chunk => regex.test(chunk);
    // count backtick fences to make sure they are balanced
    const even_backticks = code => code.split('```').length % 2 !== 0;
    // extract JavaScript code blocks from a Markdown string
    const compile = (markdown) => {
        // bail if backticks aren't balanced
        if (! even_backticks(markdown)) {
            return;
        }
        // split along backtick fences
        const chunks = markdown.split(/^```/gm);
        // filter down to only code blocks
        const code = chunks
            .map((chunk, i) => {
                const odd = i % 2;
                if (odd && is_javascript(chunk)) {
                    return chunk.replace(/^.+/, '');
                } else {
                    return chunk.replace(/^.+$/gm, '');
                }
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
                const wrapper = Reflect.construct(Function, [code]);
                wrapper();
            }
        });
    });
})();