
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const debug = require('debug');

const { checkFile, BFSTravel, getChangeFiles, BFSTravelGetAllFiles } = require('./util').default;

module.exports = class DemoPlugin {
  constructor(options) {
    this.dependenciesTree = {};
    this.options = options;
    this.rootPath = options.rootPath || '';
  }
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('DepAnalysisPlugin', (nmf) => {
      nmf.hooks.afterResolve.tap('DepAnalysisPlugin', (result) => {
          
          const resourceResolveData = result?.createData?.resourceResolveData;
          const curFile = resourceResolveData?.path;
          const parentFile = resourceResolveData?.context?.issuer
          
          
          // 对于合法文件进行分析
          if(curFile && checkFile(curFile)) {
            // 如果有父级文件，则直接添加
            if(parentFile) {
              const curNode = BFSTravel(this.dependenciesTree, parentFile);
              if(curNode) {
                curNode.deps.push({
                  path: curFile,
                  deps: []
                })
              } 
            } else { // 说明是根路径
              this.dependenciesTree = {
                path: curFile,
                deps: []
              }
            }
          } 
        }
      )
    });

    // 编译完成之后，操作依赖树
    compiler.hooks.done.tap("DepAnalysisPlugin", async stats => {
      if(!this.rootPath) {
        throw new Error("DepAnalysisPlugin need rootPath config file");
      }
      const depConfigPath = path.join(this.rootPath, 'dep.config.js')
      
      fs.existsSync(depConfigPath, status => {
        if(!status) {
          throw new Error("need dep.config.js file");
        }
      })
      // 获取路由文件配置
      const routerConfig = require(depConfigPath).default;
      debug('plugin-routerConfig:')(routerConfig);
      debug('plugin-dependenciesTree:')(this.dependenciesTree);
      
      // 路由和对应文件的映射
      const pageMap = {};
      routerConfig.forEach(item => {
        const { entry } = item;
        const curNode = BFSTravel(this.dependenciesTree, entry);
        const files = BFSTravelGetAllFiles(curNode);
        pageMap[item.page] = files;
      })

      debug('plugin-pageMap:')(pageMap);
      // 获取本次修改的文件
      const changeFilesStr = await getChangeFiles(this.rootPath);
      const changeFilesArr = changeFilesStr.split(/[\s\n]/);

      let report = '';
      changeFilesArr.forEach(item => {
        
        for(let page in pageMap) {
          const filePath = path.resolve(this.rootPath, '../' ,item).toLowerCase();
          debug('plugin-filePath:')(filePath);
          if(pageMap[page].some(file => file.toLowerCase() === filePath.toLowerCase())) {
            // report+=`修改的文件：${item}, 影响到了页面：${page}\n`;
            report += `修改的文件：${item}, 影响到了页面：${page}, 请QA回归被影响到页面的相关功能\n`
           
          }
        }
      })
      debug('plugin-report:')(report);
      fs.writeFileSync(path.join(this.rootPath, 'report'), report,  (err) => {
        if(err) {
          throw new Error(`write file err, ${err}`);
        }
      })
		});
   
  } 
}