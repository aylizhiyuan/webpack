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

配置我们的css加载器

    module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader'],
                include:path.join(__dirname,'./src'),
                exclude:/node_modules/
            }
        ]
    }

### 自动产出html

我们希望可以自动生成html文件，并在里面引入资源

    npm install html-webpack-plugin -D

- minify是对html文件进行压缩，removeAttrubuteQuotes是去掉属性的双引号
- hash 引入产出资源的时候加上哈希避免缓存
- template 模板路径

    plugins:[
        new HtmlWebpackPlugin({
            minify:{
                removeAttrubuteQuotes:true
            },
            hash:true,
            template:'./src/index.html',
            filename:'index.html'
        })]

### 支持图片

手动添加图片

    npm install file-loader url-loader -D

- file loader解决css等文件中的引入图片路径问题
- url loader当图片较小的时候使用base64编码

在js中使用图片

    let logo=require('./images/logo.png');
    let img=new Image();
    img.src=logo;
    document.body.appendChild(img);


在css中引入图片

    .img-bg{
        background: url(./images/logo.png);
        width:173px;
        height:66px;
    }

处理图片的loader

    {
        test:/\.(jpg|png|gif|svg)$/,
        use:'url-loader',
        include:path.join(__dirname,'./src'),
        exclude:/node_modules/
    }

### 分离css

因为webpack打包的时候会和css一起打包成一个文件，这时候如果需要独立打包我们的css文件的话

    npm install extract-text-webpack-plugin -D


下面是配置

    {
        test:/\.css$/,
        use:ExtractTextWebpackPlugin.extract({
            use:'css-loader'
        }),
        include:path.join(__dirname,'./src'),
        exclude:/node_modules/
    },
    plugins:[
        new ExtractTextWebpackPlugin('css/index.css')
    ]

### 在html中使用图片

    npm install html-withimg-loader -D

比如：

    <div class="img-container">
        <img src="./images/logo.png">
    </div>

这时候需要添加loader

    {
        test:/\.(html|htm)$/,
        use:'html-withimg-loader',
        include:path.join(__dirname,'./src'),
        exclude:/node_modules/
    }

### 编译less和sass

    npm install less less-loader -D
    npm install node-sass sass-loader -D

添加我们的loader

    const cssExtract=new ExtractTextWebpackPlugin('css.css');
    const lessExtract=new ExtractTextWebpackPlugin('less.css');
    const sassExtract=new ExtractTextWebpackPlugin('sass.css');

    {
        test:/\.less$/,
                    use: lessExtract.extract({
                        use:['css-loader','less-loader']
                    }),
                    include:path.join(__dirname,'./src'),
                    exclude:/node_modules/
                },
                {
                    test:/\.scss$/,
                    use: sassExtract.extract({
                        use:['css-loader','sass-loader']
                    }),
                    include:path.join(__dirname,'./src'),
                    exclude:/node_modules/
                },

### 处理css属性前缀

为了浏览器的兼容性，有时候我们必须加入-webkit,-ms,-o,-moz这些前缀

- Trident内核：主要代表为IE浏览器, 前缀为-ms
- Gecko内核：主要代表为Firefox, 前缀为-moz
- Presto内核：主要代表为Opera, 前缀为-o
- Webkit内核：产要代表为Chrome和Safari, 前缀为-webkit   

    npm install postcss-loader autoprefixer -D

首先在根目录下新建一个postcss.config.js文件

    module.exports={
        plugins:[require('autoprefixer')]
    }

在webpack中加载它

    {
        test:/\.css$/,
        use:cssExtract.extract({
            use:['css-loader','postcss-loader']
        }),
        include:path.join(__dirname,'./src'),
        exclude:/node_modules/
    }

### 转义es6/es7/jsx

Babel其实是一个编译JavaScript的平台,可以把ES6/ES7,React的JSX转义为ES5

    pm i babel-core babel-loader babel-preset-env babel-preset-stage-0 babel-preset-react -D

加载loader

    {
        test:/\.jsx?$/,
        use:{
            loader:'babel-loader',
            options:{
                presets:['env','stage-0','react']
            }
        },
        include:path.join(__dirname,'./src'),
        exclude:/node_modules/
    }


### 如何调试打包后的代码

webpack通过配置可以自动给我们source maps文件，map文件
是一种对应编译文件和源文件的方法

- source-map把映射文件生成到单独的文件，最完整最慢
- cheap-module-source-map 在一个单独的文件中产生一个不带列映射的Map
- eval-source-map 使用eval打包源文件模块，在同一个文件中生成完整sourcemap
- cheap-module-eval-source-map source-map和打包后的js同行显示，没有映射列

### watch

当代码修改后自动重新编译

    watch: false,
    watchOptions: {
        ignored: /node_modules/,
        poll: 1000,//每秒钟询问的次数
        aggregateTimeout: 500//
    },

### 拷贝静态文件

有时候项目中没有引用的文件也需要打包到目标的目录

    npm install copy-webpack-plugin -D

加载Loader

new CopyWebpackPlugin([{
    from:path.join(__dirname,'public'),
    to:'./public'
}])

### 打包前先清空输出目录

    npm install clean-webpack-plugin -D

加入代码

    new CleanWebpackPlugin(path.join(__dirname,'dist'))

