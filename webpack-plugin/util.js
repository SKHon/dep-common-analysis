const path = require('path');
const simpleGit = require('simple-git');
const _ = require('lodash');

const LEGAL_FILES = ['.js', '.ts', '.jsx', '.tsx', '.css'];

function checkFile(filePath) {
  const ext = path.extname(filePath);
  return LEGAL_FILES.includes(ext) && !filePath.includes('/node_modules/');
}

// BFS 遍历对象, 如果匹配到返回该节点
const BFSTravel = (root, parentPath) => {
  const queue = [root];

  while (queue.length) {
    const curNode = queue.shift();
    const { path = '', deps = [] } = curNode
    
    if( path === parentPath ) {
      return curNode;
    }
    let len = deps.length;
    let i = 0;
    while(i < len) {
      queue.push(deps[i]);
      i++;
    }
  }
  return false;
 
}

const BFSTravelGetAllFiles = (root) => {
  const files = [];
  const queue = [root];

  while (queue.length) {
    const curNode = queue.shift();
    const { path = '', deps = [] } = curNode
    // 由于git获取的diff文件都是小写，所以这里做个处理
    files.push(path.toLowerCase());
    let len = deps.length;
    let i = 0;
    while(i < len) {
      queue.push(deps[i]);
      i++;
    }
  }
  return files;
}

// 获取当前修改的文件列表
const getChangeFiles = async (root) => {
  const git = simpleGit();
  const changeFiles = await git.diff(['--name-only', root]);
  return changeFiles;
}




exports.default = {
  checkFile,
  BFSTravel,
  BFSTravelGetAllFiles,
  getChangeFiles
}
