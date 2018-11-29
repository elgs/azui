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