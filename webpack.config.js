
var DIST = Boolean(process.env.DIST);

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var outputRoot = DIST ? './helperApp/dist' : './helperApp/build';

module.exports = {
  entry: {
    'plaid/plaid': './helperApp/plaid/index.js',
    'sift-science/sift-science': './helperApp/sift-science/index.js'
  },
  output: {
    path: outputRoot,
    filename: DIST ? '[name]-[hash].js' : '[name].js'
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
      filename: 'plaid/index.html',
      chunks: ['plaid/plaid']
    }),
    new HtmlWebpackPlugin({
      template: './helperApp/sift-science/index.html',
      filename: 'sift-science/index.html',
      chunks: ['sift-science/sift-science']
    }),
    new ExtractTextPlugin(
      DIST ? '[name]-[hash].css' : '[name].css'
    )
  ]
};
