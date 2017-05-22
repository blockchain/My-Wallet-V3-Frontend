
var DIST = Boolean(process.env.DIST);

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var outputRoot = DIST ? `${__dirname}/helperApp/dist` : `${__dirname}/helperApp/build`;

module.exports = {
  entry: {
    'plaid/plaid': `${__dirname}/helperApp/plaid/index.js`,
    'sift-science/sift-science': `${__dirname}/helperApp/sift-science/index.js`
  },
  output: {
    path: outputRoot,
    filename: DIST ? '[name]-[hash].js' : '[name].js'
  },
  module: {
    rules: [
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
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname}/helperApp/plaid/index.html`,
      filename: 'plaid/index.html',
      chunks: ['plaid/plaid']
    }),
    new HtmlWebpackPlugin({
      template: `${__dirname}/helperApp/sift-science/index.html`,
      filename: 'sift-science/index.html',
      chunks: ['sift-science/sift-science']
    }),
    new ExtractTextPlugin(
      DIST ? '[name]-[hash].css' : '[name].css'
    )
  ]
};