### 压缩js

    npm install uglifyjs-webpack-plugin -D

加入代码

    plugins:[new UglifyjsWebpackPlugin()]

### resolve解析

*** extensions ***

指定extension之后可以不同在reqiure或是import的时候加上文件的扩展名，会依次尝试添加扩展名进行匹配

    resolve:{
        extensions:[".js",".css",".json"]
    }

*** alis别名 ***

配置别名可以加快webpack的查找模块的速度

    alias: {//别名
                "bootstrap": "bootstrap/dist/css/bootstrap.css"
            }

### 区分环境变量

很多引入模块中都会跟Process.env.NODE_ENV环境变量相关，以决定引入哪些内容。

    npm install cross-env -D

这时候写npm命令的时候可以加入环境变量

    "script":{
        "build":"cross-env NODE_ENV=production webpack --mode development"
        "dev":"webpack-dev-server --oepn --mode development"
    }
    if (process.env.NODE_ENV == 'development') {
        console.log('这是开发环境');
    } else {
        console.log('这是生产环境');
    }

## 2. 如何从零配置vue/react环境

网上有很多的教程教大家如何去配置，但是都讲的非常的肤浅，并且用到的模块和插件非常的多，用的少了感觉生产环境下不适合，用的多了感觉生产环境下修改又太复杂了额。。这里就简单的总结下如何要根据自己的项目配置webpack应该遵循一个这样的顺序和原则

### 首先填写package.json文件中对应的npm命令

在做这一步之前，首先使用npm init初始化package.json文件，并且安装webpack和webpack-cli模块，另外，用到什么模块再根据实际情况安装即可。

dependencies 和devdependencies 里面安装的模块是有区别的,dependencies是生产环境下需要安装的模块，Devdependencies是在测试环境下需要的模块，一旦我们放在了生产环境下，就不需要这些模块了

    "scripts": {
        "dev": "NODE_ENV=development webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
        "build": "NODE_ENV=production node build/build.js",
        "dll": "NODE_ENV=production webpack --progress --config build/webpack.dll.conf.js",
        "lint": "eslint --ext .js,.vue src --cache",
        "test": "echo \"Error: no test specified\" && exit 1"
    },

一般我们都会设置两个命令,一个是npm run dev 和npm run build，两者的区别非常的明显，npm run dev会启动webpack-dev-server临时开启一个服务器环境，不生成静态文件，npm run build会生成项目的静态文件，可以理解为npm run build是真正启动webpack打包工具打包的，而npm run dev只是临时将项目生成的文件放入内存中得以执行而已，实际并不产生任何文件

### 创建webpack.dev/prod.config.js文件

我们需要根据生产环境和测试环境创建对应的webpack配置文件,npm run dev使用webpack.dev.config.js文件,而npm run build 使用webpack.prod.config.js文件

通常我们在npm run build的时候可能还需要做一些版本检查的工作，例如checkVersion()和在终端中输出一些打包的信息例如chalk模块用于输出信息的颜色


### 创建我们通用的config配置文件

环境下可能需要用到很多配置参数，这时候可以统一的将配置参数写在config.js配置文件中，这时候依然要区分清楚dev和build的配置不同


### webpack.base.conf.js的配置

通常我们会将生产环境和测试环境下的通用配置写在这里，这里有什么好处呢？主要是把统一的处理放在这里

- 指定我们的入口文件Entry
- output是指定我们文件的输出参数的，这里面主要要填写的就是对应的path/filename/publicPath
- resolve extensions自动带上后缀,alias文件的别名
- module里面来设置一些基本的对于.vue文件的处理、.js文件的处理、图片文件的处理、媒体资源的处理、字体文件的处理

> 注意这里没有对于css文件的处理，因为我们需要在不同的环境下做不同的处理

以上都是一些最基础的配置，是保证我们项目运行的基本配置

### webpack.dev.config.js的配置

在测试环境下，我们主要会依赖webpack-dev-server来临时启动一个服务器环境，将dist文件夹作为我们服务器的入口文件，打包好的文件会放在dist文件夹下，我们就可以在不上线的情况下去预览我们的项目了

- 首先上来针对css文件/scss文件/less文件/Vue文件中的style标签中的css进行合并
- 启动我们的测试服务器，并设置对应的参数
- htmlWebpackPlugin插件是为了让我们自动在dist文件夹下生成index.html
- copyWebpackPlugin是为了自动将src中的静态资源拷贝到dist文件夹下
- 启动webpack中的热更新

热更新的代码

        // 启用模块热替换(HMR)
        new webpack.HotModuleReplacementPlugin(),
        // 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
        new webpack.NamedModulesPlugin(),
        // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。
        new webpack.NoEmitOnErrorsPlugin()



### webpack.prod.config.js的配置

在生产环境下，我们主要关心的问题是压缩js代码和压缩css代码以及全局的优化问题

- output跟dev环境有很大的区别

        //Dev下的output
        output: {
        path: resolve('dist'),
        filename: '[name].js',
        publicPath: isProduction ? config.build.assetsPublicPath : config.dev.assetsPublicPath
        },

        //生产环境下的output
        output: {
            path: config.build.assetsRoot,
            filename: utils.assetsPath('js/[name].[chunkhash].js'),
            chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
        },

