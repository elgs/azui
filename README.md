# azui
A set of more desktop/mobile/touchscreen friendly web UI components.

## Examples
http://az.ht/ui/build/0.0.7/  
for versioned releases, or  
http://az.ht/ui/build/curr/  
for the most recently commits.

## Run locally
`git clone https://github.com/elgs/azui`  
`cd azui`  
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
`npm run build` or `npm run dist`  
will create `build/` or `dist/` which contain debug or release/minified js/css files.

## npm install
`npm install azui`  

These two lines of code are what you want to put in your html file:  
`<link rel="stylesheet" type="text/css" href="./node_modules/azui/dist/azui.all.0.0.7.css">`  
`<script src="./node_modules/azui/dist/azui.all.0.0.7.js"></script>`

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

    <link href="./node_modules/azui/dist/azui.all.0.0.7.css" rel="stylesheet" type="text/css">
    <script src="./node_modules/azui/dist/azui.all.0.0.7.js"></script>
</head>

<body>
    <div id='myWindow0'></div>
    <div id='myWindow1'></div>

    <script>
        azui.Window('#myWindow0', {
            width: 400,
            height: 300,
            title: 'Win 0',
        });

        azui.Window('#myWindow1', {
            width: 400,
            height: 300,
            title: 'Win 1',
        });
    </script>
</body>

</html>
```