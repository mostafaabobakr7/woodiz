const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "./assets/"),
    filename: "app.js",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: [/node_modules/, "./src/js/global/", "./src/js/plugins/"],
        loader: 'babel-loader',
        query: { presets: ['@babel/preset-env'] },
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: false,
      uglifyOptions: {
        exclude: [/\.min\.js$/gi], // skip pre-minified libs
        ie8: false,
        output: { comments: false },
        compress: { drop_console: true },
      },
    }),
    new CompressionPlugin({ cache: true }),
  ],
};
