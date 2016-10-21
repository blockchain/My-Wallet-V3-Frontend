
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = {
  entry: {
    main: './assets/js/index.js',
    wallet: './assets/js/wallet.module.js'
  },
  output: {
    path: 'buildpack',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', 'css?-url!sass')
      },
      {
        test: /\.jade$/,
        loader: 'pug'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.pattern$/,
        loader: 'glob'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      browserDetection: 'browser-detection'
    }),
    new ExtractTextPlugin('style.css')
  ]
};

module.exports = config;
