
var DIST = Boolean(process.env.DIST);

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var entryRoot = __dirname + '/src';
var entryFile = entryRoot + '/app.js';
var outputRoot = DIST ? __dirname + './partsApp/dist' : __dirname + './partsApp/build';
var outputFilename = DIST ? '[name]-[hash].js' : '[name].js';

module.exports = {
  entry: entryFile,
  output: {
    path: outputRoot,
    filename: outputFilename
  },
  resolve: {
    alias: {
      'npm': `${__dirname}/../node_modules`,
      'bower': `${__dirname}/../bower_components`,
      'components': `${__dirname}/src/components`
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
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
      filename: DIST ? '[name]-[hash].css' : '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: entryRoot + '/app.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    contentBase: outputRoot
  }
};
