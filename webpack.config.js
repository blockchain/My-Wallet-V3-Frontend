
let CopyWebpackPlugin = require('copy-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    'plaid': './helperApp/plaid/plaid.js'
  },
  output: {
    path: './helperApp/build',
    filename: '[name]/bundle.js'
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
    new CopyWebpackPlugin([
      {
        from: 'helperApp/plaid/index.html',
        to: 'plaid'
      }
    ]),
    new ExtractTextPlugin('plaid/[name].css')
  ]
};
