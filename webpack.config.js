module.exports = {
  entry: './src/app.js',
  output: {
    path: './dst',
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  devtool: '#inline-source-map'
};
