const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const srcDir = path.join(__dirname, '/src/');
const buildDir = path.join(__dirname, '/build/');
const distDir = path.join(__dirname, '/dist/');

const listModules = () => fs.readdirSync(srcDir).filter(item => !item.startsWith('_') && fs.statSync(path.join(srcDir, item)).isDirectory());
const listHtmls = mod =>
  fs.readdirSync(path.join(srcDir, mod)).filter(
    item =>
      item.toLowerCase().endsWith('.html') &&
      !item.toLowerCase().endsWith('.tpl.thml') &&
      fs.statSync(path.join(srcDir, mod, item)).isFile()
  )
    .sort();
const flattenDeep = arr => arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)), []);

const pkgJson = require('./package.json');

const generateAll = () => {
  let jsContent = '';
  let cssContent = '';

  listModules().map(mod => {
    jsContent += `import '../${mod}/index.js';\n`;
    cssContent += `import '../${mod}/index.css.js';\n`;
  });

  fs.writeFileSync(srcDir + '/all/index.js', jsContent, 'utf8');
  fs.writeFileSync(srcDir + '/all/index.css.js', cssContent, 'utf8');
};

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  const mods = argv._.length > 0 ? argv._ : listModules();
  argv._ = [];
  // console.log(mods);

  generateAll();

  const entries = {};
  mods.map(mod => {
    entries[mod] = [`${srcDir + mod}/index.css.js`, `${srcDir + mod}/index.js`];
  });
  // console.log(entries);
  const htmls = mods.map(mod => {
    const tpls = listHtmls(mod);
    return tpls.map(tpl => {
      return new HtmlWebpackPlugin({
        filename: mod + '/' + tpl,
        template: `${srcDir + mod}/${tpl}`,
        inject: 'head',
        chunks: [mod]
      });
    });
  });
  // console.log(flattenDeep(htmls));

  return {
    entry: entries,
    output: {
      path: path.resolve(__dirname, isDev ? buildDir : distDir),
      filename: `[name]/${pkgJson.name}.[name].${pkgJson.version}${isDev ? '' : '.min'}.js`
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            'babel-inline-import-loader',
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      // useBuiltIns: 'usage'
                    }
                  ]
                ],
                plugins: [
                  'transform-class-properties',
                  [
                    'babel-plugin-inline-import',
                    {
                      extensions: ['.tpl.html', '.md']
                    }
                  ]
                ],
                cacheDirectory: false
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader?sourceMap', 'sass-loader?sourceMap']
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: `${pkgJson.name} ${pkgJson.version}\n${pkgJson.homepage}\n@author ${pkgJson.author}\n${
          pkgJson.license
          } License\nCopyright (c) ${new Date().getFullYear()} ${pkgJson.author}`
      }),
      new CleanWebpackPlugin([(isDev ? buildDir : distDir) + '*']),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: `[name]/${pkgJson.name}.[name].${pkgJson.version}${isDev ? '' : '.min'}.css`,
        chunkFilename: `[name]/${pkgJson.name}.[id].${pkgJson.version}${isDev ? '' : '.min'}.css`
      }),
      ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),
      ...flattenDeep(htmls)
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
      contentBase: isDev ? buildDir : distDir,
      historyApiFallback: {
        index: '/app/app.html'
      },
      stats: {
        children: false
      },
      compress: true,
      hot: true,
      host: '0.0.0.0',
      port: 1234
    }
  };
};
