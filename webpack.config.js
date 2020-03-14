const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WebpackLighthousePlugin = require('webpack-lighthouse-plugin');

module.exports = {
  devtool: "source-map",
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "./assets/"),
    filename: "app.js",
  },
  plugins: [new BundleAnalyzerPlugin()],
};
