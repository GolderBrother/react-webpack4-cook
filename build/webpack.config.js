const path = require("path");
const webpack = require("webpack");
// 你经过多次打包后会发现，每次打包都会在dist目录下边生成一堆文件，但是上一次的打包的文件还在，我们需要每次打包时清除 dist 目录下旧版本文件
// 注意这个引入的坑，最新版的需要这样引入，而不是直接const CleanWebpackPlugin
const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin");
// 使用 HtmlWebpackPlugin插件，来生成 html， 并将每次打包的js自动插入到你的 index.html 里面去，而且它还可以基于你的某个 html 模板来创建最终的 index.html，也就是说可以指定模板
const HTMLWebpackPlugin = require("html-webpack-plugin");
// 如果不做配置，我们的css是直接打包进js里面的，我们希望能单独生成css文件。 因为单独生成css,css可以和js并行下载，提高页面加载效率
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// css Tree Shaking
const PurifyCSSWebpack = require("purifycss-webpack");
const glob = require("glob-all");

// 它会将我们打包后的 dll.js 文件注入到我们生成的 index.html 中
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

// 使用happypack并发执行任务
// 运行在 Node.之上的Webpack是单线程模型的，也就是说Webpack需要一个一个地处理任务，不能同时处理多个任务。 Happy Pack 就能让Webpack做到这一点，它将任务分解给多个子进程去并发执行，子进程处理完后再将结果发送给主进程。
const HappyPack = require('happypack');
const os = require('os');
// 配置线程池：根据系统模块的cpu核数来调度线程
const happyPackthreadPool = HappyPack.ThreadPool({size: os.cpus().length});

// 简言之：在你第一次访问一个网站的时候，如果成功，做一个缓存，当服务器挂了之后，你依然能够访问这个网页 ，这就是PWA。那相信你也已经知道了，这个只需要在生产环境，才需要做PWA的处理，以防不测。
const WorkBoxPlugin = require('workbox-webpack-plugin'); //  引入 PWA 插件