- 跟Dev环境一样，我们对css文件进行处理
- 使用uglifyjs-webpack-plugin插件对Js代码进行压缩
- 使用extract-text-webpack-plugin来对css文件进行分隔
- 使用optimize-css-assets-webpack-plugin解决css文件的重复加载问题
- 生产环境下给模块添加ID值

举例：

        // 该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),

- htmlWebpackPlugin插件是为了让我们自动在dist文件夹下生成index.html
- copyWebpackPlugin是为了自动将src中的静态资源拷贝到dist文件夹下
- CommonsChunkPlugin主要是用来提取第三方库和公共模块，避免首屏加载的bundle文件或者按需加载的bundle文件体积过大，从而导致加载时间过长

        new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        //如果是个函数的话，可以根据条件判断是否需要抽离出来
        minChunks (module) {
            // any required modules inside node_modules are extracted to vendor
            return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(
                path.join(__dirname, '../node_modules')
            ) === 0
            )
        }
        }),
        new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        minChunks: Infinity
        }),
        new webpack.optimize.CommonsChunkPlugin({
        name: 'app',
        async: 'vendor-async',
        children: true,
        minChunks: 3
        }),

> 最终这个模块的功能是将文件中引入的多个重复性的文件打包到一个公共的vendor中去


## 3. webpack源码级别分析


### AST抽象语法树

webpack和Lint等很多的工具和库的核心都是通过Abstract Syntax Tree抽象语法树这个概念来实现对于代码的检查、分析等操作的

### 抽象语法树的用途

- 代码语法的检查、代码风格的检查、代码的格式化、代码的高亮、代码错误、代码自动补全等
- 代码混淆压缩
- 优化变更代码、改变代码结构

### 抽象语法树的定义

这些工具的原理都是通过javascript parser把代码转化为一颗抽象语法树，这棵树定义了代码的结构，通过操控这棵树，我们可以精准的定位到声明语句、赋值语句、运算语句等等，实现对于代码的分析、变更等操作

### javascript parser

- javascript parser，把js源码转化为抽象语法树的解析器
- 浏览器会把js源码通过解析器转为抽象语法树，再进一步转化为字节码或直接生成机器码
- 一般来说每个js引擎都会有自己的抽象语法树结构，chrome的v8引擎，firefox的spiderMonkey引擎等

常见的javascript parser有:

- esprima
- traceur
- acorm
- shift

esprima

- 通过esprima把源码转化为AST
- 通过estraverse遍历并更新AST
- 通过escodegen将AST重新生成源码

        let esprima = require('esprima');
        var estraverse = require('estraverse');
        var escodegen = require("escodegen");
        let code = 'function ast(){}';
        let ast = esprima.parse(code);
        console.log(ast);
        estraverse.traverse(ast,{
        enter(node){
            node.name += '_ext';
        },
        leave(node){
            // console.log(node.type);
        }
        });
        let generated = escodegen.generate(ast);
        console.log(generated);

### babel的基础和API使用

核心包

- babel-core:babel转译器本身，提供了babel的转译API,如babel.transform等，用来对代码进行转译
- babylon:js的词法解析器
- babel-tranverse:用于对AST进行遍历
- babel-generator:根据AST生成代码

功能包

- babel-types:用于检验、构建和改变AST树的节点
- babel-template:辅助函数，用于从字符串形式的代码构建AST树节点
- babel-helpers:一系列预制的babel-template函数，用于提供给一些plugins使用
- babel-code-frames:用户生成错误信息，打印出错误点源代码帧以及指出出错位置
- babel-plugin-xxx:babel转译过程中使用到的插件
- bable-preset-xxx:transfrom阶段使用的一系列plugin
- babel-polyfill:js标准新增的原生对象和API的shim,实现上仅仅是core-js和regenerator-runtime两个包的封装
- babel-runtime:功能类似于babel-polyfill,一般用于libray或plugin中

babel的配置

如果是以命令行方式使用babel，那么babel的设置就以命令行参数的形式带过去；
还可以在package.json里在babel字段添加设置；
但是建议还是使用一个单独的.babelrc文件，把babel的设置都放置在这里，所有babel API的options（除了回调函数之外）都能够支持


- env：指定在不同环境下使用的配置。比如production和development两个环境使用不同的配置，就可以通过这个字段来配置。env字段的从process.env.BABEL_ENV获取，如果BABEL_ENV不存在，则从process.env.NODE_ENV获取，如果NODE_ENV还是不存在，则取默认值"development"

- plugins：要加载和使用的插件列表，插件名前的babel-plugin-可省略；plugin列表按从头到尾的顺序运行

- presets：要加载和使用的preset列表，preset名前的babel-preset-可省略；presets列表的preset按从尾到头的逆序运行（为了兼容用户使用习惯）

- 同时设置了presets和plugins，那么plugins的先运行；每个preset和plugin都可以再配置自己的option

babel的工作原理

babel的转译过程也分为三个阶段：parsing、transforming、generating

> ES6代码输入 ==》 babylon进行解析 ==》 得到AST ==》 plugin用babel-traverse对AST树进行遍历转译 ==》 得到新的AST树 ==》 用babel-generator通过AST树生成ES5代码

