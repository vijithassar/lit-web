// test whether the line starts with backticks
const is_fence = line => line.slice(0, 3) === '```';

// test whether the line starts with backticks followed by a javascript language specifier
const is_javascript_fence = line => line.slice(0, 5) === '```js' || line.slice(0, 13) === '```javascript';

// count backtick fences to make sure they are balanced
const balanced_fences = code => code.split('```').length % 2 !== 0;

// extract JavaScript code blocks from a Markdown string
const compile = markdown => {
    // exit immediately if backticks aren't balanced
    if (! balanced_fences(markdown)) {
        return;
    }
    // split into lines
    const lines = markdown.split("\n");
    // count backticks
    let fence_count = 0;
    // comment out Markdown
    const code = lines
        .map(line => {
            const fence = is_fence(line);
            const javascript_fence = fence ? is_javascript_fence(line) : false;
            // increment the fence count if it's a valid
            // opening or closing fence
            if (javascript_fence || (fence && fence_count % 2 === 1)) {
                fence_count += 1;
            }
            // are we currently inside a code block
            // or a Markdown documentation passage?
            const is_markdown = fence_count % 2 === 0 || fence;
            if (is_markdown) {
                return "// " + line;
            } else {
                return line;
            }
        });
    // output a string representing a function body
    // to be created with the Function constructor
    const wrapped = "(() => {\n" + code.join("\n") + "\n})();";
    return wrapped;
};


const load = () => {
    document.addEventListener('DOMContentLoaded', () => {
        // select all literate scripts in the DOM
        const literate_scripts = Array.from(document.querySelectorAll('script[type="text/markdown"], script[type="text/literate-javascript"]'));
        // fetch the content for each literate script
        const script_contents = literate_scripts
            .map(script => {
                const url = script.getAttribute('src');
                if (url) {
                    const promise = new Promise((resolve, reject) => {
                        fetch(url)
                            .then(response => {
                                resolve(response.text());
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                    return promise;
                } else {
                    return null;
                }
            });
        // wait until all literate scripts have loaded
        Promise.all(script_contents).then(results => {
            // execute all literate scripts in order
            results.forEach((markdown, index) => {
                // compile script content
                const code = compile(markdown);
                // point sourcemap to Markdown document
                const source_url = literate_scripts[index].src;
                // execute code blocks
                const wrapper = new Function(code + '//# sourceURL=' + source_url);
                wrapper();
            });
        });
    });
};

load();