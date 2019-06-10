# webpack 从入门到精通

## 1. 快速上手

### 核心概念

- Entry:入口，webpack执行构建的第一步将从entry开始
- Module:模块，在webpack里一切皆模块，一个模块对应着一个文件
- Chunk:代码块，一个Chunk由多个模块组合而成，用于代码合并与分割
- Loader:模块转化器，用于把模块原内容按照需求转化成新的内容
- Plugin:扩展插件，在webpack构建流程中的特定时机注入扩展逻辑来改变构建的结果或者做你想做的事儿
- Output:输出结果，在webpack经过一系列处理并得到最终想要的代码后输出结果

webpack启动后会从Entry里配置的module开始递归解析Entry依赖的所有的Module，每找到一个module，就会根据配置的loader去找出对应的转化规则，对module进行转化后，再解析出当前Module依赖的module.这些模块会以Entry为单位进行分组，一个Entry和其他所有依赖的module被分到一个组也就是一个Chunk。最后会把所有的Chunk转化成文件输出。在整个流程中wepback会在恰当的时机执行Plugin里面的逻辑

### 配置webpack

    npm install wepback webpack-cli -D


- 创建src
- 创建dist 
    - 创建index.html
- 配置文件webpack.config.js
    - entry:入口文件的地址
    - module:配置模块
    - output:配置出口文件
    - plugin:配置插件
    - devServer:配置开发服务器

### 配置开发服务器

    npm install webpack-dev-server -D

- contentBase 配置开发服务器运行时的文件根目录
- host 配置服务器监听的主机地址
- compress 开发服务器是否启动gzip压缩
- port 开发服务器监听的端口

    devServer:{
        contentBase:path.resolve(__dirname,'dist'),
        host:'localhost',
        compress:true,
        port:8080
    }

同时配置npm命令

    "script":{
        "build":"webpack --mode development",
        "dev":"webpack-dev-server --open --mode development"
    }

### 加载css文件

通过使用不同的loader,webpack可以将不同的文件都转为js文件，比如css、es6/7、jsx等

- test:匹配处理文件的扩展名的正则表达式
- use:loader名称，就是你要使用的模块的名称
- include/exclude:手动指定必须处理的文件夹或屏蔽不需要处理的文件夹
- query:为loader提供额外的设置选项

loader的三种写法

- use
- loader
- use + loader

css-loader

    npm install style-loader css-loader -D

配置我们的css

