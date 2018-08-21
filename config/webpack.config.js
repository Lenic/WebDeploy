var path = require('path');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

function getPath(dir) {
  return path.join(process.cwd(), dir);
}

module.exports = {
  mode: 'none',
  devtool: false,
  entry: {
    app: './src/index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: getPath('src'),
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.attached\.less$/,
        exclude: /\.global\.less$/,
        use: [
          { loader: 'style-loader/useable' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.global\.less$/,
        exclude: /\.attached\.less$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.less$/,
        exclude: [/\.global\.less$/, /\.attached\.less$/],
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.attached.less', '.global.less', '.less'],
    alias: {
      '$lib': getPath('lib'),
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
      'create-react-class': 'preact-compat/lib/create-react-class',
      'react-dom-factories': 'preact-compat/lib/react-dom-factories',
    },
  },
  plugins: [
    new FriendlyErrorsPlugin(),
    new webpack.NamedChunksPlugin(),
    new webpack.ProvidePlugin({
      'preact': 'preact',
      'React': 'preact-compat',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        default: false,
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          priority: -10,
          name: 'vendors',
        },
      },
    },
  },
};
