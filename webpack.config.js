
const DIST = Boolean(process.env.DIST);

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'plaid': './helperApp/plaid/plaid.js'
  },
  output: {
    path: `./helperApp/build/plaid`,
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
