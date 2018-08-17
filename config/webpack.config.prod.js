var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CompressionWebpackPlugin = require('compression-webpack-plugin');
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var basicConfig = require('./webpack.config');

function getPath(dir) {
  return path.join(process.cwd(), dir);
}

module.exports = merge(basicConfig, {
  output: {
    publicPath: '/',
    path: getPath('dist'),
    filename: 'js/[name]-[chunkhash:8].js',
    chunkFilename: 'js/chunks/[id]-[chunkhash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.(gif|jpg|jpeg|png)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 30000,
            name: 'images/[name]-[chunkhash:8].[ext]',
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 30000,
            name: 'fonts/[name]-[chunkhash:8].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      title: '编辑器',
      template: 'config/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false,
        collapseBooleanAttributes: true,
        removeRedundantAttributes: true,
      },
    }),
    new CompressionWebpackPlugin({
      asset: '[path].gz',
      algorithm: 'gzip',
      test: /\.(js|html|css)/,
      threshold: 1000 * 30,
      minRatio: 0.8,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[chunkhash:8].css',
      chunkFilename: 'css/chunks/[id]-[chunkhash:8].css',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          ie8: false,
          ecma: 8,
          output: {
            comments: false,
            beautify: false,
          },
          warnings: false,
        },
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true,
      }),
    ]
  },
})
