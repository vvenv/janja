// Webpack integration example for Janja pre-compiled templates
// This example shows how to use pre-compiled Janja templates in a Webpack project

const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.janja$/,
        use: [
          {
            loader: 'janja-webpack-loader',
            options: {
              runtime: true, // Include runtime for standalone execution
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.janja'],
  },
};