babel只是转译新标准引入的语法，比如es6中的箭头函数转译成es5的函数，而新标准引入的新的原生对象，部分原生对象新增的原型方法、新增的API这些babel是没有把那转译的，需要用户自行引入polyfill来解决

presets

如果我们要自行配置转译过程中使用的各类插件，那太痛苦了，所以babel官方帮我们做了一些预设的插件集，称之为preset，这样我们只需要使用对应的preset就可以了

举例babel提供了如下的preset

- es2015
- es2016
- es2017
- env

polyfill

polyfill是一个针对es2015+环境的shim,实现上来说的话babel-polyfill包只是简单的把core-js和regenerator runtime包装了一下，这两个包才是真正的实现代码所在

使用babel-polyfill会把ES2015+环境整体引入到你的代码环境中去，让你的代码可以直接使用新标准所引入的新的原生对象、新的API

使用方法

1. 先安装包： npm install --save babel-polyfill
2. 要确保在入口处导入polyfill，因为polyfill代码需要在所有其他代码前先被调用

        代码方式： import "babel-polyfill"
        webpack配置： module.exports = { entry: ["babel-polyfill", "./app/js"] };


如果只是需要引入部分新原生对象或API，那么可以按需引入，而不必导入全部的环境，具体见下文的core-js

runtime

直接使用babel-polyfill对于应用或页面等环境在你的控制之中的情况来说，并没有什么问题，但是对于library中使用polyfill,就变的不可行了。因为library是供外部使用的，但是外部的环境并不在libaray的可控范围，而polyfill是会污染原来的全局环境的，所以这时候,babel-runtime就可以派上用场了

transfrom-runtime和babel-runtime


babel-plugin-transform-runtime插件依赖babel-runtime，babel-runtime是真正提供runtime环境的包；也就是说transform-runtime插件是把js代码中使用到的新原生对象和静态方法转换成对runtime实现包的引用，举个例子如下：

    // 输入的ES6代码
    var sym = Symbol();
    // 通过transform-runtime转换后的ES5+runtime代码 
    var _symbol = require("babel-runtime/core-js/symbol");
    var sym = (0, _symbol.default)();


从上面这个例子可见，原本代码中使用的ES6新原生对象Symbol被transform-runtimec插件转换成了babel-runtime的实现，既保持了Symbol的功能，同时又没有像polyfill那样污染全局环境（因为最终生成的代码中，并没有对Symbol的引用）

transform-runtime插件的功能

- 把代码中的使用到的ES6引入的新原生对象和静态方法用babel-runtime/core-js导出的对象和方法替代
- 当使用generators或async函数时候，用babel-runtime/regenerator导出的函数取代
- 把babel生成的辅助函数改为用babel-runtime/helpers导出的函数替（babel默认会在每个文件顶部放置所需要的辅助函数，如果文件多的话，这些辅助函数就在每个文件中都重复了，通过引用babel-runtime/helpers就可以统一起来，减少代码体积）

上述三点就是transform-runtime插件所做的事情，由此也可见，babel-runtime就是一个提供了regenerator、core-js和helpers的运行时库。
建议不要直接使用babel-runtime，因为transform-runtime依赖
babel-runtime，大部分情况下都可以用transform-runtime达成目的。


此外，transform-runtime在.babelrc里配置的时候，还可以设置helpers、polyfill、regenerator这三个开关，以自行决定runtime是否要引入对应的功能。

core-js

ore-js包才上述的polyfill、runtime的核心，因为polyfill和runtime其实都只是对core-js和regenerator的再封装，方便使用而已。


但是polyfill和runtime都是整体引入的，不能做细粒度的调整，如果我们的代码只是用到了小部分ES6而导致需要使用polyfill和runtime的话，会造成代码体积不必要的增大（runtime的影响较小）。所以，按需引入的需求就自然而然产生了，这个时候就得依靠core-js来实现了。


首先，core-js有三种使用方式：

- 默认方式：require('core-js') 这种方式包括全部特性，标准的和非标准的
- 库的形式： var core = require('core-js/library') 这种方式也包括全部特性，只是它不会污染全局名字空间
- 只是shim： require('core-js/shim')或var shim = require('core-js/library/shim') 这种方式只包括标准特性（就是只有polyfill功能，没有扩展的特性）

core-js的结构是高度模块化的，它把每个特性都组织到一个小模块里，然后再把这些小模块组合成一个大特性，层层组织。比如：

core-js/es6（core-js/library/es6）就包含了全部的ES6特性，

而core-js/es6/array（core-js/library/es6/array）则只包含ES6的Array特性，

而core-js/fn/array/from（core-js/library/fn/array/from）则只有Array.from这个实现

> 总结polyfill和runtime和core-js三者之间的关系都是要将新的es2015的语法特性加入到我们的项目中去，只不过polyfill是全局的,runtime是不污染全局的,而core-js是定制化的引入

### babel的插件开发

案例：转化箭头函数

    let babel = require('babel-core');
    let types = require('babel-types');
    const code = `const sum = (a,b)=>a+b`;
    // babel-eslint

    const visitor = {
        ArrowFunctionExpression:{
            enter(path) {
                let node = path.node;
                let expression = node.body;
                let params = node.params;
                let returnStatement = types.returnStatement(expression);
                let block = types.blockStatement([
                    returnStatement
                ]);
                let func = types.functionExpression(null,params, block,false, false);
                path.replaceWith(func);
            }
        }
    }
    const result = babel.transform(code,{
        plugins:[
            {visitor}
        ]
    });
    console.log(result.code);

