var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

var basicConfig = require('./webpack.config');

function getPath(dir) {
  return path.join(process.cwd(), dir);
}

module.exports = merge(basicConfig, {
  output: {
    publicPath: '/',
    path: getPath('dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/chunks/[id].js',
  },
  module: {
    rules: [
      {
        test: /\.(gif|jpg|jpeg|png)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 30000,
            name: 'images/[name].[ext]',
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 30000,
            name: 'fonts/[name].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
      api: 'http://localhost:3000',
      title: '自动部署程序',
      template: 'config/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/chunks/[id].css',
    }),
  ],
  devServer: {
    hot: false,
    port: 3001,
    inline: false,
    compress: true,
    host: '0.0.0.0',
    index: 'index.html',
    historyApiFallback: true,
    stats: {
      colors: true,
      modules: false,
      children: false,
    },
  },
})
