/*
 * @Description: webpack的基本通用配置 
 * @Author: james.zhang 
 * @Date: 2019-06-15 16:03:24 
 * @Last Modified by: james.zhang
 * @Last Modified time: 2019-06-15 17:39:22
 */

const path = require('path');
const webpack = require('webpack');

// 你经过多次打包后会发现，每次打包都会在dist目录下边生成一堆文件，但是上一次的打包的文件还在，我们需要每次打包时清除 dist 目录下旧版本文件
// 注意这个引入的坑，最新版的需要这样引入，而不是直接const CleanWebpackPlugin
const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin");
// 使用 HtmlWebpackPlugin插件，来生成 html， 并将每次打包的js自动插入到你的 index.html 里面去，而且它还可以基于你的某个 html 模板来创建最终的 index.html，也就是说可以指定模板
const HTMLWebpackPlugin = require("html-webpack-plugin");
// 如果不做配置，我们的css是直接打包进js里面的，我们希望能单独生成css文件。 因为单独生成css,css可以和js并行下载，提高页面加载效率
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 使用happypack并发执行任务
// 运行在 Node.之上的Webpack是单线程模型的，也就是说Webpack需要一个一个地处理任务，不能同时处理多个任务。 Happy Pack 就能让Webpack做到这一点，它将任务分解给多个子进程去并发执行，子进程处理完后再将结果发送给主进程。
const HappyPack = require('happypack');
const os = require('os');
// 配置线程池：根据系统模块的cpu核数来调度线程
const happyPackthreadPool = HappyPack.ThreadPool({size: os.cpus().length})

module.exports = {
    entry: ["./src/index.js"],
    output: {
        // 输出目录
        path: path.resolve(__dirname, "../dist"),
        // 文件名称
        // filename: "bundle.js",
        // 使用静态资源路径 
        // CDN通过将资源部署到世界各地，使得用户可以就近访问资源，加快访问速度。要接入CDN，需要把网页的静态资源上传到CDN服务上，在访问这些资源时，使用CDN服务提供的URL。
        // publicPath: '//[cdn].com' // 指定存放JS文件的CDN地址 
    },
    resolve: {
        // 添加扩展名后，可以在import或者require的时候不添加扩展名，会依次尝试添加扩展名进行匹配查询
        extensions: [".js", ".jsx", ".tsx"],
        // 配置路径别名后，可以加快webpack查找模块的速度
        alias: {
            "@": path.resolve(__dirname, "../src"),
            "pages": path.resolve(__dirname, "../src/pages"),
            "router": path.resolve(__dirname, "../src/router")
        }
    },
    module: {
        rules: [{
            // cnpm i babel-loader @babel/core @babel/preset-env -D 
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: "happypack/loader?id=happyBabel"
                }
            ]
        }, {
            test: /\.(sc|sa|c)ss$/,
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader", // 编译css 处理css中url引入文件问题
                'postcss-loader', // 配合postcss-cssnext -> 自动增加前缀， postcss-cssnext允许你使用未来的css特性，并做一些兼容处理
                'sass-loader' // 编译scss
            ]
        }, {
            // 对图片的处理
            // file-loader 解决css等文件中引入图片路径的问题
            // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
            test: /\.(png|jpe?g|gif|svg)$/, // 处理图片资源
            use: {
                loader: "url-loader",
                options: {
                    outputPath: "images/", // 图片输出的路径
                    limit: 10 * 1024 // 10kb之内处理成base64字符串，超过10kb的使用file-loader 进行拷贝
                }
            }
        }, {
            // 对字体图标的处理
            test: /\.(eot|ttf|woff2?|svg)$/,
            use: {
                loader: 'url-loader',
                options: {
                    name: '[name]-[hash:5].min.[ext]',
                    limit: 5000,  // fonts file size <= 5KB, use 'base64'; else, output svg file
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
            template: path.resolve(__dirname, '..', "src/template.html"), // 指定模板路径
            minify: {
                collapseWhitespace: true // 去除空白
            }
        }),
        // 暴露全局变量
        new webpack.ProvidePlugin({
            $: 'jquery',  // npm
            jQuery: 'jQuery' // 本地的jquery文件
        }),
        // happypack
        new HappyPack({
            // 用唯一的标识id, 来代表当前的HappyPack要处理一类特定的文件
            id: 'happyBabel',
            // 如何处理.js文件，用法和loader配置一样
            loaders: [{
                loader: 'babel-loader?cacheDirectory=true'
            }],
            //共享进程池threadPool: HappyThreadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
            threadPool: happyPackthreadPool,
            //允许 HappyPack 输出日志
            verbose: true,
        }),
        // 如果不做配置，我们的css是直接打包进js里面的，我们希望能单独生成css文件。 因为单独生成css,css可以和js并行下载，提高页面加载效率
        // css单独提取
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    performance: false // 关闭性能提示
}