### tapable

webpack本质就是一种事件流的机制，它的工作流程及㐊将各个插件串联起来，而实现这一切的核心就是Tapable，webpack中最核心的负责编译的compiler和负责创建bundles的compilaction都是Tapable的实例

    const {
        SyncHook,
        SyncBailHook,
        SyncLoopHook,
        AsyncParalleHook,
        AsyncParalleBaiHook,
        AsyncSeriesHook,
        AsyncSeriesBailHook,
        AsyncSeriesWaterfallHook
    } = require('tapable')

- syncHook 串行同步执行,不关心返回值
- SyncBailHook  串行同步执行，有一个返回值不为null则跳过剩下的逻辑
- SyncLoopHook 监听函数返回true表示继续循环，返回undefine表示结束循环

## 4. webpack制作loader

loader是导出为一个函数的node模块。该函数在loader转换资源的时候调用。给定的函数将调用loader API，并通过this上下文访问。

- this.context：当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src。
- this.resource：当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。
- this.resourcePath：当前处理文件的路径，例如 /src/main.js。
- this.resourceQuery：当前处理文件的 querystring。 -this.target：等于 Webpack 配置中的 Target
- this.loadModule：但 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时， 就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果。
- this.resolve：像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string))。
- this.addDependency：给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string)。
- this.addContextDependency：和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string)。
- this.clearDependencies：清除当前正在处理文件的所有依赖，使用方法为 clearDependencies()。
- this.emitFile：输出一个文件，使用方法为 emitFile(name: string, content: Buffer|string, sourceMap: {...})。


## 5. webpack制作plugin

webpack插件由以下组成：

- 一个javascript命名函数
- 在插件函数的prototype上定义一个apply方法
- 指定一个绑定到webpack自身的事件钩子
- 处理webpack内部实例的特定数据
- 功能 完成后调用webpack提供的回调

        class CompilationPlugin {
            constructor(options){
                this.options = options;
            }
            aplly(compiler){
                compiler.hooks.compilation.tap('CompilationPlugin',function(compilation){
                    compilation.hooks.optimize.tap('optimize',function(){
                        console.log("资源正被优化")
                    })
                })
            }
        }
        module.exports = CompilationPlugin;

### compiler和compilation

在插件开发中最重要的两个资源就是compiler和compilation对象。理解它们的角色是扩展webpack引擎重要的第一步。

- compiler 对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。

- compilation 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。


### 基本插件架构

插件是由「具有 apply 方法的 prototype 对象」所实例化出来的。这个 apply 方法在安装插件时，会被 webpack compiler 调用一次。apply 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象。一个简单的插件结构如下

    class DonePlugin{
        constructor(options) {
            this.options=options;
        }
        apply(compiler) {
            compiler.hooks.done.tap('DonePlugin', ()=> {
                console.log('Hello ',this.options.name);
            });
        }
    }
    module.exports=DonePlugin;

然后，要安装这个插件，只需要在你的 webpack 配置的 plugin 数组中添加一个实例

    const DonePlugin=require('./plugins/DonePlugin');
    module.exports={
        entry: './src/index.js',
        output: {
            path: path.resolve('build'),
            filename:'bundle.js'
        },
        plugins: [
            new DonePlugin({name:'lzy'})
        ]
    }

### 访问 compilation 对象

使用 compiler 对象时，你可以绑定提供了编译 compilation 引用的回调函数，然后拿到每次新的 compilation 对象。这些 compilation 对象提供了一些钩子函数，来钩入到构建流程的很多步骤中

    class CompilationPlugin{
        constructor(options) {
            this.options=options;
        }
        apply(compiler) {
            compiler.hooks.compilation.tap('CompilationPlugin',function (compilation) {
                compilation.hooks.optimize.tap('optimize',function () {
                    console.log('资源正在被优化');
                });
            });
        }
    }
    module.exports=CompilationPlugin;

### 异步编译插件

有一些编译插件中的步骤是异步的，这样就需要额外传入一个 callback 回调函数，并且在插件运行结束时，必须调用这个回调函数。

    class CompilationAsyncPlugin{
        constructor(options) {
            this.options=options;
        }
        apply(compiler) {
            compiler.hooks.emit.tapAsync('EmitPlugin',function (compilation,callback) {
                setTimeout(function () {
                    console.log('异步任务完成');
                    callback();
                },500);
            });
        }
    }
    module.exports=CompilationAsyncPlugin;



## 6.webpack流程

Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。 Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。 Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。 Loader：模块转换器，用于把模块原内容按照需求转换成新内容。 Plugin：扩展插件，在 Webpack 构建流程中的特定时机会广播出对应的事件，插件可以监听这些事件的发生，在特定时机做对应的事情。

> AST主要应用在webpack-loader中，tapable主要应用在webpack-plugins中

### 流程概括

