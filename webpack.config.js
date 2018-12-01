const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const srcDir = path.join(__dirname, '/src/');
const buildDir = path.join(__dirname, '/build/');
const distDir = path.join(__dirname, '/dist/');

const listModules = (...excludes) => fs.readdirSync(srcDir).filter(item => !excludes.includes(item) && fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod => fs.readdirSync(path.join(srcDir, mod)).filter(item => item.toLowerCase().endsWith('.html') && fs.statSync(path.join(srcDir, mod, item)).isFile());
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

const excludes = ['utilities'];

const generateAll = () => {
    let jsContent = '';
    const moduleContent = {
        buildTime: new Date().toString(),
        modules: {},
    };

    listModules().map(mod => {
        const m = loadModule(mod);
        if (m.type < 4) {
            jsContent += `import '../${mod}/index.js';\n`;
        }

        const moduleData = {
            ...m,
            pages: [],
        };
        listHtmls(mod).map(html => {
            moduleData.pages.push(html);
        });
        moduleContent.modules[mod] = moduleData;
    });
    fs.writeFileSync(srcDir + '/all/index.js', jsContent, 'utf8');
    fs.writeFileSync(srcDir + '/index/modules.json', JSON.stringify(moduleContent, null, 2), 'utf8');
};

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    generateAll();

    const mods = argv._.length > 0 ? argv._ : listModules();
    argv._ = [];
    // console.log(mods);

    const entries = {};
    mods.map(mod => {
        entries[mod] = `${srcDir+mod}/index.js`;
    });
    // console.log(entries);
    const htmls = mods.filter(mod => {
        return !excludes.includes(mod);
    }).map(mod => {
        const tpls = listHtmls(mod);
        return tpls.map(tpl => {
            return new HtmlWebpackPlugin({
                filename: tpl,
                template: `${srcDir+mod}/${tpl}`,
                inject: 'head',
                chunks: [mod]
            });
        });
    });
    // console.log(flattenDeep(htmls));

    return ({
        entry: entries,
        output: {
            path: path.resolve(__dirname, isDev ? buildDir : distDir),
            filename: `${pkgJson.name}.[name].${pkgJson.version}.js`,
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
                                useBuiltIns: 'usage'
                            }, ]
                        ],
                        plugins: ["transform-class-properties"]
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
            new CleanWebpackPlugin([(isDev ? buildDir : distDir) + '*']),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: `${pkgJson.name}.[name].${pkgJson.version}.css`,
                chunkFilename: `${pkgJson.name}.[id].${pkgJson.version}.css`,
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
            contentBase: path.join(__dirname, isDev ? buildDir : distDir),
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