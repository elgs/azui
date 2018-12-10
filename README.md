# azui
A set of more desktop/mobile/touchscreen friendly web UI components.

## Examples
http://az.ht/ui/build/curr/  

## Run locally
`git clone https://github.com/elgs/azui`  
`cd azui`  
`npm install`  
`npm run start {component_name0}, {component_name1}, ...`  

For example:  

`npm run start window`  
will start the `window` component. You can access it from  
`http://localhost:1234/window.html`

`npm run start window tabs datatable`  
will start the `window`, `tabs` and `datatable` components. You can access them from  
`http://localhost:1234/window.html`  
`http://localhost:1234/tabs.html`  
`http://localhost:1234/datatable.html`  
respectively.

## Build locally
`git clone https://github.com/elgs/azui`  
`cd azui`  
`npm install`  
`npm run build` or `npm run dist`  
will create `build/` or `dist/` which contain debug or release/minified js/css files.

## npm install
`npm install azui`  

These two lines of code are what you want to put in your html file:  
`<link rel="stylesheet" type="text/css" href="./node_modules/azui/dist/azui.all.0.0.8.css">`  
`<script src="./node_modules/azui/dist/azui.all.0.0.8.js"></script>`

## Quick start
```html
<html>
<head>
    <style>
        html,
        body {
            overflow: hidden;
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
        }
    </style>

    <link href="./node_modules/azui/dist/azui.all.0.0.8.css" rel="stylesheet">
    <script src="./node_modules/azui/dist/azui.all.0.0.8.js"></script>
</head>
<body>
    <div id='win0'></div>
    <div id='win1'></div>

    <script>
        azui.Window('#win0', {
            width: 400,
            height: 300,
            title: 'Win 0',
        });

        azui.Window('#win1', {
            width: 400,
            height: 300,
            title: 'Win 1',
        });
    </script>
</body>
</html>
```
You can try to:  
* drag the window around
* drag the edges to resize the window
* drag to reorder the items in the docker bar
* right click on the window header for a menu
* right click on the items in the docker bar for the same menu
* double click on the window header to maximize/restore the window
* try it on your computers, phones and tablets
* try it on Chrome, Firefox, Safari and Edge
* try it on Linux, Mac and Windows

## Global footprint
In this library, everything in Javascript is under `window.azui`, and in CSS, under `.azui`.

## A few more words
I have been working on this project in the past few months. Now I am excited to publish my work for the first public preview. Everything is likely to change incompatibly until version 1.0.0. API docs are not done yet. You will need to look at those html files in the src directory for examples. I'm sorry for that, but this will be worked on soon. Please feel free to open issues and pull requests.

## License
MIT License

Copyright (c) 2018 Elgs Qian Chen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.