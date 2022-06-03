## 项目介绍
主要实现了一个webpack plugin，用来分析，修改文件涉及到的影响面。
以example为例，如果你改了src/components/Common.js组件，在项目构建时，会分析该组件会影响哪些页面，分析出结果输出
到report文件中，交给QA进行回归。

## 使用方式
- 在项目跟目录安装依赖：npm i
- 进入example目录，安装依赖：cd example && npm i
- 修改example/src/components/Common.js文件，保存。
- 在example目录下进行构建：npm run build。
- 构建后，修改文件的影响面将输出到report文件中。

## 注意事项
如果使用该webpack插件，要在被分析的项目根目录下新建dep.config.js文件。该文件是用来映射路由和组件路径。

## api
new DepAnalysisPlugin({
  rootPath: __dirname // 传入被分析项目的根路径
})
