const path = require('path'); 
exports.default = [
  {
    page: '页面01',
    entry: path.join(__dirname, './src/components/Page01.js')
  },
  {
    page: '页面02',
    entry: path.join(__dirname, './src/components/Page02.js')
  }
]