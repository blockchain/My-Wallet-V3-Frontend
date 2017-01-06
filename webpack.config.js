
var DIST = Boolean(process.env.DIST);

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var outputRoot = DIST ? './helperApp/dist' : './helperApp/build';

module.exports = {
  entry: {
    'plaid': './helperApp/plaid/plaid.js'
  },
  output: {
    path: outputRoot + '/plaid',
    filename: DIST ? 'plaid-[hash].js' : 'plaid.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', 'css!sass')
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './helperApp/plaid/index.html',
      filename: 'index.html'
    }),
    new ExtractTextPlugin(
      DIST ? '[name]-[hash].css' : '[name].css'
    )
  ]
};
