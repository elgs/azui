const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const docgen = require('./docgen.js');

const srcDir = path.join(__dirname, '/src/');
const buildDir = path.join(__dirname, '/build/');
const distDir = path.join(__dirname, '/dist/');

const listModules = (...excludes) => fs.readdirSync(srcDir).filter(item => !excludes.includes(item) && fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod => fs.readdirSync(path.join(srcDir, mod)).filter(item => item.toLowerCase().endsWith('.html') && fs.statSync(path.join(srcDir, mod, item)).isFile()).sort();
const flattenDeep = arr => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
const loadModule = mod => {
    const m = fs.readdirSync(path.join(srcDir, mod)).filter(item => item === 'module.json' && fs.statSync(path.join(srcDir, mod, item)).isFile());
    if (m && m.length === 1) {
        const moduleJson = m[0];
        const mj = fs.readFileSync(path.join(srcDir, mod, moduleJson), 'utf8');
        return JSON.parse(mj);
    }
    return null;
}
const pkgJson = require('./package.json');

const generateAll = () => {
    let jsContent = '';
    let cssContent = '';
    const moduleContent = {
        note: `This file 'modules.json' is auto generated by the build process. Any manual edit will be overridden.`,
        buildTime: new Date().toString(),
    };

    listModules().map(mod => {
        const m = loadModule(mod);
        if (m) {
            if (m.type < 4) {
                jsContent += `import '../${mod}/index.js';\n`;
                cssContent += `import '../${mod}/css.js';\n`;
            }

            const moduleData = {
                name: mod,
                ...m,
                pages: [],
            };
            listHtmls(mod).map(html => {
                moduleData.pages.push(html);
            });

            const moduleType = `modules${m.type}`;
            moduleContent[moduleType] = moduleContent[moduleType] || [];
            moduleContent[moduleType].push(moduleData);
        }
    });

    Object.keys(moduleContent).filter(m => m.startsWith('modules')).map(m => {
        moduleContent[m].sort((a, b) => a.seq - b.seq)
    });

    fs.writeFileSync(srcDir + '/all/index.js', jsContent, 'utf8');
    fs.writeFileSync(srcDir + '/all/css.js', cssContent, 'utf8');
    fs.writeFileSync(srcDir + '/index/modules.json', JSON.stringify(moduleContent, null, 2), 'utf8');
};

const generateDocs = (mods) => {
    let docContent = '';
    mods.map(mod => {
        const m = loadModule(mod);
        if (m && m.type > 0 && m.type < 4) {
            const classStr = fs.readFileSync(path.join(srcDir, mod, mod + '.js'), 'utf8');
            const docJson = docgen.parse(classStr);
            fs.writeFileSync(path.join(srcDir, mod, 'doc.json'), JSON.stringify(docJson, null, 2), 'utf8');

            docContent += `export {default as ${mod}Doc} from '../${mod}/doc.json';\n`;
        }
    });
    fs.writeFileSync(srcDir + '/docs/docimport.js', docContent, 'utf8');
};

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    const mods = argv._.length > 0 ? argv._ : listModules();
    argv._ = [];
    // console.log(mods);

    generateDocs(mods);
    generateAll();

    const entries = {};
    mods.map(mod => {
        entries[mod] = [`${srcDir+mod}/css.js`, `${srcDir+mod}/index.js`];
    });
    // console.log(entries);
    const htmls = mods.map(mod => {
        const tpls = listHtmls(mod);
        return tpls.map(tpl => {
            return new HtmlWebpackPlugin({
                filename: mod + '/' + tpl,
                template: `${srcDir+mod}/${tpl}`,
                inject: 'head',
                chunks: [mod]
            });
        });
    });
    // htmls.push(new HtmlWebpackPlugin({
    //     filename: 'index.html',
    //     template: srcDir + '/index.html',
    //     inject: false,
    // }));
    // console.log(flattenDeep(htmls));

    return ({
        entry: entries,
        output: {
            path: path.resolve(__dirname, isDev ? buildDir : distDir),
            filename: `[name]/${pkgJson.name}.[name].${pkgJson.version}${isDev?'':'.min'}.js`,
        },
        devtool: 'source-map',
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                // useBuiltIns: 'usage'
                            }, ]
                        ],
                        plugins: ["transform-class-properties",
                            ["babel-plugin-inline-import", {
                                "extensions": [
                                    ".tplhtml",
                                    ".md",
                                ]
                            }]
                        ]
                    }
                },
            }, {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?sourceMap",
                    "sass-loader?sourceMap"
                ]
            }]
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: `azUI ${pkgJson.version}
${pkgJson.homepage}
@author ${pkgJson.author}
${pkgJson.license} License
Copyright (c) ${new Date().getFullYear()} ${pkgJson.author}
                `,
            }),
            new CleanWebpackPlugin([(isDev ? buildDir : distDir) + '*']),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: `[name]/${pkgJson.name}.[name].${pkgJson.version}${isDev?'':'.min'}.css`,
                chunkFilename: `[name]/${pkgJson.name}.[id].${pkgJson.version}${isDev?'':'.min'}.css`,
            }),
            ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),
            ...flattenDeep(htmls),
        ],
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        },
        stats: {
            children: false
        },
        devServer: {
            disableHostCheck: true,
            contentBase: buildDir, //path.join(__dirname, isDev ? buildDir : distDir),
            historyApiFallback: {
                rewrites: [{
                    from: /./,
                    to: '/index/'
                }]
            },
            stats: {
                children: false,
            },
            compress: true,
            hot: true,
            host: '0.0.0.0',
            port: 1234
        }
    });
};