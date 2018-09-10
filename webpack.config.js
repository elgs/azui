const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const srcDir = './src/';
const buildDir = './build/';
const distDir = './dist/';

const listModules = () => fs.readdirSync(srcDir).filter(item => fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod => fs.readdirSync(path.join(srcDir, mod)).filter(item => item.toLowerCase().endsWith('.html') && fs.statSync(path.join(srcDir, mod, item)).isFile());
const flattenDeep = arr => {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

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
            filename: 'azui.[name].js',
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
                    // fallback to style-loader in development
                    MiniCssExtractPlugin.loader,
                    "css-loader" + (isDev ? '?sourceMap' : ''),
                    "sass-loader" + (isDev ? '?sourceMap' : '')
                ]
            }]
        },
        plugins: [
            new CleanWebpackPlugin([(isDev ? buildDir : distDir) + '*']),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "azui.[name].css",
                chunkFilename: "azui.[id].css"
            }),
            new webpack.HotModuleReplacementPlugin(),
            ...flattenDeep(htmls),
        ],
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, isDev ? buildDir : distDir),
            compress: true,
            hot: true,
            host: '0.0.0.0',
            port: 1234
        }
    })
};