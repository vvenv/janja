const path = require('node:path');

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
            loader: path.resolve(__dirname, 'janja-loader.js'),
            options: { root: 'src/templates' },
          },
        ],
      },
    ],
  },
};