- 初始化参数:从配置参数和shell语句中读取与合并参数，得到最终的参数
- 开始编译:用上一步得到的参数初始化Compiler对象，加载所有配置的插件，执行对象的run方法进行编译
- 确定入口：根据配置中的entry找出所有的入口文件
- 编译模块：从入口文件出发，调用所有配置的loader对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
- 完成模块编译：在经过第四步使用Loader翻译完所有的模块后，得到每个模块被翻译后的最终内容以及他们之间的依赖关系
- 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk,再把每个chunk转化成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
- 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

> 在以上过程中，wepback会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用wepback提供的API改变webpack的运行结果

### 详细流程

webpack的构建流程可以分为以下三个阶段：

- 初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler。
- 编译：从 Entry 发出，针对每个 Module 串行调用对应的 Loader 去翻译文件内容，再找到该 Module 依赖的 Module，递归地进行编译处理。
- 输出：对编译后的 Module 组合成 Chunk，把 Chunk 转换成文件，输出到文件系统。


### 初始化阶段


1. 初始化参数	从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。	webpack-cli/bin/webpack.js:436

2. 实例化 Compiler	用上一步得到的参数初始化 Compiler 实例，Compiler 负责文件监听和启动编译。Compiler 实例中包含了完整的 Webpack 配置，全局只有一个 Compiler 实例。	webpack/lib/webpack.js:32

3. 加载插件	依次调用插件的 apply 方法，让插件可以监听后续的所有事件节点。同时给插件传入 compiler 实例的引用，以方便插件通过 compiler 调用 Webpack 提供的 API。	webpack/lib/webpack.js:42

4. environment	开始应用 Node.js 风格的文件系统到 compiler 对象，以方便后续的文件寻找和读取。	webpack/lib/webpack.js:40

5. entry-option	读取配置的 Entrys，为每个 Entry 实例化一个对应的 EntryPlugin，为后面该 Entry 的递归解析工作做准备。	webpack/lib/webpack.js:275

6. after-plugins	调用完所有内置的和配置的插件的 apply 方法。	webpack/lib/WebpackOptionsApply.js:359

7. after-resolvers	根据配置初始化完 resolver，resolver 负责在文件系统中寻找指定路径的文件。	webpack/lib/WebpackOptionsApply.js:396


### 编译阶段

1. run	启动一次新的编译。	webpack/lib/webpack.js:194

2. watch-run	和 run 类似，区别在于它是在监听模式下启动的编译，在这个事件中可以获取到是哪些文件发生了变化导致重新启动一次新的编译。

3. compile	该事件是为了告诉插件一次新的编译将要启动，同时会给插件带上 compiler 对象。	webpack/lib/Compiler.js:455

4. compilation	当 Webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。一个 Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。Compilation 对象也提供了很多事件回调供插件做扩展。	webpack/lib/Compiler.js:418

5. make	一个新的 Compilation 创建完毕，即将从 Entry 开始读取文件，根据文件类型和配置的 Loader 对文件进行编译，编译完后再找出该文件依赖的文件，递归的编译和解析。	webpack/lib/Compiler.js:459

6. after-compile	一次 Compilation 执行完成。	webpack/lib/Compiler.js:467

在编译阶段中，最重要的要数 compilation 事件了，因为在 compilation 阶段调用了 Loader 完成了每个模块的转换操作，在 compilation 阶段又包括很多小的事件，它们分别是:

1. build-module	使用对应的 Loader 去转换一个模块。	webpack/lib/Compilation.js:345

2. normal-module-loader	在用 Loader 对一个模块转换完后，使用 acorn 解析转换后的内容，输出对应的抽象语法树（AST），以方便 Webpack 后面对代码的分析。	webpack/lib/NormalModule.js:177

3. program	从配置的入口模块开始，分析其 AST，当遇到 require 等导入其它模块语句时，便将其加入到依赖的模块列表，同时对新找出的依赖模块递归分析，最终搞清所有模块的依赖关系。	webpack/lib/Parser.js:1947

4. seal	所有模块及其依赖的模块都通过 Loader 转换完成后，根据依赖关系开始生成 Chunk。	webpack/lib/Compilation.js:826

### 输出阶段

- should-emit	所有需要输出的文件已经生成好，询问插件哪些文件需要输出，哪些不需要。	webpack/lib/Compiler.js:146

- emit	确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出内容。	webpack/lib/Compiler.js:287

- after-emit	文件输出完毕。	webpack/lib/Compiler.js:278

- done	成功完成一次完成的编译和输出流程。	webpack/lib/Compiler.js:166

- failed	如果在编译和输出流程中遇到异常导致 Webpack 退出时，就会直接跳转到本步骤，插件可以在本事件中获取到具体的错误原因。

> 在输出阶段已经得到了各个模块经过转换后的结果和其依赖关系，并且把相关模块组合在一起形成一个个 Chunk。 在输出阶段会根据 Chunk 的类型，使用对应的模版生成最终要要输出的文件内容。



### 代码流程

node_modules/.bin/webpack-cli

- 通过yargs获得shell中的参数

- 把webpack.config.js中的参数和shell参数整合到options对象上

- 调用webpack-cli/bin/webpack.js开始编译和打包

- webpack-cli/bin/webpack.js中返回一个compiler对象，并调用了compiler.run()

