const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './web/src/script.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'web/public/dist'),
    filename: 'bundle.js',
  },
  mode: 'none',
};