module.exports = {
    // webpack4只要在生产模式下，代码就会自动压缩
    mode: "production",
    entry: ["./src/index.js"],
    devtool: "cheap-module-eval-source-map", // 开发环境配置
    devtool: "cheap-module-source-map", // 线上生成配置
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, './dist'),
        host: '0.0.0.0',
        port: 8080,
        historyApiFallback: true, // 该选项的作用所有的404都连接到index.html
        proxy: {
            // 代理到后端的服务地址，会拦截所有以api开头的请求地址
            "^api": "http://localhost:3000"
        }
    },
    output: {
        // 输出目录
        path: path.resolve(__dirname, "../dist"),
        // 文件名称
        filename: "bundle.js",
        // 使用静态资源路径 
        // CDN通过将资源部署到世界各地，使得用户可以就近访问资源，加快访问速度。要接入CDN，需要把网页的静态资源上传到CDN服务上，在访问这些资源时，使用CDN服务提供的URL。
        publicPath: '//[cdn].com' // 指定存放JS文件的CDN地址 
    },
    resolve: {
        // 添加扩展名后，可以在import或者require的时候不添加扩展名，会依次尝试添加扩展名进行匹配查询
        extension: [".js", ".jsx", ".tsx"],
        // 配置路径别名后，可以加快webpack查找模块的速度
        alias: {
            "@": path.resolve(__dirname, "../src"),
            "pages": path.resolve(__dirname, "../src/pages"),
            "router": path.resolve(__dirname, "../src/router")
        }
    },
    optimization: {
        // 打包完后，所有页面只生成了一个bundle.js,当我们首屏加载的时候，就会很慢。因为他也下载了别的页面的js了,也就是说，执行完毕之前，页面是 完！全！空！白！的！。 如果每个页面单独打包自己的js，就可以在进入页面时候再加载自己 的js，首屏加载就可以快很多
        splitChunks: {
            // 所有的chunks代码块的公共部分抽离出来为一个单独的文件
            chunks: 'all'
        },
        // js tree shaking，清除到代码中无用的js代码，只支持import方式引入，不支持commonjs的方式引入
        // 注意，这边的前提条件是 mode 为 production才生效，development模式是不行生效的，因为webpack为了方便你的调试
        usedExports:true
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [{
                // loader: 'babel-loader',
                // 一个loader对应一个id
                loader: "happypack/loader?id=jamesBabel"
            }]
        }, {
            test: /\.(sa|sc)ss/,
            excluse: /node_modules/,
            use: [
                // 'style-loader', // 在head中创建style标签，并将css添加进去 不在需要style-loader，已经通过下面的分离处理
                MiniCssExtractPlugin.loader, 
                'css-loader', // 编译css 
                // postcss-cssnext -> 自动增加前缀， postcss-cssnext允许你使用未来的css特性，并做一些兼容处理
                'postcss-loader',
                'sass-loader' // 编译scss
            ]
        }, {
            // 对图片的处理
            // file-loader 解决css等文件中引入图片路径的问题
            // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
            test: /\.(png|jp(e)?g|gif|svg)/,
            loader: {
                use: 'url-loader',
                options: {
                    limit: 10 * 1024,
                    outputPath: "images/" // 图片输出的路径
                }
            }
        }, {
            // 对字体图标的处理
            test: /\.(eot|woff2|ttf|svg)/,
            loader: {
                use: 'url-loader',
                options: {
                    name: '[name]-[hash:5].min.[ext]',
                    limit: 5000,
                    publicPath: 'fonts/',
                    outputPath: 'fonts/'
                }
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        // 我们将使用 HtmlWebpackPlugin插件，来生成 html， 并将每次打包的js自动插入到你的 index.html 里面去，而且它还可以基于你的某个 html 模板来创建最终的 index.html，也就是说可以指定模板
        new HTMLWebpackPlugin({
            filename: 'index.html', // 最终创建的文件名
            template: path.join(__dirname, 'src/template.html') // 指定模板路径
        }),
        //开启HMR(热替换功能,替换更新部分,不重载页面！) 相当于在命令行加 --hot
        new webpack.HotModuleReplacementPlugin(),
        // 如果不做配置，我们的css是直接打包进js里面的，我们希望能单独生成css文件。 因为单独生成css,css可以和js并行下载，提高页面加载效率
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkName: "[id].css"
        }),
        // 暴露全局变量
        new webpack.ProvidePlugin({
            $: 'jquery',  // npm
            jQuery: 'jQuery' // 本地的jquery文件
        }),
        // 指定环境，定义环境变量
        new webpack.DefinePlugin({
            'process.env': {
                VUEP_BASE_URL: JSON.stringify('http://localhost:9000')
            }
        }),
        // 清除无用的css
        new PurifyCSSWebpack({
            // 需要做 css tree shaking的目录文件
            paths: glob.sync([
                // 请注意，我们同样需要对 html 文件进行 tree shaking
                path.resolve(__dirname, './src/*.html'),
                path.resolve(__dirname, './src/*.js'),
                path.resolve(__dirname, './src/**/*.jsx')
            ])
        }),
        // 它会将我们打包后的 dll.js 文件注入到我们生成的 index.html 中
        new AddAssetHtmlWebpackPlugin({
             filename: path.resolve(__dirname, '../dll/jquery.dll.js')   
        }),
        new webpack.DLLReferencePlugin({
            manifest: path.resolve(__dirname, '..', 'dll/jquery-manifest.json')
        }),
        new HappyPack({
            // 用唯一的标识id, 来代表当前的HappyPack要处理一类特定的文件
            id: 'jamesBabel',
            // 如何处理.js文件，用法和loader配置一样
            loaders: ['babel-loader?cacheDirectory'],
            threadPool: happyPackthreadPool,
        }),
        // PWA配置
        new WorkBoxPlugin.GenerateSW({
            // ServiceWorker 是否应该在任何现有客户端激活等待生命周期阶段
            clientsClaim: true,
            // ServiceWorker 是否应该跳过等待的生命周期阶段
            skipWaiting: true
        })
    ],
    devServer: {}
}