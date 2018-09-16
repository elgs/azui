const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const srcDir = __dirname + '/src/';
const buildDir = __dirname + '/build/';
const distDir = __dirname + '/dist/';

const listModules = () => fs.readdirSync(srcDir).filter(item => fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod => fs.readdirSync(path.join(srcDir, mod)).filter(item => item.toLowerCase().endsWith('.html') && fs.statSync(path.join(srcDir, mod, item)).isFile());
const flattenDeep = arr => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
const pkgJson = require('./package.json');

const generateAll = () => {
    let content = '';
    listModules().filter(mod => mod !== 'all').map(mod => {
        content += `import '../${mod}/index.js';\n`;
    });
    fs.writeFileSync(srcDir + '/all/index.js', content, 'utf8');
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
    const htmls = mods.map(mod => {
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
                        presets: ['@babel/preset-env'],
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
            new webpack.HotModuleReplacementPlugin(),
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