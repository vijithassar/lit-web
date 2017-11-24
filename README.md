# Overview

`lit-web` is a simple HTTP loader for Markdown documents which lets web browsers extract and run JavaScript code from code blocks embedded in Markdown files, which in turn promotes good written documentation. This technique is called [literate programming](https://en.wikipedia.org/wiki/Literate_programming). `lit-web` strives to provide the *lowest possible barrier to entry* for literate programming – just include this tiny 4 kilobyte script tag on the page and you can start literate programming for the web using JavaScript.

For a more detailed discussion about why you might want to do this, or to implement with other programming languages or without the occasional compromises made by `lit-web` in pursuit of ease of use, please instead see [lit](https://github.com/vijithassar/lit), a more powerful shell script which provides the same functionality in a more agnostic fashion.

# Instructions

## Loading as `<script>` tag

Simply load both `lit-web` and a Markdown document containing literate programming on the page using `<script>` tags. The JavaScript code blocks from your Markdown document will execute. The Markdown portions will be commented out on the fly so that debugging tools will point to the correct line number with documentation intact.

For example, a Markdown document:

~~~markdown
# this is a markdown file!

It can have *all the usual markdown stuff*, but only the JavaScript code blocks will run:

```javascript
// log a message
console.log('hello world');
```
~~~

Some HTML to serve it:

```html
<html>
    <head>
        <script type="text/javascript" src="//path/to/lit-web.js"></script>
        <script type="text/markdown" src="//path/to/script.js.md"></script>
    </head>
    <body>
    </body>
</html>
```

`lit-web.js` will load the Markdown document, transpile it into the following JavaScript on the fly, and then execute the result:

```javascript
// # this is a markdown file!
//
// It can have *all the usual markdown stuff*, but only the JavaScript code blocks will run:
//
// ```javascript
// log a message
console.log('hello world');
// ```
```

You *must* include `js` or `javascript` as a language specifier after opening up a fenced code block. Fenced code blocks that specify any other language and fenced code blocks that do not specify a language at all will be ignored. This makes it possible for you to include other code in your Markdown file without that code being executed. This is particularly useful for including Bash commands.

The `type` attribute for your literate JavaScript script tag must be `text/markdown` so that `lit-web` can identify which scripts are loading Markdown documents that it should process and execute. Alternatively, you can use `text/literate-javascript`, which may be useful if elsewhere you are also loading Markdown URLs for reasons other than code execution. However, the `type` attribute for `lit-web.js` must instead be boring old `text/javascript`, because before it is loaded there is no way to parse literate scripts. 

## Loading as ES Module

Loading as a script tag is easiest, but for more stable application builds which allow dynamic execution of arbitrary Markdown you can also `import` the module. (If you don't need your application to execute *arbitrary* Markdown on the fly, you're probably better off with a build-oriented tool such as [lit](https://github.com/vijithassar/lit) or the [Markdown importer](https://www.npmjs.com/package/rollup-plugin-markdown) for [Rollup](https://rollupjs.org).)

```javascript
// import ES module during a build proecess
import 'lit-web';
```

In order to `import` directly into a live web app over remote HTTP, you must specify the file's location and extension rather than relying on the Node.js module path resolution logic.

```javascript
// import ES module remotely over HTTP
import '//path/to/lit-web.js';
```

# Caveats

- A small performance penalty is incurred both by parsing your code blocks client side and by sending the extra Markdown text content over HTTP. This should be negligible in most cases. For better performance, use one of the alternative tools listed below and optimize your application build.
- It's especially important that your literate programming scripts use [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) internally in order to cleanly avoid scope conflicts, but of course you should already be using that anyway.
- Exact line numbers reported by debugging tools may be off be a line or two relative to the original Markdown document because of the function wrapper that's added to improve scope safety.
- Only one layer of in-browser Markdown parsing is supported, so you can't use this tool to load Markdown documents with ES6 `import` statements (as you can with [`lit-node`](https://github.com/Rich-Harris/lit-node), for example). To `import` additional literate code files into your project, set up a build process that incorporates one of the alternative tools listed below.
- Code blocks are loaded using the [Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function), which is sort of like a somewhat safer version of [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) and is subject to some of the same concerns. Any possible security issues will simply depend on how safe your Markdown files are, which is roughly the same as it would be if you were loading regular JavaScript files.

# Other Tools

- [lit](https://github.com/vijithassar/lit) is a general-purpose source code preprocessing tool which allows you to code in a literate style in any language, and also load and interpret your Markdown documents directly
- [lit-node](https://github.com/Rich-Harris/lit-node) is a wrapper for Node.js which lets Node interpret Markdown files, import modules declared inside Markdown files using `require()`, and also provides a REPL
- [rollup-plugin-markdown](https://www.npmjs.com/package/rollup-plugin-markdown) implements similar source code processing logic, but it provides more precise sourcemaps, integrates with a [popular build tool](https://rollupjs.org), and is [available via npm](https://www.npmjs.com/package/rollup-plugin-markdown)
- [Blaze](https://github.com/0atman/blaze) is a clever literate programming tool which optimizes for *execution* instead of *building*, allowing you to send Markdown files directly into any language of your choosing without any intermediate steps
- [Docco](http://ashkenas.com/docco/) and its many variants render literate source code into beautiful browsable HTML
- [CoffeeScript](http://coffeescript.org) and [Haskell](https://www.haskell.org/) support literate programming natively and do not need any additional tooling!