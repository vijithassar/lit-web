import { compile } from './compile.js';

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