- lib/Compiler.js中，run方法触发了before-run、run两个事件，然后通过readRecords读取文件，通过compile进行打包,该方法中实例化了一个Compilation类

- 打包时触发before-compile、compile、make等事件

- make事件会触发SingleEntryPlugin监听函数，调用compilation.addEntry方法

- 这个方法通过调用其私有方法_addModuleChain完成了两件事：根据模块的类型获取对应的模块工厂并创建模块；构建模块

    - 调用loader处理模块之间的依赖
    - 将loader处理后的文件通过acorn抽象成抽象语法树AST
    - 遍历AST，构建该模块的所有依赖

- 调用Compilation的finish及seal方法


## 7.编写webpack

### 1. 创建项目

    "bin": {"lzypack": "./bin/lzypack.js"},

### 2. 创建可执行文件

    #! /usr/bin/env node
    const path = require('path');
    const fs = require('fs');
    const Compiler = require('../lib/Compiler');//引入Compiler构造函数
    let root = process.cwd();
    let options = require(path.resolve(root, 'webpack.config.js'));
    let compiler = new Compiler(options);
    compiler.hooks.entryOption.call(options);
    compiler.run();

### 3. 创建compiler对象

    const { SyncHook } = require('tapable');
    const path = require('path');
    const fs = require('fs');
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    const escodegen = require('escodegen');

    class Compiler {
        constructor(options) {
            this.options = options;//保存选项对象
            this.hooks = {
                entryOption: new SyncHook(['options']),//保存一个解析选项对象的钩子
                run: new SyncHook([]),
                afterPlugins: new SyncHook([]),
                compile: new SyncHook(),//编译
                afterCompile: new SyncHook(),//编译完成后
                emit: new SyncHook(),//发射
                done: new SyncHook()//完成
            }
            let plugins = options.plugins;//加载自定义插件
            if (plugins && plugins.length > 0) {
                plugins.forEach(plugin => {
                    plugin.apply(this);
                });
            }
            this.hooks.afterPlugins.call();//发射加载完成事件
        }
        run() {

        }

    }
    module.exports = Compiler;

### 4. 开始编译

    const {SyncHook} = require('tapable');
    const path = require('path');
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    const escodegen = require('escodegen');
    const ejs = require('ejs');
    const fs = require('fs');
    class Compiler{
        constructor(options){
            this.options = options;
            this.hooks = {
                entryOption:new SyncHook(['compiler']),
                afterPlugins:new SyncHook(['compiler']),
                run:new SyncHook(['compiler']),
                compile:new SyncHook(['compiler']),
                afterCompile:new SyncHook(['compiler']),
                emit:new SyncHook(['compiler']),
                done:new SyncHook(['compiler'])
            }
            let plugins = options.plugins;
            plugins.forEach((plugin)=>{
                plugin.apply(this);
            });
            this.hooks.afterPlugins.call(this);
        }
        run(){
            const compiler = this;
            this.hooks.run.call(compiler);
            let root = process.cwd();//webpack所在目录的绝对路
            let {
                entry,
                output:{
                    path:dist,
                    filename
                },
                module:{
                    rules
                }
            } = this.options;//入口 输出 目录 和文件名
            let modules = {};//存放所有的模块
            let entryId; //入口ID 所有的ID都是相对于root根目录的
            this.hooks.compile.call(compiler);
            parseModule(path.resolve(root,entry),true);//解析模块
            this.hooks.afterCompile.call(compiler);
            let tmpl = fs.readFileSync(path.join(__dirname,'main.ejs'),'utf8');
            let bundle = ejs.compile(tmpl)({modules,entryId});
            fs.writeFileSync(path.join(dist,filename),bundle);
            this.hooks.emit.call(compiler);
            this.hooks.done.call(compiler);

            function parseModule(modulePath,isEntry){//解析模块和依赖的模块 路径是一个绝对路径
                let source = fs.readFileSync(modulePath,'utf8');//读取此模块的文件内容
                for(let i=0;i<rules.length;i++){
                    let rule = rules[i];
                    if(rule.test.test(modulePath)){
                        let use = rule.use || rule.loader
                        if(use instanceof Array){
                            for(let j=use.length-1;j>=0;j--){
                                let loader = require(path.resolve(root,'node_modules',use[j]));
                                source = loader(source);
                            }
                        }else{
                            let loader = require(path.resolve(root,'node_modules',typeof use == 'string'?use:use.loader));
                        }
                        break;
                    }
                }
                let moduleId = './'+path.relative(root,modulePath);
                if(isEntry) entryId = moduleId;
                let parseResult = parse(source,path.dirname(moduleId));
                let requires = parseResult.requires;//取得依赖的模块数组
                modules[moduleId] = parseResult.source;//记录ID和转换后代码的对应关系
                if(requires && requires.length>0){
                    requires.forEach(require=>{
                        parseModule(path.join(root,require))
                    });
                }
            }

            //源码和父路径
            function parse(source,parentPath){
            let ast = esprima.parse(source);
            let requires = [];
            estraverse.replace(ast,{
                enter(node,parent){
                        if(node.type == 'CallExpression' && node.callee.name == 'require'){
                            let name = node.arguments[0].value;//取得参数里的值
                            name += (name.lastIndexOf('.')>0?'':'.js');//添加后缀名
                            let moduleId = './'+path.join(parentPath,name);//取得此模块ID,也是相对于根路径的
                            requires.push(moduleId);
                            node.arguments = [{type:'Literal',value:moduleId}];
                            return node;
                        }
                    return node;
                }
            });
            source = escodegen.generate(ast);//重新生成代码
            return {source,requires};//转换后的代码和依赖的模块
            }
        }
    }

    module.exports = Compiler;

