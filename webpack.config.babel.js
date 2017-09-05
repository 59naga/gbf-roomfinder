import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { DefinePlugin } from 'webpack';

import autoprefixer from 'autoprefixer-stylus';
import ks from 'kouto-swiss';
import sanitize from 'sanitize.styl';

export default {
  entry: './client/index.jsx',
  output: {
    path: `${__dirname}/public`,
    filename: './bundle.js',
  },

  plugins: process.env.NODE_ENV === 'production' ? [
    new HtmlWebpackPlugin({
      inject: false,
      template: '!!pug-loader!./client/index.pug',
    }),
    new UglifyJsPlugin({ minimize: true, sourceMap: true }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ] : [
    new HtmlWebpackPlugin({
      inject: false,
      template: '!!pug-loader!./client/index.pug',
    }),
  ],

  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    contentBase: './public',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: process.env.NODE_ENV === 'production' ? undefined : /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true,
              use: [autoprefixer(), ks(), sanitize()],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['url-loader'],
      },
    ],
  },
};
