var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var entryRoot = `${__dirname}/src`;
var entryFile = entryRoot + '/app.js';
var outputRoot = `${__dirname}/build`;
var jsOutputFilename = '[name].js';

// TODO : Clean production related variables
// TODO : Add minification and hash for production script
// TODO : Add ES-Lint
// TODO : Exclude tests from production build

module.exports = {
  entry: entryFile,
  output: {
    path: outputRoot,
    filename: jsOutputFilename
  },
  resolve: {
    alias: {
      'npm': `${__dirname}/../node_modules`,
      'bower': `${__dirname}/../bower_components`,
      'components': `${__dirname}/src/components`,
      'shared': `${__dirname}/src/shared`,
      'walletJs': `${__dirname}/../build/js`,
      'walletCss': `${__dirname}/../build/css`,
      'walletFonts': `${__dirname}/../build/fonts`,
      'walletImg': `${__dirname}/../build/img`,
      'walletLocales': `${__dirname}/../build/locales`
    }
  },
  module: {
    rules: [
    //   {
    //     enforce: 'pre',
    //     test: /\.js$/,
    //     exclude: ['npm', 'bower'],
    //     use: [{
    //       loader: 'eslint-loader',
    //       options: {
    //         failOnWarning: false,
    //         failOnError: true
    //       }
    //     }]
    //   },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }]
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader'
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: {
            loader: 'css-loader'
          }
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[ext]'
          }
        }
      },
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          'pug-html-loader'
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: entryRoot + '/app.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    contentBase: outputRoot,
    disableHostCheck: true // Unsafe, but needed for Heroku
  }
};
