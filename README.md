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


## 4. webpack制作loader


## 5. webpack制作plugin


















