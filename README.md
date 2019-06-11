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



## 2. 从零开始构建一个简易版的Vue webpack打包环境













