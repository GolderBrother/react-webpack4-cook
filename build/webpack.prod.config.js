/*
 * @Description: 生产环境下的webpack额外配置 
 * @Author: james.zhang 
 * @Date: 2019-06-15 16:03:12 
 * @Last Modified by: james.zhang
 * @Last Modified time: 2019-06-15 17:54:47
 */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.base.config');

// css Tree Shaking
const PurifyCSSWebpack = require("purifycss-webpack");
const glob = require("glob-all");

// 它会将我们打包后的 dll.js 文件注入到我们生成的 index.html 中
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

// 简言之：在你第一次访问一个网站的时候，如果成功，做一个缓存，当服务器挂了之后，你依然能够访问这个网页 ，这就是PWA。那相信你也已经知道了，这个只需要在生产环境，才需要做PWA的处理，以防不测。
const WorkBoxPlugin = require('workbox-webpack-plugin'); //  引入 PWA 插件

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        // 输出目录
        path: path.resolve(__dirname, '../dist'),
        // 文件名称
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js'
    },
    devtool: "cheap-module-source-map", // 线上生产环境配置
    optimization: {
        // js tree shaking，清除到代码中无用的js代码，只支持import方式引入，不支持commonjs的方式引入
        // 注意，这边的前提条件是 mode 为 production才生效，development模式是不行生效的，因为webpack为了方便你的调试
        usedExports: true,
        // 打包完后，所有页面只生成了一个bundle.js,当我们首屏加载的时候，就会很慢。因为他也下载了别的页面的js了,也就是说，执行完毕之前，页面是 完！全！空！白！的！。 如果每个页面单独打包自己的js，就可以在进入页面时候再加载自己 的js，首屏加载就可以快很多
        splitChunks: {
            // 所有的chunks代码块的公共部分抽离出来为一个单独的文件
            chunks: 'all',
            cacheGroups: {
                // 公共代码打包分组配置
                jquery: {
                    name: 'jquery',
                    // []内要使用两个转义符号： \\
                    test: /[\\/]node_modules[\\/]jquery[\\/]/
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors'
                }
            }
        },
    },
    plugins: [
        // 清除无用的css
        new PurifyCSSWebpack({
            // 需要做 css tree shaking的目录文件
            paths: glob.sync([
                // 请注意，我们同样需要对 html 文件进行 tree shaking
                path.resolve(__dirname, '..', 'src/*.html'),
                path.resolve(__dirname, '..', 'src/*.js'),
                path.resolve(__dirname, '..', 'src/**/*.jsx')
            ])
        }),
        // PWA配置
        new WorkBoxPlugin.GenerateSW({
            // ServiceWorker 是否应该在任何现有客户端激活等待生命周期阶段
            clientsClaim: true,
            // ServiceWorker 是否应该跳过等待的生命周期阶段
            skipWaiting: true
        }),
        // 它会将我们打包后的 dll.js 文件注入到我们生成的 index.html 中
        new AddAssetHtmlWebpackPlugin({
            filepath: path.resolve(__dirname, '../dll/jquery.dll.js') // 对应的 dll 文件路径
        }),
        // Dllplugin里的path，会输出一个vendor-manifest.json，这是用来做关联id的，打包的时候不会打包进去，所以不用放到static里
        // dll的做法就等于是，事先先打包好依赖库，然后只对每次都修改的js做打包。
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, '..', 'dll/jquery-manifest.json')
        })
    ]
})