### 5. 产出文件

    /******/ (function(modules) { // webpackBootstrap
    /******/     // The module cache
    /******/     var installedModules = {};
    /******/
    /******/     // The require function
    /******/     function require(moduleId) {
    /******/
    /******/         // Check if module is in cache
    /******/         if(installedModules[moduleId]) {
    /******/             return installedModules[moduleId].exports;
    /******/         }
    /******/         // Create a new module (and put it into the cache)
    /******/         var module = installedModules[moduleId] = {
    /******/             i: moduleId,
    /******/             l: false,
    /******/             exports: {}
    /******/         };
    /******/
    /******/         // Execute the module function
    /******/         modules[moduleId].call(module.exports, module, module.exports, require);
    /******/
    /******/         // Flag the module as loaded
    /******/         module.l = true;
    /******/
    /******/         // Return the exports of the module
    /******/         return module.exports;
    /******/     }
    /******/     // Load entry module and return exports
    /******/     return require(require.s = "<%-entryId%>");
    /******/ })
    /************************************************************************/
    /******/ ({
    <%
    for(let id in modules){
        let source = modules[id];%>
    /***/ "<%-id%>":
    /***/ function(module, exports,require) {

    eval(`<%-source%>`);

    /***/ },
    <%}%>
    /******/ });

### 6. 支持loader

    var less = require('less');
    module.exports = function (source) {
        let css;
        less.render(source, (err, output) => {
            css = output.css;
        });
        return css.replace(/\n/g,'\\n','g');
    }

### 7. 支持插件

    const qiniu=require('qiniu');
    const path=require('path');
    const fs=require('fs');
    class UploadPlugin{
    constructor(options) {
        this.options=options||{};
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('UploadPlugin', (compilation) => {
            let {bucket='video',domain="img.zxb.cn",accessKey='fi5imW04AkxJItuFbbRy1ffH1HIoo17HbWOXw5fV',secretKey='ru__Na4qIor4-V7U4AOJyp2KBUYEw1NWduiJ4Pby'}=this.options;
            var mac=new qiniu.auth.digest.Mac(accessKey,secretKey);
            var options = {
                scope: bucket,
            };
            var putPolicy = new qiniu.rs.PutPolicy(options);
            var uploadToken=putPolicy.uploadToken(mac);
            var config = new qiniu.conf.Config();

            console.log(compilation.assets);

            let promises = Object.keys(compilation.assets).map(asset => upload(asset));
            Promise.all(promises).then(function (data) {
                console.log('发布CDN成功!');
            });

            function upload(filename) {
                return new Promise(function (resolve,reject) {
                    var localFile=path.join(__dirname,'../build',filename);
                    var formUploader = new qiniu.form_up.FormUploader(config);
                    var putExtra = new qiniu.form_up.PutExtra();
                    var key=filename;
                    formUploader.putFile(uploadToken,key,localFile,putExtra,function (err,body,info) {
                        if (err)
                            reject(err);
                        else
                            resolve(body)
                    });
                });
            }
        });
    }
    }
    module.exports=UploadPlugin;

### 8. 测试案例

index.js

    let name = require('./a/a1');
    require('./index.less');
    alert(name);

index.less

    body{color:red;}

webpack.config.js

    const path = require('path');
    const AfterCompilerWebpackPlugin = require('./src/plugins/after-compiler-webpack-plugin');
    const CompilerWebpackPlugin = require('./src/plugins/compiler-webpack-plugin');
    const DoneWebpackPlugin = require('./src/plugins/done-webpack-plugin');
    const EmitWebpackPlugin = require('./src/plugins/emit-webpack-plugin');
    const OptionWebpackPlugin = require('./src/plugins/option-webpack-plugin.js');
    const RunWebpackPlugin = require('./src/plugins/run-webpack-plugin');
    module.exports = {
        entry: './src/index.js',
        output: {
            path: path.resolve('dist'),
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.less/,
                    use: ['style-loader', 'less-loader']
                }
            ]
        },
        plugins: [
            new AfterCompilerWebpackPlugin(),
            new CompilerWebpackPlugin(),
            new DoneWebpackPlugin(),
            new EmitWebpackPlugin(),
            new OptionWebpackPlugin(),
            new RunWebpackPlugin()
        ]
    }

plugins

    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('run-webpack-plugin');
            });
        }
    }
    module.exports=Plugin;

    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('run-webpack-plugin');
            });
        }
    }
    module.exports=Plugin;

    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('compiler');
            });
        }
    }
    module.exports=Plugin;


    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('after compiler');
            });
        }
    }
    module.exports=Plugin;

    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('emit');
            });
        }
    }
    module.exports=Plugin;

    class Plugin{
        apply(compiler) {
            compiler.hooks.entryOption.tap('Plugin',(option) => {
                console.log('done');
            });
        }
    }
    module.exports=Plugin;























